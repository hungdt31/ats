import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { interviews_status, interviews_type } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.user.role === "candidate") {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status) where.status = status as interviews_status;

    // Filter by interviewer if they are just an interviewer (not hr or admin)
    if (session.user.role === "interviewer") {
      where.interview_evaluators = {
        some: {
          user_id: session.user.id,
        },
      };
    }

    const interviews = await prisma.interviews.findMany({
      where,
      include: {
        applications: {
          include: {
            users: { select: { fullName: true, email: true } },
            jobs: { select: { title: true } },
          },
        },
        interview_evaluators: {
          include: {
            users: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { scheduled_at: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/interviews] Error:", error);
    return jsonError(500, "Không thể tải danh sách lịch phỏng vấn.");
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền lên lịch phỏng vấn.");
  }

  try {
    const body = await request.json();
    const {
      application_id,
      evaluators, // Array of { user_id: string, role: 'evaluator' | 'observer' | 'final_reviewer' }
      scheduled_at,
      duration_minutes,
      type,
      meeting_link,
      location,
      notes,
    } = body;

    if (!application_id || !evaluators || !Array.isArray(evaluators) || evaluators.length === 0 || !scheduled_at) {
      return jsonError(400, "Vui lòng cung cấp đầy đủ thông tin.");
    }

    const finalReviewers = evaluators.filter((ev) => ev.role === "final_reviewer");
    if (finalReviewers.length !== 1) {
      return jsonError(400, "Buổi phỏng vấn phải có đúng 1 người đánh giá cuối cùng (final reviewer).");
    }

    const interview = await prisma.$transaction(async (tx) => {
      const iv = await tx.interviews.create({
        data: {
          application_id,
          scheduled_at: new Date(scheduled_at),
          duration_minutes: duration_minutes ? parseInt(duration_minutes, 10) : 60,
          type: type as interviews_type,
          meeting_link: meeting_link || null,
          location: location || null,
          notes: notes || null,
        },
      });

      await tx.interview_evaluators.createMany({
        data: evaluators.map((ev) => ({
          interview_id: iv.id,
          user_id: ev.user_id,
          role: ev.role as any,
        })),
      });

      return iv;
    });

    return NextResponse.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("[POST /api/dashboard/interviews] Error:", error);
    return jsonError(500, "Không thể tạo lịch phỏng vấn.");
  }
}
