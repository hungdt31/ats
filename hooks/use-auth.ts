import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, ApiError } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { LoginInput, RegisterInput } from "@/lib/validators/auth";
import type { MeResponse } from "@/types/api";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<
    { me: MeResponse | { success: false } },
    ApiError | Error,
    LoginInput
  >({
    mutationFn: async (values) => {
      // 1. Đăng nhập
      await apiPost("/api/auth/login", values, { credentials: "include" });

      // 2. Lấy thông tin cá nhân sau khi đăng nhập thành công
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meJson = (await meRes.json().catch(() => ({ success: false }))) as MeResponse | { success: false };

      return { me: meJson };
    },
    onSuccess: () => {
      // Làm mới dữ liệu người dùng
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useRegister() {
  return useMutation<unknown, ApiError | Error, RegisterInput>({
    mutationFn: async (values) => {
      return apiPost("/api/auth/register", values);
    },
  });
}
