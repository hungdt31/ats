"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, ArrowDown01Icon, ArrowUp01Icon, File01Icon } from "@hugeicons/core-free-icons";

export function PublicJobsDocs() {
  const reqs = [
    {
      id: "PUB-01",
      title: "Xem danh sách các tin tuyển dụng đang mở",
      pageUrl: "/jobs",
      controls: [
        "Ô tìm kiếm: Lọc danh sách theo tiêu đề công việc.",
        "Dropdown Lọc: Lọc theo địa điểm, phòng ban, hình thức làm việc.",
        "Phân trang: Di chuyển giữa các trang danh sách công việc (9 tin/trang).",
      ],
      request: `GET /api/jobs\n\nHeaders:\nN/A`,
      response: `200 OK\n{\n  "success": true,\n  "data": [\n    {\n      "id": "job-uuid",\n      "title": "Frontend Developer",\n      "location": "Hà Nội",\n      "department": "Tech",\n      "employment_type": "full_time"\n    }\n  ]\n}`,
      sql: `SELECT * FROM jobs\nWHERE status = 'published'\nORDER BY created_at DESC;`,
    },
    {
      id: "PUB-02",
      title: "Xem chi tiết nội dung của tin tuyển dụng cụ thể",
      pageUrl: "/jobs/[id]",
      controls: [
        "Xem đầy đủ thông tin: Mô tả công việc, Yêu cầu, Quyền lợi, Mức lương.",
        "Nút bấm 'Ứng tuyển ngay': Mở form ứng tuyển hoặc cuộn xuống form nộp đơn.",
      ],
      request: `GET /api/jobs/job-uuid\n\nHeaders:\nN/A`,
      response: `200 OK\n{\n  "success": true,\n  "data": {\n    "id": "job-uuid",\n    "title": "Frontend Developer",\n    "description": "...",\n    "requirements": "...",\n    "benefits": "...",\n    "status": "published"\n  }\n}`,
      sql: `SELECT * FROM jobs\nWHERE id = 'job-uuid' AND status = 'published';`,
    },
    {
      id: "PUB-03",
      title: "Nộp đơn ứng tuyển (Apply)",
      pageUrl: "/jobs/[id]",
      controls: [
        "Input File: Tải lên CV (PDF, DOCX) - Bắt buộc.",
        "Textarea Thư giới thiệu (Cover Letter): Tùy chọn.",
        "Nút bấm 'Nộp đơn ứng tuyển': Gửi hồ sơ tham gia tuyển dụng.",
      ],
      request: `POST /api/candidate/applications\n\nPayload:\n{\n  "job_id": "job-uuid",\n  "cv_file_url": "https://storage.example.com/cv.pdf",\n  "cv_filename": "my-cv.pdf",\n  "cover_letter": "Thư giới thiệu của tôi..."\n}`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "id": "application-uuid" }\n}`,
      sql: `INSERT INTO applications (id, job_id, candidate_id, cv_file_url, cv_filename, cover_letter, status, applied_at, updated_at)\nVALUES ('app-uuid', 'job-uuid', 'candidate-uuid', 'https://...', 'cv.pdf', 'Thư giới thiệu...', 'applied', NOW(), NOW());`,
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
