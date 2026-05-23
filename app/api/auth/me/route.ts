import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http/json-response";
import type { MeResponse } from "@/types/api";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

/** User hiện tại (từ JWT trong cookie). Cập nhật lấy thông tin mới nhất từ DB. */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Chưa đăng nhập");
  }

  // Fetch the latest user info from the database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      phone: true,
      avatarUrl: true,
    },
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
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    },
  };

  return NextResponse.json(payload);
}

/** Cập nhật thông tin cá nhân hoặc đổi mật khẩu */
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return jsonError(401, "Chưa đăng nhập");
  }

  try {
    const body = await request.json();
    const { fullName, phone, avatarUrl, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return jsonError(404, "Không tìm thấy người dùng");
    }

    const updateData: any = {};

    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return jsonError(400, "Họ tên không được để trống");
      }
      updateData.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl || null;
    }

    // Nếu muốn đổi mật khẩu
    if (newPassword) {
      if (!currentPassword) {
        return jsonError(400, "Vui lòng nhập mật khẩu hiện tại để thay đổi mật khẩu.");
      }
      if (!user.passwordHash) {
        return jsonError(400, "Tài khoản của bạn không sử dụng mật khẩu cục bộ.");
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return jsonError(400, "Mật khẩu hiện tại không chính xác.");
      }
      if (newPassword.length < 6) {
        return jsonError(400, "Mật khẩu mới phải dài tối thiểu 6 ký tự.");
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          phone: updatedUser.phone,
          avatarUrl: updatedUser.avatarUrl,
        },
      },
    });
  } catch (error) {
    console.error("[PUT /api/auth/me] Error:", error);
    return jsonError(500, "Không thể cập nhật thông tin cá nhân.");
  }
}
