import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || session.user.role === "candidate") {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const params = await props.params;
    const applicationId = params.id;

    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: {
        users: {
          select: { id: true, fullName: true, email: true },
        },
        jobs: {
          select: { id: true, title: true },
        },
      },
    });

    if (!application) {
      return jsonError(404, "Không tìm thấy đơn ứng tuyển.");
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/applications/[id]] Error:", error);
    return jsonError(500, "Không thể tải thông tin đơn ứng tuyển.");
  }
}
