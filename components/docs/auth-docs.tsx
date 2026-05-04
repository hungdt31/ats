"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, ArrowDown01Icon, ArrowUp01Icon, File01Icon } from "@hugeicons/core-free-icons";

export function AuthDocs() {
  const reqs = [
    {
      id: "AUTH-01",
      title: "Đăng nhập vào hệ thống",
      pageUrl: "/login",
      controls: [
        "Ô nhập Email: Bắt buộc, kiểm tra định dạng email.",
        "Ô nhập Mật khẩu: Bắt buộc, ẩn ký tự.",
        "Nút bấm 'Đăng nhập': Kích hoạt gửi request login qua API.",
      ],
      request: `POST /api/auth/login\n\nPayload:\n{\n  "email": "user@example.com",\n  "password": "mypassword"\n}`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "ok": true }\n}`,
      sql: `SELECT * FROM users\nWHERE email = 'user@example.com';\n\nUPDATE users\nSET last_login_at = NOW()\nWHERE id = 'user-id-uuid';`,
    },
    {
      id: "AUTH-02",
      title: "Đăng ký tài khoản mới",
      pageUrl: "/register",
      controls: [
        "Ô nhập Họ và tên: Bắt buộc, tối thiểu 2 ký tự.",
        "Ô nhập Email: Bắt buộc, kiểm tra trùng lặp trong DB.",
        "Ô nhập Mật khẩu: Bắt buộc, tối thiểu 6 ký tự.",
        "Nút bấm 'Đăng ký': Tạo mới tài khoản.",
      ],
      request: `POST /api/auth/register\n\nPayload:\n{\n  "email": "user@example.com",\n  "password": "mypassword",\n  "fullName": "Nguyễn Văn A"\n}`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "id": "uuid-string-of-user" }\n}`,
      sql: `INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)\nVALUES ('uuid', 'user@example.com', 'hashed_pwd', 'Nguyễn Văn A', 'candidate', 1, NOW(), NOW());`,
    },
    {
      id: "AUTH-03",
      title: "Đăng xuất khỏi hệ thống",
      pageUrl: "/dashboard | /candidate",
      controls: [
        "Nút bấm 'Đăng xuất' (Avatar / Menu): Gọi API thu hồi token.",
      ],
      request: `POST /api/auth/logout\n\nPayload:\nN/A`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "ok": true }\n}`,
      sql: `-- Xóa cookie session, không tác động trực tiếp đến bảng DB`,
    },
    {
      id: "AUTH-04",
      title: "Lấy thông tin hồ sơ hiện tại (Profile/Me)",
      pageUrl: "Tất cả các trang yêu cầu xác thực",
      controls: [
        "Xử lý tự động khi load ứng dụng để render navbar / phân quyền.",
      ],
      request: `GET /api/auth/me\n\nHeaders:\nCookie: session_token=jwt_value`,
      response: `200 OK\n{\n  "success": true,\n  "data": {\n    "id": "uuid",\n    "email": "user@example.com",\n    "fullName": "Nguyễn Văn A",\n    "role": "candidate"\n  }\n}`,
      sql: `SELECT id, email, full_name, role FROM users\nWHERE id = 'user-uuid-from-jwt';`,
    },
    {
      id: "AUTH-05",
      title: "Cập nhật / Đổi mật khẩu",
      pageUrl: "/candidate",
      controls: [
        "Ô nhập Mật khẩu hiện tại: Bắt buộc.",
        "Ô nhập Mật khẩu mới: Bắt buộc, tối thiểu 6 ký tự.",
        "Nút bấm 'Cập nhật mật khẩu'.",
      ],
      request: `POST /api/auth/password\n\nPayload:\n{\n  "oldPassword": "currentPassword",\n  "newPassword": "newPassword6Char"\n}`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "updated": true }\n}`,
      sql: `SELECT password_hash FROM users\nWHERE id = 'user-id-uuid';\n\nUPDATE users\nSET password_hash = 'new_hashed_password', updated_at = NOW()\nWHERE id = 'user-id-uuid';`,
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
