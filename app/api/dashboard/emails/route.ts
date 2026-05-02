import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { email_logs_status, email_logs_type } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (type) where.type = type as email_logs_type;
    if (status) where.status = status as email_logs_status;

    const emailLogs = await prisma.email_logs.findMany({
      where,
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            jobs: { select: { title: true } },
          },
        },
        users_email_logs_recipient_idTousers: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: emailLogs,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/emails] Error:", error);
    return jsonError(500, "Không thể tải danh sách nhật ký email.");
  }
}
