import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api-client";
import { queryKeys } from "@/hooks/query-keys";

import type { MeResponse } from "@/types/api";
import type { PublicUser } from "@/types/api";

/**
 * Lấy user đang đăng nhập từ /api/auth/me.
 * - Trả về null khi chưa đăng nhập (401) — không throw.
 * - staleTime 5 phút: tránh refetch liên tục giữa các page navigate.
 * - retry: false — lỗi 401 không nên retry.
 */
export function useMe() {
  return useQuery<PublicUser | null>({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        const data = await apiGet<MeResponse>("/api/auth/me");
        return data.data.user;
      } catch {
        // 401 → user chưa đăng nhập, trả null thay vì ném lỗi
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: false,
  });
}
