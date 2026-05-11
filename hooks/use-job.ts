import { useQuery } from "@tanstack/react-query";

import { apiGet, ApiError } from "@/lib/api-client";
import { queryKeys } from "@/hooks/query-keys";

import type { JobDetail, JobDetailResponse } from "@/app/api/jobs/[slug]/route";

/**
 * Chi tiết một tin tuyển dụng theo `slug`.
 * - enabled: false khi slug chưa có (tránh fetch với key rỗng).
 * - staleTime 5 phút.
 * - Không retry khi API trả 404/401.
 */
export function useJob(slug: string | undefined) {
  return useQuery<JobDetail, ApiError>({
    queryKey: queryKeys.jobs.detail(slug ?? ""),
    queryFn: async () => {
      const data = await apiGet<JobDetailResponse>(`/api/jobs/${slug}`);
      return data.data.job;
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 401)) return false;
      return failureCount < 2;
    },
  });
}
