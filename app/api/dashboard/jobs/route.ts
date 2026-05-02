import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { jobs_status } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.user.role === "candidate") {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status) where.status = status as jobs_status;

    const jobs = await prisma.jobs.findMany({
      where,
      include: {
        users: { select: { fullName: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/jobs] Error:", error);
    return jsonError(500, "Không thể tải danh sách tin tuyển dụng.");
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền tạo tin.");
  }

  try {
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

    const job = await prisma.jobs.create({
      data: {
        created_by: session.user.id,
        title,
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
    console.error("[POST /api/dashboard/jobs] Error:", error);
    return jsonError(500, "Không thể tạo tin tuyển dụng.");
  }
}
