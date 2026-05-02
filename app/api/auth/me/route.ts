import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http/json-response";
import type { MeResponse } from "@/types/api";

/** User hiện tại (từ JWT trong cookie). */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Chưa đăng nhập");
  }

  const u = session.user;
  const payload: MeResponse = {
    success: true,
    data: {
      user: {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
      },
    },
  };

  return NextResponse.json(payload);
}
