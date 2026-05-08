import "server-only";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import type { OtpType } from "@prisma/client";

/** Thời gian sống OTP (phút). */
const OTP_TTL_MINUTES = 10;

/** Số lần thử tối đa trước khi hết hiệu lực. */
const OTP_MAX_ATTEMPTS = 5;

/** Sinh mã OTP 6 chữ số ngẫu nhiên. */
export function generateOtpCode(): string {
  const digits = Math.floor(100_000 + Math.random() * 900_000);
  return String(digits);
}

/**
 * Tạo một OTP mới cho email + type, xoá các token cũ chưa dùng cùng loại,
 * lưu hash vào DB và trả về code plaintext để gửi email.
 */
export async function createOtpToken(email: string, type: OtpType): Promise<string> {
  const code = generateOtpCode();
  const hash = await bcrypt.hash(code, 10);

  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // Xoá mọi OTP cũ chưa dùng của email này để tránh nhiễu
  await prisma.otpToken.deleteMany({
    where: { email, type, usedAt: null },
  });

  await prisma.otpToken.create({
    data: { email, code: hash, type, expiresAt },
  });

  return code;
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "already_used" | "wrong_code" | "max_attempts" };

/**
 * Xác minh OTP: kiểm tra tồn tại, hết hạn, số lần thử, rồi so hash.
 * Nếu đúng → đánh dấu usedAt. Nếu sai → tăng attempts.
 */
export async function verifyOtpToken(
  email: string,
  type: OtpType,
  code: string
): Promise<VerifyOtpResult> {
  const token = await prisma.otpToken.findFirst({
    where: { email, type, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return { ok: false, reason: "not_found" };

  if (token.usedAt) return { ok: false, reason: "already_used" };

  if (token.expiresAt < new Date()) return { ok: false, reason: "expired" };

  if (token.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "max_attempts" };

  const match = await bcrypt.compare(code, token.code);

  if (!match) {
    await prisma.otpToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "wrong_code" };
  }

  await prisma.otpToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  });

  return { ok: true };
}

/** Trả về message hiển thị tương ứng với lý do lỗi OTP. */
export function otpErrorMessage(reason: Exclude<VerifyOtpResult, { ok: true }>["reason"]): string {
  const map: Record<typeof reason, string> = {
    not_found: "Mã OTP không tồn tại hoặc đã hết hạn",
    expired: "Mã OTP đã hết hạn, vui lòng yêu cầu mã mới",
    already_used: "Mã OTP đã được sử dụng",
    wrong_code: "Mã OTP không chính xác",
    max_attempts: "Đã vượt quá số lần thử, vui lòng yêu cầu mã mới",
  };
  return map[reason];
}
