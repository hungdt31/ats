import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { interviews_status } from "@prisma/client";

export async function GET(
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

    const interview = await prisma.interviews.findUnique({
      where: { id: interviewId },
      include: {
        applications: {
          include: {
            users: { select: { fullName: true, email: true } },
            jobs: { select: { title: true } },
          },
        },
        users: { select: { id: true, fullName: true, email: true } },
        interview_scores: {
          include: {
            users: { select: { fullName: true, email: true } },
          },
        },
      },
    });

    if (!interview) {
      return jsonError(404, "Không tìm thấy lịch phỏng vấn.");
    }

    return NextResponse.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/interviews/[id]] Error:", error);
    return jsonError(500, "Không thể tải thông tin phỏng vấn.");
  }
}

export async function PATCH(
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
    const { status } = await request.json();

    if (!status) {
      return jsonError(400, "Vui lòng chọn trạng thái mới.");
    }

    const interview = await prisma.interviews.update({
      where: { id: interviewId },
      data: { status: status as interviews_status },
    });

    return NextResponse.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("[PATCH /api/dashboard/interviews/[id]] Error:", error);
    return jsonError(500, "Không thể cập nhật trạng thái phỏng vấn.");
  }
}
