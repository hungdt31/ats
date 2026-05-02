import { SESSION_MAX_AGE_SECONDS } from "./constants";

/** Cấu hình chung cho cookie session (login). */
export function sessionCookieBase() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/** Xoá cookie session (logout). */
export function sessionCookieDelete() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
