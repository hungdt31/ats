import "server-only";

import { prisma } from "@/lib/db";

export { employmentTypeLabel, formatSalaryRange } from "./jobs-utils";

/** Tin đang tuyển (`active`), dùng cho landing và preview. */
export async function getFeaturedJobs(limit = 6) {
  return prisma.jobs.findMany({
    where: { status: "active" },
    orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
    take: limit,
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
      created_at: true,
    },
  });
}

/** Danh sách đầy đủ tin active cho `/jobs`. */
export async function getActiveJobs() {
  return prisma.jobs.findMany({
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
      created_at: true,
    },
  });
}


