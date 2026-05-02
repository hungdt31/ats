import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { interview_scores_result } from "@prisma/client";

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
      overall_score,
      strengths,
      weaknesses,
      feedback,
      result,
      is_final,
    } = body;

    if (!result) {
      return jsonError(400, "Vui lòng chọn kết quả đánh giá (pass/fail/hold).");
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
        overall_score: overall_score ? parseInt(overall_score, 10) : null,
        strengths: strengths || null,
        weaknesses: weaknesses || null,
        feedback: feedback || null,
        result: result as interview_scores_result,
        is_final: is_final || false,
      },
      create: {
        interview_id: interviewId,
        evaluator_id: session.user.id,
        technical_score: technical_score ? parseInt(technical_score, 10) : null,
        communication_score: communication_score ? parseInt(communication_score, 10) : null,
        cultural_fit_score: cultural_fit_score ? parseInt(cultural_fit_score, 10) : null,
        overall_score: overall_score ? parseInt(overall_score, 10) : null,
        strengths: strengths || null,
        weaknesses: weaknesses || null,
        feedback: feedback || null,
        result: result as interview_scores_result,
        is_final: is_final || false,
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
