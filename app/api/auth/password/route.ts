import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http/json-response";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Bạn chưa đăng nhập");
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Payload JSON không hợp lệ");
  }

  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return jsonError(400, "Vui lòng nhập đầy đủ thông tin");
  }

  if (newPassword.length < 6) {
    return jsonError(400, "Mật khẩu mới phải có ít nhất 6 ký tự");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return jsonError(404, "Không tìm thấy người dùng");
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return jsonError(400, "Mật khẩu hiện tại không chính xác");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ success: true, data: { message: "Đổi mật khẩu thành công" } });
  } catch (e) {
    console.error("[POST /api/auth/password]", e);
    return jsonError(500, "Lỗi máy chủ khi đổi mật khẩu");
  }
}
