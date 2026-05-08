import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { verifyOtpToken, otpErrorMessage } from "@/lib/auth/otp";
import { verifyEmailSchema } from "@/lib/validators/auth";

/**
 * POST /api/auth/otp/verify-email
 * Xác minh mã OTP → đánh dấu email đã được xác minh.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Payload JSON không hợp lệ");
  }

  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Dữ liệu không hợp lệ", parsed.error.flatten().fieldErrors);
  }

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (!user) return jsonError(404, "Email không tồn tại");
  if (user.emailVerified) return jsonError(409, "Email này đã được xác minh");

  const result = await verifyOtpToken(email, "email_verify", code);

  if (!result.ok) {
    return jsonError(400, otpErrorMessage(result.reason));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  return NextResponse.json(
    { success: true, data: { message: "Xác minh email thành công" } },
    { status: 200 }
  );
}
