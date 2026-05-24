import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

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

    const {
      technical_score,
      communication_score,
      cultural_fit_score,
      problem_solving_score,
      strengths,
      weaknesses,
      feedback,
    } = body;

    // 1. Kiểm tra phân quyền: Chỉ người được assign trong buổi phỏng vấn mới được chấm điểm
    const assignment = await prisma.interview_evaluators.findUnique({
      where: {
        interview_id_user_id: {
          interview_id: interviewId,
          user_id: session.user.id,
        },
      },
    });

    if (!assignment) {
      return jsonError(403, "Bạn không được phân công đánh giá cho buổi phỏng vấn này.");
    }

    // Upsert to handle updates if evaluator already has a score for this interview
    const score = await prisma.interview_scores.upsert({
      where: {
        interview_id_evaluator_id: {
          interview_id: interviewId,
          evaluator_id: session.user.id,
        },
      },
      update: {
        technical_score: technical_score ? parseInt(technical_score, 10) : null,
        communication_score: communication_score ? parseInt(communication_score, 10) : null,
        cultural_fit_score: cultural_fit_score ? parseInt(cultural_fit_score, 10) : null,
        problem_solving_score: problem_solving_score ? parseInt(problem_solving_score, 10) : null,
        strengths: strengths || null,
        weaknesses: weaknesses || null,
        feedback: feedback || null,
      },
      create: {
        interview_id: interviewId,
        evaluator_id: session.user.id,
        technical_score: technical_score ? parseInt(technical_score, 10) : null,
        communication_score: communication_score ? parseInt(communication_score, 10) : null,
        cultural_fit_score: cultural_fit_score ? parseInt(cultural_fit_score, 10) : null,
        problem_solving_score: problem_solving_score ? parseInt(problem_solving_score, 10) : null,
        strengths: strengths || null,
        weaknesses: weaknesses || null,
        feedback: feedback || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: score,
    });
  } catch (error) {
    console.error("[POST /api/dashboard/interviews/[id]/score] Error:", error);
    return jsonError(500, "Không thể lưu bảng điểm đánh giá.");
  }
}
