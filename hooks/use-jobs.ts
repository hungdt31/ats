import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import { queryKeys } from "@/hooks/query-keys";

import type { JobListItem, JobsListResponse } from "@/app/api/jobs/route";

/**
 * Danh sách tin tuyển dụng active.
 * - staleTime 2 phút: dữ liệu jobs không thay đổi quá thường xuyên.
 */
export function useJobs() {
  return useQuery<JobListItem[]>({
    queryKey: queryKeys.jobs.lists(),
    queryFn: async () => {
      const data = await apiGet<JobsListResponse>("/api/jobs");
      return data.data.jobs;
    },
    staleTime: 2 * 60 * 1000, // 2 phút
  });
}
