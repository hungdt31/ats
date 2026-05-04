import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http/json-response";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

import type { ApiSuccess } from "@/types/api";

export type JobDetail = {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  location: string | null;
  department: string | null;
  category: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  required_skills: string[];
  headcount?: number;
  hasApplied?: boolean;
};

export type JobDetailResponse = ApiSuccess<{ job: JobDetail }>;

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/jobs/[id]
 * Trả chi tiết một tin tuyển dụng active.
 */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  try {
    const job = await prisma.jobs.findFirst({
      where: { id, status: "active" },
    });

    if (!job) {
      return jsonError(404, "Không tìm thấy tin tuyển dụng");
    }

    const session = await getSession();
    let hasApplied = false;
    if (session?.user?.id && session.user.role === "candidate") {
      const app = await prisma.applications.findUnique({
        where: {
          job_id_candidate_id: {
            job_id: id,
            candidate_id: session.user.id,
          },
        },
        select: { id: true },
      });
      hasApplied = !!app;
    }

    const serialized: JobDetail = {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      location: job.location,
      department: job.department,
      category: job.category,
      employment_type: job.employment_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      published_at: job.published_at?.toISOString() ?? null,
      expires_at: job.expires_at?.toISOString() ?? null,
      created_at: job.created_at.toISOString(),
      required_skills: job.required_skills as string[] ?? [],
      headcount: job.headcount,
      hasApplied,
    };

    return NextResponse.json({ success: true, data: { job: serialized } } satisfies JobDetailResponse);
  } catch (e) {
    console.error(`[GET /api/jobs/${id}]`, e);
    return jsonError(500, "Không thể tải tin tuyển dụng");
  }
}
