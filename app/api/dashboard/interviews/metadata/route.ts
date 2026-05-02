import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền xem thông tin này.");
  }

  try {
    // Get all valid applications
    const applications = await prisma.applications.findMany({
      include: {
        users: { select: { fullName: true, email: true } },
        jobs: { select: { title: true } },
      },
      orderBy: { applied_at: "desc" },
    });

    // Get all interviewer users
    const interviewers = await prisma.user.findMany({
      where: {
        role: { in: ["admin", "hr", "interviewer"] },
        isActive: true,
      },
      select: { id: true, fullName: true, email: true, role: true },
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { applications, interviewers },
    });
  } catch (error) {
    console.error("[GET /api/dashboard/interviews/metadata] Error:", error);
    return jsonError(500, "Không thể tải dữ liệu.");
  }
}
