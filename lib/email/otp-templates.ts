import "server-only";

import { resend } from "@/lib/resend";

export const FROM = process.env.RESEND_FROM_EMAIL ?? "no-reply@example.com";
export const APP_NAME = "ATS System";

/** Nền màu chủ đạo — dùng biến CSS không được trong email nên hard-code. */
export const PRIMARY = "#2563eb";

export function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
          <!-- Header -->
          <tr>
            <td style="background:${PRIMARY};padding:28px 40px;">
              <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${APP_NAME}</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                Email này được gửi tự động từ ${APP_NAME}. Vui lòng không trả lời email này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function otpBox(code: string): string {
  const digits = code.split("").map(
    (d) =>
      `<span style="display:inline-block;width:44px;height:52px;line-height:52px;text-align:center;
        font-size:28px;font-weight:700;color:#111827;background:#f9fafb;
        border:2px solid #e5e7eb;border-radius:8px;margin:0 4px;">${d}</span>`
  );
  return `<div style="text-align:center;margin:28px 0;">${digits.join("")}</div>`;
}

/** Gửi email xác minh địa chỉ email kèm mã OTP. */
export async function sendEmailVerifyOtp(to: string, code: string): Promise<void> {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Xác minh địa chỉ email</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Cảm ơn bạn đã đăng ký tài khoản ${APP_NAME}.<br />
      Vui lòng nhập mã bên dưới để xác minh email của bạn.
    </p>
    ${otpBox(code)}
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-align:center;">
      Mã có hiệu lực trong <strong>10 phút</strong>.
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
      Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `[${APP_NAME}] Mã xác minh email của bạn`,
    html: baseLayout("Xác minh email", content),
  });
}

/** Gửi email đặt lại mật khẩu kèm mã OTP. */
export async function sendPasswordResetOtp(to: string, code: string): Promise<void> {
  const content = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Đặt lại mật khẩu</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.<br />
      Nhập mã bên dưới để tiếp tục.
    </p>
    ${otpBox(code)}
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-align:center;">
      Mã có hiệu lực trong <strong>10 phút</strong>.
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
      Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.<br />
      Mật khẩu hiện tại của bạn sẽ không thay đổi.
    </p>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `[${APP_NAME}] Mã đặt lại mật khẩu`,
    html: baseLayout("Đặt lại mật khẩu", content),
  });
}
