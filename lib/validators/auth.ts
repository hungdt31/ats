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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
