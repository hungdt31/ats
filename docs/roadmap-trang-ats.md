# Roadmap trang ATS — tận dụng schema Prisma

Tài liệu liệt kê các trang nên làm, **bảng dữ liệu** liên quan và **mục đích**, căn theo `prisma/schema.prisma`.

---

## 0. Trang chủ & khám phá việc làm

| Đường dẫn | Bảng | Mục đích |
|-----------|------|----------|
| `/` | `jobs` (đọc), `users` (qua session JWT nếu đăng nhập) | **Landing giới thiệu** việc làm: hero, nút **Đăng nhập / Đăng ký** khi chưa đăng nhập; khi đã đăng nhập hiển thị **menu người dùng** (avatar/thông tin + đăng xuất) như `UserNav`; hiển thị **một số tin** `jobs.status = active`; nút **Xem tất cả** → `/jobs`. |

---

## 1. Auth & User Management

| Đường dẫn | Bảng | Mục đích |
|-----------|------|----------|
| `/login` | `users` | Đăng nhập; kiểm tra email / password hash; cập nhật `last_login_at`. |
| `/register` | `users` | Đăng ký ứng viên (role mặc định `candidate`); chống trùng email. |
| `/account/profile` | `users` | Cập nhật `full_name`, `phone`, `avatar_url`; đổi mật khẩu. |
| `/admin/users` | `users` | Admin: danh sách user, lọc `role`, bật/tắt `is_active`, reset mật khẩu. |

---

## 2. Candidate Experience

| Đường dẫn | Bảng | Mục đích |
|-----------|------|----------|
| `/candidate` | `users`, `applications`, `jobs` | Dashboard ứng viên: tóm tắt đơn ứng tuyển, job gợi ý. |
| `/candidate/profile` | `candidate_profiles`, `users` | Hồ sơ chi tiết: `skills`, `education`, link LinkedIn/GitHub, kinh nghiệm. |
| `/jobs` | `jobs` | Danh sách tin `active`; lọc location / category / department / employment_type. |
| `/jobs/[id]` | `jobs`, `job_channels` | Chi tiết tin + thông tin đăng đa kênh + nộp đơn upload cv và mô tả công việc |
| `/candidate/applications` | `applications`, `jobs` | Lịch sử ứng tuyển của candidate. |
| `/candidate/applications/[id]` | `applications`, `application_status_history`, `interviews`, `email_logs` | Chi tiết một đơn: timeline trạng thái, PV, email. |

---

## 3. HR / Admin — Job Management

| Đường dẫn | Bảng | Mục đích |
|-----------|------|----------|
| `/dashboard` | `jobs`, `applications`, `interviews` | Trang chủ nội bộ: KPI nhanh (job active, đơn mới, lịch PV). |
| `/dashboard/jobs` | `jobs`, `users` | Quản lý tin theo `status`. |
| `/dashboard/jobs/new` | `jobs` | Tạo tin (draft/active): `required_skills`, lương, headcount. |
| `/dashboard/jobs/[id]/edit` | `jobs` | Sửa tin; publish / đóng / archive. |
| `/dashboard/jobs/[id]/channels` | `job_channels` | Multi-channel: URL external, trạng thái posted/failed/expired. |

---

## 4. Pipeline ứng tuyển (ATS Core)

| Đường dẫn | Bảng | Mục đích |
|-----------|------|----------|
| `/dashboard/applications` | `applications`, `jobs`, `users` | Kanban/list pipeline; lọc job / status / `source_channel`. |
| `/dashboard/applications/[id]` | `applications`, `application_status_history`, `interviews`, `interview_scores`, `email_logs` | Hồ sơ đơn ứng tuyển. |
| `/dashboard/applications/[id]/status` (modal hoặc tab) | `applications`, `application_status_history` | Đổi trạng thái + ghi chú audit. |

---

## 5. Phỏng vấn

| Đường dẫn | Bảng | Mục đích |
|-----------|------|----------|
| `/dashboard/interviews` | `interviews`, `applications`, `users` | Lịch PV theo ngày/tuần; trạng thái scheduled/completed/cancelled. |
| `/dashboard/interviews/new` | `interviews` | Tạo PV (query `applicationId`): type, duration, link / địa điểm. |
| `/dashboard/interviews/[id]` | `interviews`, `applications`, `users`, `interview_scores` | Chi tiết buổi PV + scorecard. |
| `/dashboard/interviews/[id]/score` | `interview_scores` | Chấm điểm; `pass`/`fail`/`hold`; `is_final`. |

---

## 6. Email / Audit

| Đường dẫn | Bảng | Mục đích |
|-----------|------|----------|
| `/dashboard/emails` | `email_logs`, `applications`, `users` | Audit email (invite/result/reminder/rejection/offer); trạng thái sent/failed. |
| `/dashboard/applications/[id]/emails` | `email_logs` | Email theo từng application. |

---

## 7. Báo cáo

| Đường dẫn | Bảng | Mục đích |
|-----------|------|----------|
| `/dashboard/reports` | `jobs`, `applications`, `interviews`, `interview_scores`, `job_channels`, `email_logs` | Funnel tuyển dụng, conversion, hiệu suất PV. |
| `/dashboard/reports/source-performance` | `job_channels`, `applications` | So sánh hiệu quả kênh đăng tin. |

---

## 8. Ánh xạ nhanh: bảng → module trang

| Bảng | Trang / module chính |
|------|----------------------|
| `users` | Auth, profile, admin users |
| `candidate_profiles` | Hồ sơ ứng viên |
| `jobs` | Public jobs + HR quản lý tin |
| `job_channels` | Đăng đa kênh + báo cáo nguồn |
| `applications` | Apply + pipeline ATS + đơn của candidate |
| `application_status_history` | Timeline / audit trạng thái |
| `interviews` | Lịch & chi tiết PV |
| `interview_scores` | Scorecard |
| `email_logs` | Audit gửi mail |

---

*Tài liệu có thể cập nhật khi thêm feature hoặc đổi route.*
