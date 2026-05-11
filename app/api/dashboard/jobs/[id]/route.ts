import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { jobs_status } from "@prisma/client";
import { uniqueSlug } from "@/lib/utils/slugify";

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
    const jobId = params.id;

    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return jsonError(404, "Không tìm thấy tin tuyển dụng.");
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/jobs/[id]] Error:", error);
    return jsonError(500, "Không thể tải tin tuyển dụng.");
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền cập nhật tin tuyển dụng.");
  }

  try {
    const params = await props.params;
    const jobId = params.id;
    const body = await request.json();

    const {
      title,
      description,
      requirements,
      benefits,
      location,
      department,
      salary_min,
      salary_max,
      employment_type,
      required_skills,
      headcount,
      status,
      expires_at,
    } = body;

    if (!title || !description) {
      return jsonError(400, "Vui lòng nhập đầy đủ tiêu đề và mô tả công việc.");
    }

    // Tái sinh slug khi title thay đổi (bỏ qua slug hiện tại của chính job này)
    const slug = await uniqueSlug(title, async (s) => {
      const existing = await prisma.jobs.findUnique({ where: { slug: s }, select: { id: true } });
      return !!existing && existing.id !== jobId;
    });

    const job = await prisma.jobs.update({
      where: { id: jobId },
      data: {
        title,
        slug,
        description,
        requirements: requirements || null,
        benefits: benefits || null,
        location: location || null,
        department: department || null,
        salary_min: salary_min ? parseInt(salary_min, 10) : null,
        salary_max: salary_max ? parseInt(salary_max, 10) : null,
        employment_type: employment_type || "full_time",
        required_skills: required_skills ? (required_skills as any) : undefined,
        headcount: headcount ? parseInt(headcount, 10) : 1,
        status: (status as jobs_status) || "draft",
        expires_at: expires_at ? new Date(expires_at) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("[PUT /api/dashboard/jobs/[id]] Error:", error);
    return jsonError(500, "Không thể cập nhật tin tuyển dụng.");
  }
}
