import "server-only";

import { cookies } from "next/headers";

import type { UserRole } from "@prisma/client";

import { SESSION_COOKIE_NAME } from "./constants";
import { verifySessionToken } from "./token";

/** Session ứng dụng (không dùng NextAuth). */
export type AppSession = {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
};

/** Đọc JWT từ cookie và trả session; null nếu chưa đăng nhập hoặc token không hợp lệ. */
export async function getSession(): Promise<AppSession | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  const claims = await verifySessionToken(token);
  if (!claims) {
    return null;
  }
  return {
    user: {
      id: claims.sub,
      email: claims.email,
      fullName: claims.fullName,
      role: claims.role,
    },
  };
}
