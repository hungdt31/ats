import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { interview_scores_result, applications_status } from "@prisma/client";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role === "candidate") {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const params = await props.params;
    const interviewId = params.id;
    const body = await request.json();

    const { result, feedback, next_status } = body;

    if (!result) {
      return jsonError(400, "Vui lòng chọn kết quả đánh giá cuối cùng (pass/fail/hold).");
    }

    // 1. Kiểm tra phân quyền: Chỉ người được assign làm final_reviewer mới được kết luận
    const assignment = await prisma.interview_evaluators.findUnique({
      where: {
        interview_id_user_id: {
          interview_id: interviewId,
          user_id: session.user.id,
        },
      },
    });

    if (!assignment || assignment.role !== "final_reviewer") {
      return jsonError(403, "Chỉ người đánh giá cuối cùng (final reviewer) mới được đưa ra kết luận cuối.");
    }

    // 2. Tìm phỏng vấn và application tương ứng
    const interview = await prisma.interviews.findUnique({
      where: { id: interviewId },
      include: { applications: true },
    });

    if (!interview) {
      return jsonError(404, "Không tìm thấy lịch phỏng vấn.");
    }

    const application = interview.applications;

    // Xác định trạng thái tiếp theo cho application
    let targetAppStatus: applications_status = application.status;
    if (result === "pass") {
      targetAppStatus = (next_status as applications_status) || "offered";
    } else if (result === "fail") {
      targetAppStatus = "rejected";
    } else if (result === "hold") {
      targetAppStatus = "interviewing";
    }

    // 3. Thực hiện trong transaction với timeout 20s
    const finalResult = await prisma.$transaction(async (tx) => {
      // Lưu kết quả phỏng vấn vào bảng interview_results
      const ir = await tx.interview_results.upsert({
        where: {
          interview_id: interviewId,
        },
        update: {
          reviewer_id: session.user.id,
          result: result as interview_scores_result,
          feedback: feedback || null,
          created_at: new Date(),
        },
        create: {
          interview_id: interviewId,
          reviewer_id: session.user.id,
          result: result as interview_scores_result,
          feedback: feedback || null,
        },
      });

      // Cập nhật trạng thái cuộc phỏng vấn thành completed
      await tx.interviews.update({
        where: { id: interviewId },
        data: { status: "completed" },
      });

      // Cập nhật trạng thái application nếu có thay đổi
      if (targetAppStatus !== application.status) {
        await tx.applications.update({
          where: { id: application.id },
          data: { status: targetAppStatus },
        });

        // Ghi nhận lịch sử thay đổi trạng thái
        await tx.application_status_history.create({
          data: {
            application_id: application.id,
            changed_by: session.user.id,
            from_status: application.status,
            to_status: targetAppStatus,
            note: `Hội đồng kết luận: ${result.toUpperCase()}. Nhận xét: ${feedback || "Không có"}`,
          },
        });
      }

      return ir;
    }, {
      timeout: 20000
    });

    return NextResponse.json({
      success: true,
      data: finalResult,
    });
  } catch (error) {
    console.error("[POST /api/dashboard/interviews/[id]/result] Error:", error);
    return jsonError(500, "Không thể lưu kết quả đánh giá cuối cùng.");
  }
}
