import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.user.role === "candidate") {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || "";
    const status = searchParams.get("status") || "";
    const source = searchParams.get("source") || "";

    // Build prisma query filters
    const where: any = {};
    if (jobId) where.job_id = jobId;
    if (status) where.status = status;
    if (source) where.source_channel = source;

    const applications = await prisma.applications.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        jobs: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { applied_at: "desc" },
    });

    // Also get all jobs for the select filter dropdown
    const jobs = await prisma.jobs.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { applications, jobs },
    });
  } catch (error) {
    console.error("[GET /api/dashboard/applications] Error:", error);
    return jsonError(500, "Không thể tải danh sách đơn ứng tuyển.");
  }
}
