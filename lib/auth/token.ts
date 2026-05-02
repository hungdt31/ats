import { SignJWT, jwtVerify, type JWTPayload } from "jose";

import type { UserRole } from "@prisma/client";

import { SESSION_MAX_AGE_SECONDS } from "./constants";

const USER_ROLES: UserRole[] = ["candidate", "admin", "hr", "interviewer"];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

/**
 * AUTH_SECRET dùng làm khóa HS256 — tối thiểu 32 ký tự.
 * Production: bắt buộc trong .env; dev: có fallback (chỉ local).
 */
function getEncodedSecret(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Thiếu AUTH_SECRET hoặc quá ngắn. Cần >= 32 ký tự (vd: openssl rand -base64 32)."
    );
  }
  return new TextEncoder().encode("dev-insecure-auth-secret-32char-minimum!!");
}

export type SessionClaims = {
  sub: string;
  email: string;
  fullName: string;
  role: UserRole;
};

function payloadToSession(payload: JWTPayload): SessionClaims | null {
  const sub = payload.sub;
  if (!sub || typeof payload.email !== "string" || typeof payload.fullName !== "string") {
    return null;
  }
  if (!isUserRole(payload.role)) {
    return null;
  }
  return { sub, email: payload.email, fullName: payload.fullName, role: payload.role };
}

/** Ký JWT chứa id, email, họ tên, role (dùng sau đăng nhập). */
export async function signSessionToken(data: {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}): Promise<string> {
  const secret = getEncodedSecret();
  return new SignJWT({
    email: data.email,
    fullName: data.fullName,
    role: data.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(data.userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS)
    .sign(secret);
}

/** Xác minh JWT; trả null nếu hết hạn / sai chữ ký / payload không hợp lệ. */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const secret = getEncodedSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payloadToSession(payload);
  } catch {
    return null;
  }
}
