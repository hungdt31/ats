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

    const {
      interviewer_id,
      scheduled_at,
      duration_minutes,
      type,
      meeting_link,
      location,
      notes,
    } = body;

    if (!interviewer_id || !scheduled_at || !type) {
      return jsonError(400, "Vui lòng nhập đầy đủ thông tin bắt buộc.");
    }

    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: {
        users: true,
        jobs: true,
      },
    });

    if (!application) {
      return jsonError(404, "Không tìm thấy đơn ứng tuyển.");
    }

    const interviewer = await prisma.user.findUnique({
      where: { id: interviewer_id },
    });

    if (!interviewer) {
      return jsonError(404, "Không tìm thấy người phỏng vấn.");
    }

    const recipientEmail = application.users.email;
    const subject = `Lịch phỏng vấn mới cho vị trí: ${application.jobs.title}`;

    const htmlBody = `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e4e8; rounded-corners: 12px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">Lịch phỏng vấn mới</h2>
        <p>Xin chào <strong>${application.users.fullName}</strong>,</p>
        <p>Hệ thống tuyển dụng của chúng tôi xin thông báo lịch phỏng vấn mới cho bạn với thông tin chi tiết như sau:</p>
        <ul style="list-style: none; padding: 0;">
          <li>⏰ <strong>Thời gian:</strong> ${new Date(scheduled_at).toLocaleString("vi-VN")}</li>
          <li>⏳ <strong>Thời lượng:</strong> ${duration_minutes || 60} phút</li>
          <li>💼 <strong>Vị trí ứng tuyển:</strong> ${application.jobs.title}</li>
          <li>📌 <strong>Người phỏng vấn:</strong> ${interviewer.fullName} (${interviewer.email})</li>
          ${meeting_link ? `<li>🔗 <strong>Link phỏng vấn trực tuyến:</strong> <a href="${meeting_link}">${meeting_link}</a></li>` : ""}
          ${location ? `<li>🏢 <strong>Địa điểm:</strong> ${location}</li>` : ""}
        </ul>
        ${notes ? `<div style="background: #f6f8fa; padding: 12px; border-radius: 6px; margin-top: 15px;"><strong>Ghi chú từ HR:</strong><br>${notes.replace(/\n/g, "<br>")}</div>` : ""}
        <p style="margin-top: 20px;">Chúc bạn có một buổi phỏng vấn thành công!</p>
      </div>
    `;

    // 1. Send email first via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [recipientEmail],
      subject,
      html: htmlBody,
    });

    if (error) {
      console.error("[Resend Error during interview creation]", error);
      return jsonError(
        500,
        `Không thể tạo lịch phỏng vấn vì gửi email thất bại: ${error.message || "Lỗi Resend"}`
      );
    }

    // 2. Insert interview and email logs if the email was sent successfully
    const [newInterview] = await prisma.$transaction([
      prisma.interviews.create({
        data: {
          application_id: applicationId,
          interviewer_id,
          scheduled_at: new Date(scheduled_at),
          duration_minutes: duration_minutes ? parseInt(duration_minutes) : 60,
          type: type as any,
          meeting_link: meeting_link || null,
          location: location || null,
          notes: notes || null,
        },
      }),
      prisma.email_logs.create({
        data: {
          application_id: applicationId,
          recipient_id: application.candidate_id,
          sender_id: session.user.id,
          subject,
          type: "invite",
          status: "sent",
          sent_at: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Tạo lịch phỏng vấn và gửi email thành công.",
      data: newInterview,
    });
  } catch (error: any) {
    console.error("[POST /api/dashboard/applications/[id]/interviews] Error:", error);
    return jsonError(500, "Đã xảy ra lỗi khi tạo lịch phỏng vấn.");
  }
}
