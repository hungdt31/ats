import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { sendInterviewInviteEmail } from "@/lib/email/interview-templates";

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
    const applicationId = params.id;
    const body = await request.json();

    const {
      evaluators, // Array of { user_id: string, role: 'evaluator' | 'observer' | 'final_reviewer' }
      scheduled_at,
      duration_minutes,
      type,
      meeting_link,
      location,
      notes,
    } = body;

    if (!evaluators || !Array.isArray(evaluators) || evaluators.length === 0 || !scheduled_at || !type) {
      return jsonError(400, "Vui lòng nhập đầy đủ thông tin bắt buộc.");
    }

    const finalReviewerData = evaluators.find((ev) => ev.role === "final_reviewer");
    if (!finalReviewerData) {
      return jsonError(400, "Buổi phỏng vấn phải có đúng 1 người đánh giá cuối cùng (final reviewer).");
    }

    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: {
        users: true,
        jobs: true,
      },
    });

    if (!application) {
      return jsonError(404, "Không tìm thấy đơn ứng tuyển.");
    }

    // Resolve interviewer details for email invitation
    const evaluatorUsers = await prisma.user.findMany({
      where: { id: { in: evaluators.map((ev) => ev.user_id) } },
    });

    const leadInterviewer = evaluatorUsers.find((u) => u.id === finalReviewerData.user_id) || evaluatorUsers[0];
    const interviewerNames = evaluatorUsers.map((u) => `${u.fullName} (${evaluators.find((ev) => ev.user_id === u.id)?.role.toUpperCase()})`).join(", ");

    const recipientEmail = application.users.email;
    const scheduledDate  = new Date(scheduled_at);
    const durationMins   = duration_minutes ? parseInt(String(duration_minutes)) : 60;

    // 1. Gửi email mời phỏng vấn
    try {
      await sendInterviewInviteEmail(recipientEmail, application.jobs.title, {
        candidateName:   application.users.fullName,
        jobTitle:        application.jobs.title,
        scheduledAt:     scheduledDate,
        durationMinutes: durationMins,
        interviewType:   type as string,
        interviewerName: interviewerNames,
        interviewerEmail: leadInterviewer.email,
        meetingLink:     meeting_link ?? null,
        location:        location ?? null,
        notes:           notes ?? null,
      });
    } catch (emailErr) {
      console.error("[Interview email send error]", emailErr);
      return jsonError(500, "Không thể tạo lịch phỏng vấn vì gửi email thất bại.");
    }

    // 2. Lưu interview + interview_evaluators + email log vào DB trong transaction
    const newInterview = await prisma.$transaction(async (tx) => {
      const iv = await tx.interviews.create({
        data: {
          application_id: applicationId,
          scheduled_at:     scheduledDate,
          duration_minutes: durationMins,
          type:             type as any,
          meeting_link:     meeting_link ?? null,
          location:         location ?? null,
          notes:            notes ?? null,
        },
      });

      await tx.interview_evaluators.createMany({
        data: evaluators.map((ev) => ({
          interview_id: iv.id,
          user_id: ev.user_id,
          role: ev.role as any,
        })),
      });

      await tx.email_logs.create({
        data: {
          application_id: applicationId,
          recipient_id: application.candidate_id,
          sender_id: session.user.id,
          subject: `[ATS System] Thư mời phỏng vấn — ${application.jobs.title}`,
          type: "invite",
          status: "sent",
          sent_at: new Date(),
        },
      });

      return iv;
    });

    return NextResponse.json({
      success: true,
      message: "Tạo lịch phỏng vấn và gửi email thành công.",
      data: newInterview,
    });
  } catch (error: unknown) {
    console.error("[POST /api/dashboard/applications/[id]/interviews] Error:", error);
    return jsonError(500, "Đã xảy ra lỗi khi tạo lịch phỏng vấn.");
  }
}
