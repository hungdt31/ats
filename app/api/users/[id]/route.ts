import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { UserRole } from "@prisma/client";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return jsonError(403, "Bạn không có quyền thực hiện hành động này.");
  }

  try {
    const params = await props.params;
    const userId = params.id;

    // Ngăn chặn tự đổi thông tin hoặc tự khoá tài khoản của chính mình
    if (userId === session.user.id) {
      return jsonError(400, "Bạn không thể tự cập nhật vai trò hoặc trạng thái hoạt động của chính mình.");
    }

    const body = await request.json();
    const { role, isActive } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return jsonError(444, "Không tìm thấy người dùng.");
    }

    const updateData: any = {};

    if (role !== undefined) {
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return jsonError(400, "Vai trò không hợp lệ.");
      }
      updateData.role = role as UserRole;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("[PUT /api/users/[id]] Error:", error);
    return jsonError(500, "Không thể cập nhật thông tin người dùng.");
  }
}
