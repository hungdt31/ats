import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "hr")) {
    return jsonError(401, "Bạn không có quyền truy cập.");
  }

  try {
    const params = await props.params;
    const applicationId = params.id;

    const emailLogs = await prisma.email_logs.findMany({
      where: { application_id: applicationId },
      include: {
        users_email_logs_recipient_idTousers: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      select: {
        users: { select: { fullName: true } },
        jobs: { select: { title: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: { emailLogs, application },
    });
  } catch (error) {
    console.error("[GET /api/dashboard/applications/[id]/emails] Error:", error);
    return jsonError(500, "Không thể tải nhật ký email.");
  }
}
