import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return jsonError(403, "Bạn không có quyền thực hiện hành động này.");
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("[GET /api/users] Error:", error);
    return jsonError(500, "Không thể tải danh sách người dùng.");
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return jsonError(403, "Bạn không có quyền thực hiện hành động này.");
  }

  try {
    const body = await request.json();
    const { email, password, fullName, phone, role } = body;

    if (!email || !password || !fullName || !role) {
      return jsonError(400, "Vui lòng nhập đầy đủ thông tin bắt buộc (Họ tên, Email, Mật khẩu, Vai trò).");
    }

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return jsonError(400, "Vai trò không hợp lệ.");
    }

    // Kiểm tra email trùng
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return jsonError(409, "Email này đã được sử dụng bởi một tài khoản khác.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        phone: phone || null,
        role: role as UserRole,
        provider: "local",
        isActive: true,
      },
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

    return NextResponse.json(
      {
        success: true,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/users] Error:", error);
    return jsonError(500, "Không thể tạo tài khoản mới.");
  }
}
