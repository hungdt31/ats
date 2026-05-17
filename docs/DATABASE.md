# Database Design Document
# ATS — Applicant Tracking System

| Thông tin | Nội dung |
|-----------|----------|
| **Database** | MySQL / MariaDB |
| **ORM** | Prisma 7 |
| **Encoding** | UTF-8 / utf8mb4 |
| **Ngày cập nhật** | 2026-05-17 |
| **Nguồn** | `prisma/schema.prisma` |

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Sơ đồ quan hệ (ERD)](#2-sơ-đồ-quan-hệ-erd)
3. [Chi tiết bảng](#3-chi-tiết-bảng)
   - [3.1 users](#31-users)
   - [3.2 otp_tokens](#32-otp_tokens)
   - [3.3 candidate_profiles](#33-candidate_profiles)
   - [3.4 files](#34-files)
   - [3.5 jobs](#35-jobs)
   - [3.6 job_channels](#36-job_channels)
   - [3.7 applications](#37-applications)
   - [3.8 application_status_history](#38-application_status_history)
   - [3.9 email_logs](#39-email_logs)
   - [3.10 interviews](#310-interviews)
   - [3.11 interview_scores](#311-interview_scores)
4. [Enum definitions](#4-enum-definitions)
5. [Indexes & Constraints](#5-indexes--constraints)
6. [Quan hệ giữa các bảng](#6-quan-hệ-giữa-các-bảng)
7. [Quy ước đặt tên](#7-quy-ước-đặt-tên)

---

## 1. Tổng quan

Hệ thống ATS sử dụng **11 bảng** chính:

| Bảng | Mô tả | Module liên quan |
|------|-------|-----------------|
| `users` | Tài khoản người dùng (candidate, admin, hr, interviewer) | Auth, Candidate, Dashboard |
| `otp_tokens` | Mã OTP xác thực email và đặt lại mật khẩu | Auth |
| `candidate_profiles` | Hồ sơ chi tiết của ứng viên | Candidate |
| `files` | File upload (CV, portfolio, certificate) qua Appwrite | Candidate |
| `jobs` | Tin tuyển dụng | Dashboard/Jobs, Public |
| `job_channels` | Kênh đăng tin tuyển dụng | Dashboard/Jobs |
| `applications` | Đơn ứng tuyển | Dashboard/Applications, Candidate |
| `application_status_history` | Lịch sử thay đổi trạng thái đơn | Dashboard/Applications |
| `email_logs` | Nhật ký email gửi đến ứng viên | Dashboard/Applications |
| `interviews` | Lịch phỏng vấn | Dashboard/Interviews |
| `interview_scores` | Điểm chấm phỏng vấn | Dashboard/Interviews |

---

## 2. Sơ đồ quan hệ (ERD)

```
users ──────────────────────────────────────────────────────────────┐
  │  (1)                                                             │
  ├──(1:1)──▶ candidate_profiles                                     │
  ├──(1:N)──▶ files                                                  │
  ├──(1:N)──▶ applications [candidate_id]                            │
  ├──(1:N)──▶ application_status_history [changed_by]               │
  ├──(1:N)──▶ email_logs [sender_id]                                 │
  ├──(1:N)──▶ email_logs [recipient_id]                              │
  ├──(1:N)──▶ interviews [interviewer_id]                            │
  ├──(1:N)──▶ interview_scores [evaluator_id]                        │
  └──(1:N)──▶ jobs [created_by]                                      │

jobs ──────────────────────────────────────────────────────────────┐ │
  │  (1)                                                           │ │
  ├──(1:N)──▶ job_channels                                        │ │
  └──(1:N)──▶ applications [job_id]                               │ │
                  │  (1)                                           │ │
                  ├──(1:N)──▶ application_status_history           │ │
                  ├──(1:N)──▶ email_logs [application_id]          │ │
                  └──(1:N)──▶ interviews [application_id]          │ │
                                  │  (1)                           │ │
                                  └──(1:N)──▶ interview_scores     │ │
                                                  │  (N)           │ │
                                                  └──────────────▶ users (evaluator_id)
```

---

## 3. Chi tiết bảng

### 3.1 `users`

Bảng gốc lưu tất cả tài khoản người dùng của hệ thống.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID tự động |
| `email` | VARCHAR(255) | NO | — | UNIQUE | Email đăng nhập |
| `password_hash` | VARCHAR(255) | YES | NULL | — | bcrypt hash (null nếu OAuth) |
| `full_name` | VARCHAR(255) | NO | — | — | Họ tên đầy đủ (min 2 ký tự) |
| `phone` | VARCHAR(20) | YES | NULL | — | Số điện thoại (max 20) |
| `role` | ENUM | NO | `candidate` | — | Vai trò: candidate/admin/hr/interviewer |
| `avatar_url` | TEXT | YES | NULL | — | URL ảnh đại diện |
| `provider` | VARCHAR(50) | YES | NULL | — | `local` hoặc OAuth provider |
| `is_active` | BOOLEAN | NO | `true` | — | Tài khoản có hoạt động không |
| `email_verified` | BOOLEAN | NO | `false` | — | Email đã xác thực chưa |
| `last_login_at` | DATETIME | YES | NULL | — | Thời điểm đăng nhập cuối |
| `created_at` | DATETIME | NO | now() | — | Thời điểm tạo |
| `updated_at` | DATETIME | NO | now() | onUpdate | Thời điểm cập nhật |

**Indexes:**
- `uq_users_email` — UNIQUE trên `email`
- `idx_users_is_active` — trên `is_active`
- `idx_users_role` — trên `role`

---

### 3.2 `otp_tokens`

Lưu mã OTP cho xác thực email và đặt lại mật khẩu.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `email` | VARCHAR(255) | NO | — | — | Email nhận OTP |
| `code` | CHAR(60) | NO | — | — | Mã OTP (6 ký tự, có thể hash) |
| `type` | ENUM | NO | — | — | `email_verify` hoặc `password_reset` |
| `attempts` | TINYINT | NO | `0` | — | Số lần nhập sai |
| `expires_at` | DATETIME | NO | — | — | Thời điểm hết hạn |
| `used_at` | DATETIME | YES | NULL | — | Thời điểm đã sử dụng (null = chưa dùng) |
| `created_at` | DATETIME | NO | now() | — | Thời điểm tạo |

**Indexes:**
- `idx_otp_email_type` — composite trên `(email, type)`

**Ghi chú:** OTP hợp lệ khi `used_at IS NULL` AND `expires_at > NOW()` AND `attempts < MAX_ATTEMPTS`.

---

### 3.3 `candidate_profiles`

Hồ sơ nghề nghiệp chi tiết của ứng viên (1:1 với users).

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `user_id` | CHAR(36) | NO | — | UNIQUE, FK→users | Tham chiếu đến users |
| `title` | VARCHAR(255) | YES | NULL | — | Chức danh nghề nghiệp |
| `bio` | TEXT | YES | NULL | — | Giới thiệu bản thân |
| `location` | VARCHAR(255) | YES | NULL | — | Địa điểm làm việc |
| `years_experience` | SMALLINT | NO | `0` | — | Số năm kinh nghiệm |
| `skills` | JSON | YES | NULL | — | Mảng kỹ năng: `["JavaScript", "React"]` |
| `education` | JSON | YES | NULL | — | Thông tin học vấn |
| `linkedin_url` | VARCHAR(500) | YES | NULL | — | LinkedIn profile URL |
| `github_url` | VARCHAR(500) | YES | NULL | — | GitHub profile URL |
| `created_at` | DATETIME | NO | now() | — | Thời điểm tạo |
| `updated_at` | DATETIME | NO | now() | onUpdate | Thời điểm cập nhật |

**Constraints:**
- `uq_candidate_profiles_user_id` — UNIQUE trên `user_id`
- `fk_cp_user` — FK→users(id) ON DELETE CASCADE

---

### 3.4 `files`

File upload của người dùng, lưu trữ trên Appwrite.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `user_id` | CHAR(36) | NO | — | FK→users | Chủ sở hữu file |
| `file_name` | VARCHAR(255) | NO | — | — | Tên file gốc |
| `file_url` | TEXT | NO | — | — | URL truy cập file (Appwrite) |
| `file_type` | VARCHAR(50) | YES | NULL | — | Loại: `cv`, `portfolio`, `certificate` |
| `appwrite_id` | VARCHAR(255) | YES | NULL | — | ID file trong Appwrite storage |
| `created_at` | DATETIME | NO | now() | — | Thời điểm upload |
| `updated_at` | DATETIME | NO | now() | onUpdate | Thời điểm cập nhật |

**Indexes:**
- `idx_files_user_id` — trên `user_id`

**Constraints:**
- `fk_files_user` — FK→users(id) ON DELETE CASCADE

---

### 3.5 `jobs`

Tin tuyển dụng, bao gồm cả thông tin lương, kỹ năng, trạng thái.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `created_by` | CHAR(36) | NO | — | FK→users | HR/Admin tạo tin |
| `title` | VARCHAR(255) | NO | — | UNIQUE | Tiêu đề tin tuyển dụng |
| `slug` | VARCHAR(300) | NO | — | UNIQUE | URL-friendly slug cho public URL |
| `description` | TEXT | NO | — | — | Mô tả công việc |
| `requirements` | TEXT | YES | NULL | — | Yêu cầu ứng viên |
| `benefits` | TEXT | YES | NULL | — | Quyền lợi |
| `location` | VARCHAR(255) | YES | NULL | — | Địa điểm làm việc |
| `department` | VARCHAR(100) | YES | NULL | — | Phòng ban |
| `category` | VARCHAR(100) | YES | NULL | — | Danh mục ngành nghề |
| `salary_min` | INT | YES | NULL | — | Mức lương tối thiểu (VND) |
| `salary_max` | INT | YES | NULL | — | Mức lương tối đa (VND) |
| `employment_type` | ENUM | NO | `full_time` | — | full_time / part_time / contract |
| `required_skills` | JSON | YES | NULL | — | Mảng kỹ năng yêu cầu |
| `headcount` | SMALLINT | NO | `1` | — | Số lượng tuyển |
| `status` | ENUM | NO | `draft` | — | draft / active / closed / archived |
| `expires_at` | DATE | YES | NULL | — | Hạn đăng tuyển |
| `published_at` | DATETIME | YES | NULL | — | Thời điểm đăng công khai |
| `created_at` | DATETIME | NO | now() | — | Thời điểm tạo |
| `updated_at` | DATETIME | NO | now() | onUpdate | Thời điểm cập nhật |

**Indexes:**
- `uq_jobs_title` — UNIQUE trên `title`
- `uq_jobs_slug` — UNIQUE trên `slug`
- `idx_jobs_status` — trên `status`
- `idx_jobs_slug` — trên `slug`
- `idx_jobs_expires_at` — trên `expires_at`
- `idx_jobs_created_by` — trên `created_by`

**Ghi chú:**
- Chỉ jobs có `status = active` mới hiển thị trên trang public `/jobs`.
- `slug` auto-generate từ `title` + UUID suffix nếu trùng.
- `salary_min ≤ salary_max` được validate ở application layer (Zod).

---

### 3.6 `job_channels`

Kênh đăng tin tuyển dụng, liên kết job với các nền tảng bên ngoài.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `job_id` | CHAR(36) | NO | — | FK→jobs | Tin tuyển dụng |
| `channel` | ENUM | NO | — | — | linkedin / itviec / topcv / vietnamworks / website |
| `external_url` | TEXT | YES | NULL | — | URL bài đăng trên kênh |
| `external_id` | VARCHAR(255) | YES | NULL | — | ID bài đăng trên kênh ngoài |
| `status` | ENUM | NO | `pending` | — | pending / posted / failed / expired / removed |
| `posted_at` | DATETIME | YES | NULL | — | Thời điểm đăng thành công |
| `expires_at` | DATETIME | YES | NULL | — | Hạn đăng trên kênh |
| `error_message` | TEXT | YES | NULL | — | Lỗi nếu đăng thất bại |
| `created_at` | DATETIME | NO | now() | — | Thời điểm thêm kênh |

**Indexes:**
- `uq_job_channel` — UNIQUE composite trên `(job_id, channel)` — mỗi kênh chỉ đăng 1 lần
- `idx_job_channels_status` — trên `status`

**Constraints:**
- `fk_jc_job` — FK→jobs(id) ON DELETE CASCADE

---

### 3.7 `applications`

Đơn ứng tuyển của ứng viên vào một vị trí job cụ thể.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `job_id` | CHAR(36) | NO | — | FK→jobs | Tin tuyển dụng |
| `candidate_id` | CHAR(36) | NO | — | FK→users | Ứng viên (role=candidate) |
| `cv_file_url` | TEXT | NO | — | — | URL file CV (Appwrite) |
| `cv_filename` | VARCHAR(255) | YES | NULL | — | Tên file CV gốc |
| `cover_letter` | TEXT | YES | NULL | — | Thư xin việc |
| `status` | ENUM | NO | `applied` | — | applied/screening/interviewing/offered/hired/rejected |
| `source_channel` | ENUM | YES | NULL | — | Nguồn ứng tuyển: linkedin/itviec/topcv/vietnamworks/website |
| `applied_at` | DATETIME | NO | now() | — | Thời điểm nộp đơn |
| `updated_at` | DATETIME | NO | now() | onUpdate | Thời điểm cập nhật |

**Indexes:**
- `uq_application` — UNIQUE composite trên `(job_id, candidate_id)` — mỗi ứng viên chỉ nộp 1 đơn/job
- `idx_applications_candidate_id` — trên `candidate_id`
- `idx_applications_status` — trên `status`

**Constraints:**
- `fk_app_candidate` — FK→users(id)
- `fk_app_job` — FK→jobs(id)

**Ghi chú:** Vòng đời trạng thái: `applied → screening → interviewing → offered → hired` hoặc `→ rejected` từ bất kỳ bước nào.

---

### 3.8 `application_status_history`

Audit log cho mỗi lần thay đổi trạng thái đơn ứng tuyển.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `application_id` | CHAR(36) | NO | — | FK→applications | Đơn ứng tuyển |
| `changed_by` | CHAR(36) | NO | — | FK→users | Người thay đổi (hr/admin) |
| `from_status` | VARCHAR(50) | YES | NULL | — | Trạng thái cũ (null = trạng thái đầu tiên) |
| `to_status` | VARCHAR(50) | NO | — | — | Trạng thái mới |
| `note` | TEXT | YES | NULL | — | Ghi chú lý do thay đổi |
| `changed_at` | DATETIME | NO | now() | — | Thời điểm thay đổi |

**Indexes:**
- `idx_ash_application_id` — trên `application_id`
- `idx_ash_changed_at` — trên `changed_at`
- `fk_ash_changed_by` — trên `changed_by`

**Constraints:**
- `fk_ash_application` — FK→applications(id) ON DELETE CASCADE
- `fk_ash_changed_by` — FK→users(id)

---

### 3.9 `email_logs`

Nhật ký email gửi đến ứng viên qua Resend.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `application_id` | CHAR(36) | NO | — | FK→applications | Đơn ứng tuyển liên quan |
| `recipient_id` | CHAR(36) | NO | — | FK→users | Người nhận (ứng viên) |
| `sender_id` | CHAR(36) | YES | NULL | FK→users | Người gửi (hr/admin), null nếu tự động |
| `subject` | VARCHAR(500) | NO | — | — | Tiêu đề email |
| `type` | ENUM | NO | — | — | invite / result / reminder / rejection / offer |
| `status` | ENUM | NO | `pending` | — | pending / sent / failed |
| `sent_at` | DATETIME | YES | NULL | — | Thời điểm gửi thành công |
| `error_message` | TEXT | YES | NULL | — | Lỗi nếu gửi thất bại |
| `created_at` | DATETIME | NO | now() | — | Thời điểm tạo record |

**Indexes:**
- `idx_el_application_id` — trên `application_id`
- `idx_el_recipient_id` — trên `recipient_id`
- `idx_el_status` — trên `status`
- `fk_el_sender` — trên `sender_id`

**Constraints:**
- `fk_el_application` — FK→applications(id)
- `fk_el_recipient` — FK→users(id) (relation: email_logs_recipient_idTousers)
- `fk_el_sender` — FK→users(id) nullable (relation: email_logs_sender_idTousers)

---

### 3.10 `interviews`

Lịch phỏng vấn được tạo từ một đơn ứng tuyển.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `application_id` | CHAR(36) | NO | — | FK→applications | Đơn ứng tuyển |
| `interviewer_id` | CHAR(36) | NO | — | FK→users | Người phỏng vấn (role=interviewer) |
| `scheduled_at` | DATETIME | NO | — | — | Ngày giờ phỏng vấn |
| `duration_minutes` | SMALLINT | NO | `60` | — | Thời lượng (phút) |
| `type` | ENUM | NO | `video` | — | phone / video / onsite / technical |
| `status` | ENUM | NO | `scheduled` | — | scheduled / completed / cancelled / rescheduled |
| `meeting_link` | TEXT | YES | NULL | — | Link cuộc họp (cho video) |
| `location` | VARCHAR(255) | YES | NULL | — | Địa điểm (cho onsite) |
| `notes` | TEXT | YES | NULL | — | Ghi chú thêm |
| `created_at` | DATETIME | NO | now() | — | Thời điểm tạo |

**Indexes:**
- `idx_interviews_application_id` — trên `application_id`
- `idx_interviews_interviewer_id` — trên `interviewer_id`
- `idx_interviews_scheduled_at` — trên `scheduled_at`

**Constraints:**
- `fk_iv_application` — FK→applications(id)
- `fk_iv_interviewer` — FK→users(id)

---

### 3.11 `interview_scores`

Điểm đánh giá phỏng vấn do interviewer nhập sau buổi phỏng vấn.

| Cột | Kiểu dữ liệu | Null | Default | Constraint | Mô tả |
|-----|-------------|------|---------|------------|-------|
| `id` | CHAR(36) | NO | uuid() | PK | UUID |
| `interview_id` | CHAR(36) | NO | — | FK→interviews | Buổi phỏng vấn |
| `evaluator_id` | CHAR(36) | NO | — | FK→users | Người chấm điểm |
| `technical_score` | TINYINT | YES | NULL | CHECK 1-10 | Điểm kỹ thuật |
| `communication_score` | TINYINT | YES | NULL | CHECK 1-10 | Điểm giao tiếp |
| `cultural_fit_score` | TINYINT | YES | NULL | CHECK 1-10 | Điểm phù hợp văn hóa |
| `overall_score` | TINYINT | YES | NULL | CHECK 1-10 | Điểm tổng thể |
| `strengths` | TEXT | YES | NULL | — | Điểm mạnh |
| `weaknesses` | TEXT | YES | NULL | — | Điểm yếu |
| `feedback` | TEXT | YES | NULL | — | Nhận xét tổng quan |
| `result` | ENUM | NO | — | — | pass / fail / hold |
| `is_final` | BOOLEAN | NO | `false` | — | Nếu true → cập nhật interview.status = completed |
| `created_at` | DATETIME | NO | now() | — | Thời điểm tạo |

**Indexes:**
- `uq_interview_score` — UNIQUE composite trên `(interview_id, evaluator_id)` — UPSERT pattern
- `idx_is_evaluator_id` — trên `evaluator_id`

**Constraints:**
- `fk_is_interview` — FK→interviews(id)
- `fk_is_evaluator` — FK→users(id)
- CHECK constraint: mỗi score cột trong range 1–10 (database level)

**Ghi chú:** Dùng pattern UPSERT — nếu `(interview_id, evaluator_id)` đã tồn tại thì UPDATE thay vì INSERT.

---

## 4. Enum Definitions

### UserRole
| Giá trị | Mô tả |
|---------|-------|
| `candidate` | Ứng viên — truy cập `/candidate`, nộp đơn, upload CV |
| `admin` | Quản trị viên — full access toàn hệ thống |
| `hr` | HR — quản lý jobs, applications, interviews |
| `interviewer` | Người phỏng vấn — xem lịch PV của mình, chấm điểm |

### OtpType
| Giá trị | Mô tả |
|---------|-------|
| `email_verify` | Xác thực email đăng ký |
| `password_reset` | Đặt lại mật khẩu |

### jobs_status
| Giá trị | Mô tả |
|---------|-------|
| `draft` | Nháp — chưa public |
| `active` | Đang tuyển — hiển thị trên public |
| `closed` | Đã đóng — không nhận đơn mới |
| `archived` | Lưu trữ — ẩn khỏi danh sách |

### jobs_employment_type
| Giá trị | Mô tả |
|---------|-------|
| `full_time` | Toàn thời gian |
| `part_time` | Bán thời gian |
| `contract` | Hợp đồng ngắn hạn |

### applications_status
| Giá trị | Thứ tự | Mô tả |
|---------|--------|-------|
| `applied` | 1 | Mới nộp |
| `screening` | 2 | Đang sàng lọc |
| `interviewing` | 3 | Đang phỏng vấn |
| `offered` | 4 | Đã offer |
| `hired` | 5 | Đã tuyển dụng |
| `rejected` | — | Từ chối (bất kỳ bước) |

### applications_source_channel
| Giá trị | Mô tả |
|---------|-------|
| `linkedin` | LinkedIn |
| `itviec` | ITviec |
| `topcv` | TopCV |
| `vietnamworks` | VietnamWorks |
| `website` | Website công ty |

### interviews_type
| Giá trị | Mô tả |
|---------|-------|
| `phone` | Phỏng vấn qua điện thoại |
| `video` | Phỏng vấn video (Zoom, Meet...) |
| `onsite` | Phỏng vấn trực tiếp |
| `technical` | Bài test kỹ thuật |

### interviews_status
| Giá trị | Mô tả |
|---------|-------|
| `scheduled` | Đã lên lịch |
| `completed` | Đã hoàn thành |
| `cancelled` | Đã hủy |
| `rescheduled` | Đã dời lịch |

### email_logs_type
| Giá trị | Mô tả |
|---------|-------|
| `invite` | Thư mời phỏng vấn |
| `result` | Thông báo kết quả |
| `reminder` | Nhắc nhở |
| `rejection` | Thư từ chối |
| `offer` | Thư offer việc |

### email_logs_status
| Giá trị | Mô tả |
|---------|-------|
| `pending` | Chưa gửi |
| `sent` | Đã gửi thành công |
| `failed` | Gửi thất bại |

### job_channels_channel
| Giá trị | Mô tả |
|---------|-------|
| `linkedin` | LinkedIn Jobs |
| `itviec` | ITviec |
| `topcv` | TopCV |
| `vietnamworks` | VietnamWorks |
| `website` | Website tuyển dụng nội bộ |

### job_channels_status
| Giá trị | Mô tả |
|---------|-------|
| `pending` | Chờ đăng |
| `posted` | Đã đăng thành công |
| `failed` | Đăng thất bại |
| `expired` | Đã hết hạn |
| `removed` | Đã gỡ |

### interview_scores_result
| Giá trị | Mô tả |
|---------|-------|
| `pass` | Đạt |
| `fail` | Không đạt |
| `hold` | Cân nhắc thêm |

---

## 5. Indexes & Constraints

### Unique Constraints tổng hợp

| Bảng | Constraint | Columns | Mô tả |
|------|-----------|---------|-------|
| `users` | `uq_users_email` | `email` | Mỗi email chỉ đăng ký 1 lần |
| `candidate_profiles` | `uq_candidate_profiles_user_id` | `user_id` | 1 profile / 1 user |
| `jobs` | `uq_jobs_title` | `title` | Tiêu đề job không trùng |
| `jobs` | `uq_jobs_slug` | `slug` | Slug không trùng |
| `applications` | `uq_application` | `(job_id, candidate_id)` | 1 đơn / 1 job / 1 ứng viên |
| `job_channels` | `uq_job_channel` | `(job_id, channel)` | 1 kênh / 1 job |
| `interview_scores` | `uq_interview_score` | `(interview_id, evaluator_id)` | 1 scorecard / 1 PV / 1 evaluator |

### Foreign Keys tổng hợp

| Bảng | FK Column | References | On Delete |
|------|----------|-----------|-----------|
| `candidate_profiles` | `user_id` | `users(id)` | CASCADE |
| `files` | `user_id` | `users(id)` | CASCADE |
| `jobs` | `created_by` | `users(id)` | RESTRICT |
| `job_channels` | `job_id` | `jobs(id)` | CASCADE |
| `applications` | `job_id` | `jobs(id)` | RESTRICT |
| `applications` | `candidate_id` | `users(id)` | RESTRICT |
| `application_status_history` | `application_id` | `applications(id)` | CASCADE |
| `application_status_history` | `changed_by` | `users(id)` | RESTRICT |
| `email_logs` | `application_id` | `applications(id)` | RESTRICT |
| `email_logs` | `recipient_id` | `users(id)` | RESTRICT |
| `email_logs` | `sender_id` | `users(id)` | SET NULL |
| `interviews` | `application_id` | `applications(id)` | RESTRICT |
| `interviews` | `interviewer_id` | `users(id)` | RESTRICT |
| `interview_scores` | `interview_id` | `interviews(id)` | RESTRICT |
| `interview_scores` | `evaluator_id` | `users(id)` | RESTRICT |

---

## 6. Quan hệ giữa các bảng

```
users (1) ──── (1) candidate_profiles
users (1) ──── (N) files
users (1) ──── (N) jobs                         [created_by]
users (1) ──── (N) applications                 [candidate_id]
users (1) ──── (N) application_status_history   [changed_by]
users (1) ──── (N) email_logs                   [recipient_id]
users (1) ──── (N) email_logs                   [sender_id]
users (1) ──── (N) interviews                   [interviewer_id]
users (1) ──── (N) interview_scores             [evaluator_id]

jobs (1) ──── (N) job_channels
jobs (1) ──── (N) applications

applications (1) ──── (N) application_status_history
applications (1) ──── (N) email_logs
applications (1) ──── (N) interviews

interviews (1) ──── (N) interview_scores
```

---

## 7. Quy ước đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Tên bảng | snake_case, số nhiều | `users`, `job_channels`, `interview_scores` |
| Tên cột | snake_case | `full_name`, `created_at`, `is_active` |
| Primary Key | `id` CHAR(36) UUID | `id` |
| Foreign Key | `{referenced_table_singular}_id` | `job_id`, `user_id` |
| Timestamp | `created_at`, `updated_at` | — |
| Boolean | prefix `is_` | `is_active`, `is_final` |
| Soft delete | không dùng — dùng `is_active` cho users | — |
| Index | `idx_{table}_{column}` | `idx_users_role` |
| Unique | `uq_{table}_{column}` | `uq_users_email` |
| FK constraint | `fk_{short}_{column}` | `fk_app_candidate` |
| Prisma model | PascalCase → map sang snake_case | `User` → `users` |
| Enum (Prisma) | snake_case value | `full_time`, `email_verify` |

---

*Tài liệu tham khảo: `prisma/schema.prisma` — Cập nhật: 2026-05-17*
