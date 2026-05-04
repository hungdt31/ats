import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http/json-response";
import type { MeResponse } from "@/types/api";
import { prisma } from "@/lib/db";

/** User hiện tại (từ JWT trong cookie). Cập nhật lấy thông tin mới nhất từ DB. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Chưa đăng nhập");
  }

  // Fetch the latest user info from the database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, fullName: true, role: true },
  });

  if (!user) {
    return jsonError(401, "Người dùng không tồn tại");
  }

  const payload: MeResponse = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    },
  };

  return NextResponse.json(payload);
}
