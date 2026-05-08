import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, ApiError } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { LoginInput, RegisterInput, SendOtpInput, VerifyEmailInput, ResetPasswordInput } from "@/lib/validators/auth";
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

/** Gửi OTP đến email (dùng cho cả xác minh email và quên mật khẩu). */
export function useSendOtp() {
  return useMutation<unknown, ApiError | Error, SendOtpInput>({
    mutationFn: (values) => apiPost("/api/auth/otp/send", values),
  });
}

/** Xác minh mã OTP để kích hoạt email. */
export function useVerifyEmail() {
  return useMutation<unknown, ApiError | Error, VerifyEmailInput>({
    mutationFn: (values) => apiPost("/api/auth/otp/verify-email", values),
  });
}

/** Đặt lại mật khẩu bằng mã OTP. */
export function useResetPassword() {
  return useMutation<unknown, ApiError | Error, ResetPasswordInput>({
    mutationFn: (values) => apiPost("/api/auth/otp/reset-password", values),
  });
}
