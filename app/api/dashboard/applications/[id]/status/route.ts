import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { applications_status } from "@prisma/client";

export async function POST(
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
    const body = await request.json();
    const { to_status, note } = body;

    if (!to_status) {
      return jsonError(400, "Vui lòng chọn trạng thái mới.");
    }

    // Check if the application exists
    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return jsonError(404, "Không tìm thấy đơn ứng tuyển.");
    }

    // Update status and create audit log
    await prisma.$transaction([
      prisma.applications.update({
        where: { id: applicationId },
        data: {
          status: to_status as applications_status,
          updated_at: new Date(),
        },
      }),
      prisma.application_status_history.create({
        data: {
          application_id: applicationId,
          changed_by: session.user.id,
          from_status: application.status,
          to_status: to_status,
          note: note || null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật trạng thái đơn ứng tuyển thành công.",
    });
  } catch (error) {
    console.error("[POST /api/dashboard/applications/[id]/status] Error:", error);
    return jsonError(500, "Không thể cập nhật trạng thái đơn ứng tuyển.");
  }
}
