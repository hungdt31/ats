import { NextResponse } from "next/server";

import { sessionCookieDelete } from "@/lib/auth/cookie-options";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/** Xoá cookie session. */
export async function POST() {
  const res = NextResponse.json({ success: true, data: { ok: true } } as const);
  res.cookies.set(SESSION_COOKIE_NAME, "", sessionCookieDelete());
  return res;
}
