import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { verifyOtpToken, otpErrorMessage } from "@/lib/auth/otp";
import { resetPasswordSchema } from "@/lib/validators/auth";

/**
 * POST /api/auth/otp/reset-password
 * Đặt lại mật khẩu sau khi xác minh mã OTP.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Payload JSON không hợp lệ");
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Dữ liệu không hợp lệ", parsed.error.flatten().fieldErrors);
  }

  const { email, code, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });

  // Luôn trả lỗi OTP sai thay vì tiết lộ user không tồn tại
  if (!user || !user.isActive) {
    return jsonError(400, "Mã OTP không chính xác");
  }

  const result = await verifyOtpToken(email, "password_reset", code);

  if (!result.ok) {
    return jsonError(400, otpErrorMessage(result.reason));
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json(
    { success: true, data: { message: "Đặt lại mật khẩu thành công" } },
    { status: 200 }
  );
}
