import { useQuery } from "@tanstack/react-query";

import { apiGet, ApiError } from "@/lib/api-client";
import { queryKeys } from "@/hooks/query-keys";

import type { JobDetail, JobDetailResponse } from "@/app/api/jobs/[id]/route";

/**
 * Chi tiết một tin tuyển dụng theo `id`.
 * - enabled: false khi id chưa có (tránh fetch với key rỗng).
 * - staleTime 5 phút.
 * - notFound: true khi API trả 404 (dùng để điều hướng notFound()).
 */
export function useJob(id: string | undefined) {
  return useQuery<JobDetail, ApiError>({
    queryKey: queryKeys.jobs.detail(id ?? ""),
    queryFn: async () => {
      const data = await apiGet<JobDetailResponse>(`/api/jobs/${id}`);
      return data.data.job;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: (failureCount, error) => {
      // Không retry khi 404 hoặc 401
      if (error instanceof ApiError && (error.status === 404 || error.status === 401)) return false;
      return failureCount < 2;
    },
  });
}
