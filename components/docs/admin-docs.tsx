"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, ArrowDown01Icon, ArrowUp01Icon, File01Icon } from "@hugeicons/core-free-icons";

export function AdminDocs() {
  const reqs = [
    {
      id: "ADM-01",
      title: "Tổng quan (Dashboard Charts)",
      pageUrl: "/dashboard",
      controls: [
        "Biểu đồ thống kê: Xem số lượng ứng viên theo trạng thái, số lượng đơn nộp mới.",
        "Bộ lọc thời gian: Lọc báo cáo theo tháng/năm.",
      ],
      request: `GET /api/dashboard/stats\n\nHeaders:\nCookie: session_token=jwt_value`,
      response: `200 OK\n{\n  "success": true,\n  "data": {\n    "totalApplications": 120,\n    "totalJobs": 15,\n    "statusStats": { "applied": 50, "interviewing": 30 }\n  }\n}`,
      sql: `SELECT status, COUNT(*) FROM applications\nGROUP BY status;`,
    },
    {
      id: "ADM-02",
      title: "Quản lý Tin tuyển dụng (Jobs)",
      pageUrl: "/dashboard/jobs",
      controls: [
        "Xem danh sách: Bảng tin tuyển dụng hỗ trợ tìm kiếm và phân trang.",
        "Tạo tin mới: Form nhập Tiêu đề, Mô tả, Phòng ban, Mức lương, Yêu cầu kỹ năng.",
        "Chỉnh sửa nội dung: Cập nhật thông tin chi tiết của tin.",
        "Quản lý kênh đăng tin: Gửi/Đăng tin lên các kênh bên thứ ba.",
      ],
      request: `POST /api/dashboard/jobs\n\nPayload:\n{\n  "title": "React Engineer",\n  "description": "...",\n  "department": "Tech",\n  "status": "published"\n}`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "id": "new-job-uuid" }\n}`,
      sql: `INSERT INTO jobs (id, title, description, department, status, created_at)\nVALUES ('job-uuid', 'React Engineer', '...', 'Tech', 'published', NOW());`,
    },
    {
      id: "ADM-03",
      title: "Quản lý Đơn ứng tuyển (Applications)",
      pageUrl: "/dashboard/applications",
      controls: [
        "Xem danh sách & Chi tiết: Quản lý toàn bộ đơn ứng tuyển từ ứng viên.",
        "Thay đổi trạng thái đơn: Chuyển trạng thái (`applied`, `screening`, `interviewing`, `rejected`).",
        "Gửi email: Mở form soạn thảo email và gửi thông báo trực tiếp đến ứng viên.",
        "Tạo lịch phỏng vấn: Thiết lập lịch hẹn phỏng vấn từ đơn nộp.",
      ],
      request: `PATCH /api/dashboard/applications/app-uuid\n\nPayload:\n{\n  "status": "interviewing"\n}`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "id": "app-uuid", "status": "interviewing" }\n}`,
      sql: `UPDATE applications\nSET status = 'interviewing', updated_at = NOW()\nWHERE id = 'app-uuid';`,
    },
    {
      id: "ADM-04",
      title: "Quản lý Phỏng vấn (Interviews)",
      pageUrl: "/dashboard/interviews",
      controls: [
        "Xem danh sách lịch hẹn: Bảng lịch hẹn phỏng vấn có lọc và tìm kiếm.",
        "Tạo lịch mới: Form chọn Ứng viên, Người phỏng vấn, Ngày giờ, Link meeting.",
        "Đánh giá ứng viên: Nhập điểm số và phản hồi (Technical, Communication, Cultural fit).",
      ],
      request: `POST /api/dashboard/interviews\n\nPayload:\n{\n  "application_id": "app-uuid",\n  "interviewer_id": "hr-user-uuid",\n  "scheduled_at": "2026-05-15T10:00:00Z",\n  "meeting_link": "https://..."\n}`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "id": "iv-uuid" }\n}`,
      sql: `INSERT INTO interviews (id, application_id, interviewer_id, scheduled_at, meeting_link, status)\nVALUES ('iv-uuid', 'app-uuid', 'hr-user-uuid', '2026-05-15...', 'https://...', 'scheduled');`,
    },
    {
      id: "ADM-05",
      title: "Quản lý Email (Email Logs)",
      pageUrl: "/dashboard/emails",
      controls: [
        "Lịch sử email: Bảng danh sách email đã gửi cho ứng viên.",
        "Cột thông tin: Người gửi, Người nhận, Tiêu đề, Trạng thái (sent, pending, failed), Thời gian gửi.",
      ],
      request: `GET /api/dashboard/emails\n\nHeaders:\nCookie: session_token=jwt_value`,
      response: `200 OK\n{\n  "success": true,\n  "data": [\n    {\n      "id": "mail-uuid",\n      "recipient": { "fullName": "Nguyễn Văn A" },\n      "subject": "Thư mời phỏng vấn",\n      "status": "sent"\n    }\n  ]\n}`,
      sql: `SELECT el.id, el.subject, el.status, u.full_name\nFROM email_logs el\nJOIN users u ON el.recipient_id = u.id\nORDER BY el.created_at DESC;`,
    },
  ];

  return (
    <div className="space-y-6">
      {reqs.map((req) => (
        <Card key={req.id} className="border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="font-mono text-xs px-2 py-0 h-5" variant="default">
                  {req.id}
                </Badge>
                <CardTitle className="text-base font-bold text-foreground">
                  {req.title}
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Chi tiết điều khiển, request, response và truy vấn SQL/ORM.
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground select-none">
                Đường dẫn trang:
              </span>
              <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5">
                {req.pageUrl}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {/* Control Details */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5 text-primary" />
                Chi tiết điều khiển
              </span>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {req.controls.map((control, i) => (
                  <li key={i}>{control}</li>
                ))}
              </ul>
            </div>

            {/* Request & Response */}
            <div className="grid sm:grid-cols-2 gap-4 border-t pt-3">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5 text-primary" />
                  API Request
                </span>
                <pre className="p-3 bg-muted/30 border rounded-xl font-mono text-xs text-foreground/90 overflow-x-auto whitespace-pre leading-relaxed">
                  {req.request}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5 text-primary" />
                  API Response
                </span>
                <pre className="p-3 bg-muted/30 border rounded-xl font-mono text-xs text-foreground/90 overflow-x-auto whitespace-pre leading-relaxed">
                  {req.response}
                </pre>
              </div>
            </div>

            {/* SQL Queries */}
            <div className="border-t pt-3 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                <HugeiconsIcon icon={File01Icon} className="size-3.5 text-primary" />
                SQL & ORM Queries
              </span>
              <pre className="p-3 bg-muted/30 border rounded-xl font-mono text-xs text-foreground/90 overflow-x-auto whitespace-pre leading-relaxed">
                {req.sql}
              </pre>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
