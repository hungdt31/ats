import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return jsonError(403, "Bạn không có quyền thực hiện hành động này.");
  }

  try {
    const params = await props.params;
    const jobId = params.id;

    // Kiểm tra tin tuyển dụng có tồn tại không
    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!job) {
      return jsonError(404, "Không tìm thấy tin tuyển dụng.");
    }

    if (job.status === "active") {
      return jsonError(400, "Tin tuyển dụng này đã được phê duyệt và hiển thị.");
    }

    // Cập nhật tin tuyển dụng
    const updatedJob = await prisma.jobs.update({
      where: { id: jobId },
      data: {
        status: "active",
        published_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error("[POST /api/dashboard/jobs/[id]/approve] Error:", error);
    return jsonError(500, "Không thể phê duyệt tin tuyển dụng.");
  }
}
