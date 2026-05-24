import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { sessionCookieBase } from "@/lib/auth/cookie-options";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { signSessionToken } from "@/lib/auth/token";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { loginSchema } from "@/lib/validators/auth";

/**
 * Đăng nhập: kiểm tra bcrypt, phát JWT, gắn cookie httpOnly.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Payload JSON không hợp lệ");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Dữ liệu không hợp lệ", parsed.error.flatten().fieldErrors);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user?.passwordHash) {
    return jsonError(401, "Email hoặc mật khẩu không đúng");
  }

  if (!user?.isActive) {
    return jsonError(403, "Tài khoản của bạn dừng hoạt động");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return jsonError(401, "Email hoặc mật khẩu không đúng");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  let token: string;
  try {
    token = await signSessionToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (e) {
    console.error("[auth/login] signSessionToken", e);
    return jsonError(500, "Lỗi cấu hình máy chủ (AUTH_SECRET)");
  }

  const res = NextResponse.json({ success: true, data: { ok: true } } as const);
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieBase());

  return res;
}
