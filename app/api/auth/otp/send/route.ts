import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { createOtpToken } from "@/lib/auth/otp";
import { sendEmailVerifyOtp, sendPasswordResetOtp } from "@/lib/email/otp-templates";
import { sendOtpSchema } from "@/lib/validators/auth";

/** Giới hạn gửi lại OTP — 1 phút / lần. */
const RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * POST /api/auth/otp/send
 * Gửi mã OTP đến email cho xác minh email hoặc đặt lại mật khẩu.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Payload JSON không hợp lệ");
  }

  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Dữ liệu không hợp lệ", parsed.error.flatten().fieldErrors);
  }

  const { email, type } = parsed.data;

  // Kiểm tra user tồn tại
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true, emailVerified: true },
  });

  if (type === "email_verify") {
    if (!user) return jsonError(404, "Email không tồn tại trong hệ thống");
    if (user.emailVerified) return jsonError(409, "Email này đã được xác minh");
  }

  if (type === "password_reset") {
    // Không tiết lộ user có tồn tại hay không để tránh enumeration
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: true, data: { message: "Nếu email tồn tại, mã OTP đã được gửi" } },
        { status: 200 }
      );
    }
  }

  // Chống spam: kiểm tra OTP gần nhất còn trong cooldown
  const recent = await prisma.otpToken.findFirst({
    where: { email, type, usedAt: null },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return jsonError(429, "Vui lòng chờ 1 phút trước khi yêu cầu mã mới");
  }

  const code = await createOtpToken(email, type);

  try {
    if (type === "email_verify") {
      await sendEmailVerifyOtp(email, code);
    } else {
      await sendPasswordResetOtp(email, code);
    }
  } catch (err) {
    console.error("[otp/send] gửi email thất bại", err);
    return jsonError(500, "Không thể gửi email, vui lòng thử lại sau");
  }

  return NextResponse.json(
    { success: true, data: { message: "Mã OTP đã được gửi đến email của bạn" } },
    { status: 200 }
  );
}
