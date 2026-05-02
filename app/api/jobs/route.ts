import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http/json-response";
import { prisma } from "@/lib/db";

import type { ApiSuccess } from "@/types/api";

export type JobListItem = {
  id: string;
  title: string;
  location: string | null;
  department: string | null;
  category: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  published_at: string | null;
  expires_at: string | null;
  headcount: number;
  created_at: string;
};

export type JobsListResponse = ApiSuccess<{ jobs: JobListItem[] }>;

/**
 * GET /api/jobs
 * Trả danh sách tin tuyển dụng đang hoạt động (status = active).
 */
export async function GET() {
  try {
    const jobs = await prisma.jobs.findMany({
      where: { status: "active" },
      orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
      select: {
        id: true,
        title: true,
        location: true,
        department: true,
        category: true,
        employment_type: true,
        salary_min: true,
        salary_max: true,
        published_at: true,
        expires_at: true,
        headcount: true,
        created_at: true,
      },
    });

    // Chuyển Date → ISO string để serialize an toàn qua JSON
    const serialized: JobListItem[] = jobs.map((j) => ({
      ...j,
      published_at: j.published_at?.toISOString() ?? null,
      expires_at: j.expires_at?.toISOString() ?? null,
      created_at: j.created_at.toISOString(),
    }));

    return NextResponse.json({ success: true, data: { jobs: serialized } } satisfies JobsListResponse);
  } catch (e) {
    console.error("[GET /api/jobs]", e);
    return jsonError(500, "Không thể tải danh sách tin tuyển dụng");
  }
}
