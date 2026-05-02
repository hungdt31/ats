import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "candidate") {
    return jsonError(401, "Bạn phải đăng nhập với tư cách ứng viên để truy cập.");
  }

  try {
    const candidateId = session.user.id;

    const applications = await prisma.applications.findMany({
      where: { candidate_id: candidateId },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            location: true,
            department: true,
            employment_type: true,
          },
        },
      },
      orderBy: { applied_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    console.error("[GET /api/candidate/applications] Error:", error);
    return jsonError(500, "Không thể tải danh sách đơn ứng tuyển.");
  }
}
