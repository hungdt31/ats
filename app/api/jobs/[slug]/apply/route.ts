import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

type Params = { params: Promise<{ slug: string }> };

/**
 * POST /api/jobs/[slug]/apply
 * Ứng viên nộp đơn ứng tuyển. Dùng slug để tra cứu job, tránh lộ UUID.
 */
export async function POST(req: Request, { params }: Params) {
  const session = await getSession();

  if (!session || session.user.role !== "candidate") {
    return jsonError(401, "Bạn phải đăng nhập với tư cách ứng viên để ứng tuyển.");
  }

  const { slug } = await params;
  const candidateId = session.user.id;

  try {
    // Tra cứu job theo slug, chỉ cho phép nộp khi status = active
    const job = await prisma.jobs.findFirst({
      where: { slug, status: "active" },
      select: { id: true },
    });

    if (!job) {
      return jsonError(404, "Không tìm thấy tin tuyển dụng");
    }

    const jobId = job.id;

    // Kiểm tra đã ứng tuyển chưa
    const existingApplication = await prisma.applications.findUnique({
      where: {
        job_id_candidate_id: { job_id: jobId, candidate_id: candidateId },
      },
    });

    if (existingApplication) {
      return jsonError(400, "Bạn đã ứng tuyển vào vị trí này rồi.");
    }

    const body = await req.json();
    const { cv_file_url, cv_filename, cover_letter } = body;

    if (!cv_file_url) {
      return jsonError(400, "Vui lòng cung cấp link CV của bạn.");
    }

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

    return NextResponse.json({ success: true, data: { application } });
  } catch (error) {
    console.error(`[POST /api/jobs/${slug}/apply] Error:`, error);
    return jsonError(500, "Không thể xử lý yêu cầu ứng tuyển của bạn.");
  }
}
