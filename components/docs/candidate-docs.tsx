"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, ArrowDown01Icon, ArrowUp01Icon, File01Icon } from "@hugeicons/core-free-icons";

export function CandidateDocs() {
  const reqs = [
    {
      id: "CAND-01",
      title: "Quản lý Hồ sơ (Profile)",
      pageUrl: "/candidate (Tab: Hồ sơ cá nhân)",
      controls: [
        "Ô nhập Chức danh (Title): Tùy chọn.",
        "Ô nhập Giới thiệu bản thân (Bio): Tùy chọn.",
        "Ô nhập Số năm kinh nghiệm: Kiểu số.",
        "Các trường liên kết LinkedIn, GitHub.",
        "Nút bấm 'Lưu thay đổi': Cập nhật hồ sơ.",
      ],
      request: `PUT /api/candidate/profile\n\nPayload:\n{\n  "title": "Software Engineer",\n  "bio": "Đam mê lập trình",\n  "years_experience": 3,\n  "skills": ["React", "TypeScript"]\n}`,
      response: `200 OK\n{\n  "success": true,\n  "data": { "updated": true }\n}`,
      sql: `SELECT * FROM candidate_profiles\nWHERE user_id = 'user-uuid';\n\nUPDATE candidate_profiles\nSET title = 'Software Engineer', bio = 'Đam mê lập trình', years_experience = 3\nWHERE user_id = 'user-uuid';`,
    },
    {
      id: "CAND-02",
      title: "Quản lý CV/Tài liệu",
      pageUrl: "/candidate (Tab: Hồ sơ cá nhân)",
      controls: [
        "Input File: Chọn file CV hoặc chứng chỉ từ máy tính (PDF, DOCX).",
        "Nút bấm 'Tải lên': Upload file trực tiếp lên Appwrite Storage.",
      ],
      request: `POST /api/candidate/files\n\nHeaders:\nContent-Type: multipart/form-data\n\nPayload:\nFile object (cv_file)`,
      response: `200 OK\n{\n  "success": true,\n  "data": {\n    "fileId": "file-uuid",\n    "fileUrl": "https://storage.example.com/file.pdf",\n    "filename": "cv.pdf"\n  }\n}`,
      sql: `INSERT INTO files (id, user_id, filename, file_url, created_at)\nVALUES ('file-uuid', 'user-uuid', 'cv.pdf', 'https://storage...', NOW());`,
    },
    {
      id: "CAND-03",
      title: "Quản lý Ứng tuyển",
      pageUrl: "/candidate (Tab: Đơn ứng tuyển)",
      controls: [
        "Bảng/Danh sách các đơn ứng tuyển: Xem danh sách vị trí đã nộp.",
        "Cột thông tin: Tên công việc, Ngày nộp đơn, Trạng thái (Applied, Screening, Interviewing...).",
      ],
      request: `GET /api/candidate/applications\n\nHeaders:\nCookie: session_token=jwt_value`,
      response: `200 OK\n{\n  "success": true,\n  "data": [\n    {\n      "id": "app-uuid",\n      "job": { "title": "Frontend Developer" },\n      "status": "applied",\n      "applied_at": "2026-05-01T12:00:00Z"\n    }\n  ]\n}`,
      sql: `SELECT app.id, app.status, app.applied_at, job.title\nFROM applications app\nJOIN jobs job ON app.job_id = job.id\nWHERE app.candidate_id = 'user-uuid';`,
    },
    {
      id: "CAND-04",
      title: "Lịch Phỏng vấn",
      pageUrl: "/candidate (Tab: Lịch phỏng vấn)",
      controls: [
        "Bảng/Danh sách lịch phỏng vấn cá nhân.",
        "Cột thông tin: Vị trí phỏng vấn, Thời gian, Hình thức, Link meeting.",
      ],
      request: `GET /api/candidate/interviews\n\nHeaders:\nCookie: session_token=jwt_value`,
      response: `200 OK\n{\n  "success": true,\n  "data": [\n    {\n      "id": "iv-uuid",\n      "scheduled_at": "2026-05-10T14:00:00Z",\n      "type": "video",\n      "meeting_link": "https://meet.google.com/xxx-xxxx-xxx",\n      "status": "scheduled"\n    }\n  ]\n}`,
      sql: `SELECT iv.id, iv.scheduled_at, iv.type, iv.meeting_link, iv.status\nFROM interviews iv\nJOIN applications app ON iv.application_id = app.id\nWHERE app.candidate_id = 'user-uuid';`,
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
