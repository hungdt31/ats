import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();

  if (!session || session.user.role !== "candidate") {
    return jsonError(401, "Bạn phải đăng nhập với tư cách ứng viên để ứng tuyển.");
  }

  const { id: jobId } = await params;
  const candidateId = session.user.id;

  try {
    // Check if the job exists and is active
    const job = await prisma.jobs.findFirst({
      where: { id: jobId, status: "active" },
    });

    if (!job) {
      return jsonError(404, "Không tìm thấy tin tuyển dụng");
    }

    // Check if candidate already applied
    const existingApplication = await prisma.applications.findUnique({
      where: {
        job_id_candidate_id: {
          job_id: jobId,
          candidate_id: candidateId,
        },
      },
    });

    if (existingApplication) {
      return jsonError(400, "Bạn đã ứng tuyển vào vị trí này rồi.");
    }

    // Read payload
    const body = await req.json();
    const { cv_file_url, cv_filename, cover_letter } = body;

    if (!cv_file_url) {
      return jsonError(400, "Vui lòng cung cấp link CV của bạn.");
    }

    // Create the application
    const application = await prisma.applications.create({
      data: {
        job_id: jobId,
        candidate_id: candidateId,
        cv_file_url,
        cv_filename: cv_filename || "CV_Candidate.pdf",
        cover_letter: cover_letter || "",
        status: "applied",
      },
    });

    return NextResponse.json({
      success: true,
      data: { application },
    });
  } catch (error) {
    console.error(`[POST /api/jobs/${jobId}/apply] Error:`, error);
    return jsonError(500, "Không thể xử lý yêu cầu ứng tuyển của bạn.");
  }
}
