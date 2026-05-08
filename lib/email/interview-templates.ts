import "server-only";

import { APP_NAME, FROM, PRIMARY, baseLayout } from "./otp-templates";
import { resend } from "@/lib/resend";

const GRAY_BG = "#f9fafb";
const BORDER  = "#e5e7eb";
const MUTED   = "#6b7280";
const TEXT    = "#111827";

/**
 * SVG icons dạng stroke, 16×16, tối ưu cho email client.
 * Dùng thuộc tính inline thay vì CSS class để tương thích rộng.
 */
const ICONS = {
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="${MUTED}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  clock:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="${MUTED}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  briefcase:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="${MUTED}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="13" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 13h20"/></svg>`,
  tag:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="${MUTED}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H7a2 2 0 0 0-2 2v5l9 9a2 2 0 0 0 2.83 0l4.17-4.17a2 2 0 0 0 0-2.83L12 2z"/><circle cx="7.5" cy="7.5" r="1.5" fill="${MUTED}" stroke="none"/></svg>`,
  user:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="${MUTED}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
  link:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="${MUTED}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  pin:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="${MUTED}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
} as const;

/** Row thông tin trong bảng chi tiết lịch phỏng vấn. */
function infoRow(icon: string, label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};vertical-align:middle;width:42%;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;padding-right:8px;line-height:0;">${icon}</td>
          <td style="vertical-align:middle;font-size:13px;color:${MUTED};">${label}</td>
        </tr></table>
      </td>
      <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};vertical-align:middle;">
        <span style="font-size:13px;font-weight:600;color:${TEXT};">${value}</span>
      </td>
    </tr>`;
}

type InterviewEmailParams = {
  candidateName: string;
  jobTitle: string;
  scheduledAt: Date;
  durationMinutes: number;
  interviewType: string;
  interviewerName: string;
  interviewerEmail: string;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
};

/** Label hiển thị cho loại phỏng vấn. */
function typeLabel(type: string): string {
  const map: Record<string, string> = {
    phone: "Phỏng vấn qua điện thoại",
    video: "Phỏng vấn trực tuyến (Video)",
    onsite: "Phỏng vấn trực tiếp",
    technical: "Kiểm tra kỹ thuật",
  };
  return map[type] ?? type;
}

/** HTML body email mời phỏng vấn. */
function buildInterviewEmailHtml(p: InterviewEmailParams): string {
  const scheduledFormatted = p.scheduledAt.toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = [
    infoRow(ICONS.calendar,  "Thời gian",        scheduledFormatted),
    infoRow(ICONS.clock,     "Thời lượng",       `${p.durationMinutes} phút`),
    infoRow(ICONS.briefcase, "Vị trí ứng tuyển", p.jobTitle),
    infoRow(ICONS.tag,       "Hình thức",        typeLabel(p.interviewType)),
    infoRow(ICONS.user,      "Người phỏng vấn",  `${p.interviewerName} &lt;${p.interviewerEmail}&gt;`),
    ...(p.meetingLink
      ? [infoRow(ICONS.link, "Link tham gia", `<a href="${p.meetingLink}" style="color:${PRIMARY};word-break:break-all;">${p.meetingLink}</a>`)]
      : []),
    ...(p.location
      ? [infoRow(ICONS.pin, "Địa điểm", p.location)]
      : []),
  ].join("");

  const notesBlock = p.notes
    ? `<div style="margin-top:24px;padding:16px;background:${GRAY_BG};border-left:3px solid ${PRIMARY};border-radius:0 8px 8px 0;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${TEXT};">Ghi chú từ HR</p>
        <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.6;">${p.notes.replace(/\n/g, "<br>")}</p>
      </div>`
    : "";

  const content = `
    <h2 style="margin:0 0 6px;font-size:20px;color:${TEXT};">Thư mời phỏng vấn</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
      Xin chào <strong style="color:${TEXT};">${p.candidateName}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:${MUTED};line-height:1.6;">
      Chúc mừng! Hồ sơ của bạn đã được xem xét và chúng tôi trân trọng mời bạn tham gia
      buổi phỏng vấn cho vị trí <strong style="color:${TEXT};">${p.jobTitle}</strong>.
      Dưới đây là thông tin chi tiết:
    </p>

    <!-- Bảng chi tiết lịch -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tbody>${rows}</tbody>
    </table>

    ${notesBlock}

    <div style="margin-top:28px;padding:16px;background:#eff6ff;border-radius:8px;">
        <p style="margin:0;font-size:13px;color:#1d4ed8;line-height:1.6;">
        Vui lòng xác nhận tham dự bằng cách trả lời email này hoặc liên hệ với bộ phận
        Nhân sự nếu bạn cần điều chỉnh lịch hẹn.
      </p>
    </div>

    <p style="margin:28px 0 0;font-size:14px;color:${MUTED};">
      Chúc bạn có một buổi phỏng vấn thật tốt! Chúng tôi rất mong được gặp bạn.
    </p>
    <p style="margin:4px 0 0;font-size:14px;color:${MUTED};">
      Trân trọng,<br />
      <strong style="color:${TEXT};">Bộ phận Nhân sự — ${APP_NAME}</strong>
    </p>
  `;

  return baseLayout("Thư mời phỏng vấn", content);
}

/** Gửi email thư mời phỏng vấn đến ứng viên. */
export async function sendInterviewInviteEmail(
  to: string,
  jobTitle: string,
  params: InterviewEmailParams
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `[${APP_NAME}] Thư mời phỏng vấn — ${jobTitle}`,
    html: buildInterviewEmailHtml(params),
  });
}
