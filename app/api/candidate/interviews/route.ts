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

    // Get interviews where applications.candidate_id = candidateId
    const interviews = await prisma.interviews.findMany({
      where: {
        applications: {
          candidate_id: candidateId,
        },
      },
      include: {
        applications: {
          include: {
            jobs: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { scheduled_at: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { interviews },
    });
  } catch (error) {
    console.error("[GET /api/candidate/interviews] Error:", error);
    return jsonError(500, "Không thể tải danh sách lịch phỏng vấn.");
  }
}
