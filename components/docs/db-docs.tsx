"use client";

import { Badge } from "@/components/ui/badge";

const TABLES = [
  {
    name: "users",
    description: "Lưu thông tin tài khoản người dùng trong hệ thống (Ứng viên, Admin, HR, Interviewer).",
    fields: [
      { name: "id", type: "String (UUID)", desc: "ID khóa chính của người dùng" },
      { name: "email", type: "String", desc: "Email đăng nhập (Duy nhất)" },
      { name: "password_hash", type: "String", desc: "Mật khẩu đã mã hóa" },
      { name: "role", type: "UserRole", desc: "Quyền hạn: candidate, hr, admin, interviewer" },
      { name: "full_name", type: "String", desc: "Họ và tên đầy đủ" },
      { name: "avatar_url", type: "String?", desc: "Link ảnh đại diện" },
      { name: "created_at", type: "DateTime", desc: "Thời gian khởi tạo" },
    ],
  },
  {
    name: "candidate_profiles",
    description: "Thông tin hồ sơ chi tiết của ứng viên.",
    fields: [
      { name: "id", type: "String (UUID)", desc: "ID khóa chính" },
      { name: "user_id", type: "String (UUID)", desc: "Khóa ngoại tới users.id" },
      { name: "title", type: "String?", desc: "Tiêu đề công việc hiện tại" },
      { name: "bio", type: "String?", desc: "Mô tả bản thân" },
      { name: "location", type: "String?", desc: "Địa điểm sinh sống" },
      { name: "years_experience", type: "Int", desc: "Số năm kinh nghiệm" },
      { name: "skills", type: "Json?", desc: "Các kỹ năng chuyên môn" },
      { name: "education", type: "Json?", desc: "Học vấn / Bằng cấp" },
    ],
  },
  {
    name: "jobs",
    description: "Thông tin chi tiết các tin tuyển dụng đang hoặc đã mở tuyển.",
    fields: [
      { name: "id", type: "String (UUID)", desc: "ID khóa chính" },
      { name: "created_by", type: "String (UUID)", desc: "ID người tạo (users.id)" },
      { name: "title", type: "String", desc: "Tiêu đề công việc" },
      { name: "description", type: "String", desc: "Mô tả công việc" },
      { name: "requirements", type: "String?", desc: "Yêu cầu công việc" },
      { name: "benefits", type: "String?", desc: "Quyền lợi được hưởng" },
      { name: "location", type: "String?", desc: "Địa điểm làm việc" },
      { name: "department", type: "String?", desc: "Phòng ban" },
      { name: "category", type: "String?", desc: "Ngành nghề" },
      { name: "salary_min", type: "Int?", desc: "Mức lương tối thiểu" },
      { name: "salary_max", type: "Int?", desc: "Mức lương tối đa" },
      { name: "employment_type", type: "Enum", desc: "full_time, part_time, contract, internship" },
      { name: "required_skills", type: "Json?", desc: "Các kỹ năng yêu cầu" },
      { name: "headcount", type: "Int", desc: "Số lượng tuyển dụng" },
      { name: "status", type: "Enum", desc: "draft, active, closed, archived" },
      { name: "expires_at", type: "DateTime?", desc: "Hạn nộp hồ sơ" },
    ],
  },
  {
    name: "applications",
    description: "Lưu trữ đơn ứng tuyển của ứng viên vào các công việc.",
    fields: [
      { name: "id", type: "String (UUID)", desc: "ID khóa chính" },
      { name: "job_id", type: "String (UUID)", desc: "ID tin tuyển dụng (jobs.id)" },
      { name: "candidate_id", type: "String (UUID)", desc: "ID ứng viên (users.id)" },
      { name: "status", type: "Enum", desc: "applied, screening, interviewing, offered, rejected, withdrawn" },
      { name: "resume_url", type: "String", desc: "Đường dẫn file CV" },
      { name: "cover_letter", type: "String?", desc: "Thư giới thiệu" },
    ],
  },
  {
    name: "interviews",
    description: "Lịch phỏng vấn đã xếp cho các ứng viên.",
    fields: [
      { name: "id", type: "String (UUID)", desc: "ID khóa chính" },
      { name: "application_id", type: "String (UUID)", desc: "Khóa ngoại tới applications.id" },
      { name: "interviewer_id", type: "String (UUID)", desc: "Khóa ngoại tới users.id" },
      { name: "scheduled_at", type: "DateTime", desc: "Thời gian phỏng vấn" },
      { name: "duration", type: "Int", desc: "Thời lượng (phút)" },
      { name: "status", type: "Enum", desc: "scheduled, completed, cancelled, no_show" },
      { name: "location", type: "String?", desc: "Phòng họp / Link online" },
    ],
  },
  {
    name: "interview_scores",
    description: "Đánh giá chi tiết của người phỏng vấn cho ứng viên sau buổi phỏng vấn.",
    fields: [
      { name: "id", type: "String (UUID)", desc: "ID khóa chính" },
      { name: "interview_id", type: "String (UUID)", desc: "Khóa ngoại tới interviews.id" },
      { name: "evaluator_id", type: "String (UUID)", desc: "ID người đánh giá (users.id)" },
      { name: "technical_score", type: "Int?", desc: "Điểm chuyên môn" },
      { name: "communication_score", type: "Int?", desc: "Điểm giao tiếp" },
      { name: "cultural_fit_score", type: "Int?", desc: "Điểm độ phù hợp văn hóa" },
      { name: "overall_score", type: "Int?", desc: "Điểm tổng thể" },
      { name: "strengths", type: "String?", desc: "Điểm mạnh" },
      { name: "weaknesses", type: "String?", desc: "Điểm yếu" },
      { name: "feedback", type: "String?", desc: "Nhận xét thêm" },
      { name: "result", type: "Enum", desc: "pass, fail, strong_pass, borderline" },
      { name: "is_final", type: "Boolean", desc: "Đã chốt kết quả chưa" },
    ],
  },
  {
    name: "job_channels",
    description: "Các kênh tuyển dụng được đăng tin (External platforms).",
    fields: [
      { name: "id", type: "String (UUID)", desc: "ID khóa chính" },
      { name: "job_id", type: "String (UUID)", desc: "Khóa ngoại tới jobs.id" },
      { name: "channel", type: "Enum", desc: "linkedin, indeed, facebook, topcv" },
      { name: "external_url", type: "String?", desc: "URL của bài đăng trên kênh" },
      { name: "status", type: "Enum", desc: "pending, posted, failed, expired" },
    ],
  },
  {
    name: "email_logs",
    description: "Lịch sử gửi email tới ứng viên từ hệ thống.",
    fields: [
      { name: "id", type: "String (UUID)", desc: "ID khóa chính" },
      { name: "application_id", type: "String (UUID)", desc: "Khóa ngoại tới applications.id" },
      { name: "recipient_id", type: "String (UUID)", desc: "Khóa ngoại tới users.id" },
      { name: "sender_id", type: "String (UUID)?", desc: "ID người gửi (users.id)" },
      { name: "subject", type: "String", desc: "Tiêu đề email" },
      { name: "status", type: "Enum", desc: "pending, sent, failed" },
      { name: "sent_at", type: "DateTime?", desc: "Thời điểm gửi thành công" },
    ],
  },
];

export function DbDocs() {
  return (
    <div className="space-y-8">
      {TABLES.map((table) => (
        <div
          key={table.name}
          className="rounded-2xl border border-border/60 bg-background/50 backdrop-blur p-6 hover:shadow-md transition-all space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-primary/5 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75M3.75 13.875v3.75"
                  />
                </svg>
              </span>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground font-mono">
                  {table.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">{table.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit text-xs font-normal">
              Schema table
            </Badge>
          </div>

          <div className="overflow-x-auto border border-border/50 rounded-xl bg-muted/20">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border/50">
                  <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider font-mono">Trường</th>
                  <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Kiểu dữ liệu</th>
                  <th className="px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {table.fields.map((field) => (
                  <tr key={field.name} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-medium text-foreground text-xs">{field.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-muted font-normal text-primary/80">
                        {field.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-foreground/80">{field.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
