import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .email("Email không hợp lệ")
    .min(1, "Không được để trống email")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z
    .email("Email không hợp lệ")
    .min(1, "Không được để trống email")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export const sendOtpSchema = z.object({
  email: z
    .email("Email không hợp lệ")
    .min(1, "Không được để trống email")
    .transform((v) => v.trim().toLowerCase()),
  type: z.enum(["email_verify", "password_reset"]),
});

export const verifyEmailSchema = z.object({
  email: z
    .email("Email không hợp lệ")
    .transform((v) => v.trim().toLowerCase()),
  code: z.string().length(6, "Mã OTP phải gồm 6 chữ số"),
});

export const resetPasswordSchema = z.object({
  email: z
    .email("Email không hợp lệ")
    .transform((v) => v.trim().toLowerCase()),
  code: z.string().length(6, "Mã OTP phải gồm 6 chữ số"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
