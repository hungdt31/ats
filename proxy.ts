import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "./lib/auth/constants";
import { verifySessionToken } from "./lib/auth/token";

const CANDIDATE_HOME = "/candidate";
const STAFF_HOME = "/dashboard";
const LOGIN = "/login";
const REGISTER = "/register";
const UNAUTHORIZED = "/unauthorized";

function postLoginPath(role: string | undefined) {
  return role === "candidate" ? CANDIDATE_HOME : STAFF_HOME;
}

/**
 * Next.js 16+ — convention `proxy.ts` + export `proxy` (thay cho middleware.ts).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  const claims = token ? await verifySessionToken(token) : null;
  const role = claims?.role;
  const authed = Boolean(claims?.sub);

  if (pathname === LOGIN || pathname === REGISTER) {
    if (authed) {
      const target = request.nextUrl.searchParams.get("callbackUrl") ?? postLoginPath(role);
      const safe =
        target.startsWith("/") && !target.startsWith("//") ? target : postLoginPath(role);
      return NextResponse.redirect(new URL(safe, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === CANDIDATE_HOME || pathname.startsWith(`${CANDIDATE_HOME}/`)) {
    if (!authed) {
      const url = new URL(LOGIN, request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "candidate") {
      return NextResponse.redirect(new URL(UNAUTHORIZED, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === STAFF_HOME || pathname.startsWith(`${STAFF_HOME}/`)) {
    if (!authed) {
      const url = new URL(LOGIN, request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role === "candidate") {
      return NextResponse.redirect(new URL(UNAUTHORIZED, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/candidate/:path*", "/dashboard/:path*", "/login", "/register"],
};
