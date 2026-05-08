import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/http/json-response";
import { sendInterviewInviteEmail } from "@/lib/email/interview-templates";

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
    const scheduledDate  = new Date(scheduled_at);
    const durationMins   = duration_minutes ? parseInt(String(duration_minutes)) : 60;

    // 1. Gửi email mời phỏng vấn
    try {
      await sendInterviewInviteEmail(recipientEmail, application.jobs.title, {
        candidateName:   application.users.fullName,
        jobTitle:        application.jobs.title,
        scheduledAt:     scheduledDate,
        durationMinutes: durationMins,
        interviewType:   type as string,
        interviewerName: interviewer.fullName,
        interviewerEmail: interviewer.email,
        meetingLink:     meeting_link ?? null,
        location:        location ?? null,
        notes:           notes ?? null,
      });
    } catch (emailErr) {
      console.error("[Interview email send error]", emailErr);
      return jsonError(500, "Không thể tạo lịch phỏng vấn vì gửi email thất bại.");
    }

    // 2. Lưu interview + email log vào DB
    const [newInterview] = await prisma.$transaction([
      prisma.interviews.create({
        data: {
          application_id: applicationId,
          interviewer_id,
          scheduled_at:     scheduledDate,
          duration_minutes: durationMins,
          type:             type as "phone" | "video" | "onsite" | "technical",
          meeting_link:     meeting_link ?? null,
          location:         location ?? null,
          notes:            notes ?? null,
        },
      }),
      prisma.email_logs.create({
        data: {
          application_id: applicationId,
          recipient_id: application.candidate_id,
          sender_id: session.user.id,
          subject: `[ATS System] Thư mời phỏng vấn — ${application.jobs.title}`,
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
  } catch (error: unknown) {
    console.error("[POST /api/dashboard/applications/[id]/interviews] Error:", error);
    return jsonError(500, "Đã xảy ra lỗi khi tạo lịch phỏng vấn.");
  }
}
