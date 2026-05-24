import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { resend } from "@/lib/resend";

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
    const { subject, type, bodyText } = body;

    if (!subject || !type || !bodyText) {
      return jsonError(400, "Vui lòng cung cấp đầy đủ Tiêu đề, Loại email và Nội dung.");
    }

    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: { users: true },
    });

    if (!application) {
      return jsonError(404, "Không tìm thấy đơn ứng tuyển.");
    }

    const recipientEmail = application.users.email;

    // Call Resend client
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [recipientEmail],
      subject: subject,
      html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">${bodyText.replace(/\n/g, "<br>")}</div>`,
    });

    if (error) {
      console.error("[Resend Error]", error);
      return jsonError(500, error.message || "Không thể gửi email.");
    }

    // Create log only if it's successful!
    const newLog = await prisma.email_logs.create({
      data: {
        application_id: applicationId,
        recipient_id: application.candidate_id,
        sender_id: session.user.id,
        subject,
        type: type as any,
        status: "sent",
        sent_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gửi email thành công.",
      data: newLog,
    });
  } catch (error: any) {
    console.error("[POST /api/dashboard/applications/[id]/email] Error:", error);
    return jsonError(500, "Đã xảy ra lỗi khi gửi email.");
  }
}
