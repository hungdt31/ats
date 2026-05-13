# API Dashboard Phỏng vấn — Mô tả Request

Tài liệu này mô tả **request** (query, path, body, session) cho các endpoint phục vụ module `@app/dashboard/interviews`, định dạng bảng theo mẫu nội bộ.

## Chuẩn chung

- **Thành công:** HTTP `200`, body `{ "success": true, "data": … }`.
- **Lỗi:** HTTP `4xx` / `5xx`, body `{ "success": false, "error": "…" }` (có thể có thêm `fieldErrors`).
- **Session:** Cookie đăng nhập Next.js/JWT tuỳ dự án; không có body field `Authorization` trong code hiện tại.

---

## API 1 — `GET /api/dashboard/interviews`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `GET /api/dashboard/interviews` |
| **APINo.** | `1` |
| **Khái quát chức năng** | Lấy danh sách lịch phỏng vấn (có thể lọc theo `status`); interviewer chỉ thấy buổi được gán cho mình. |
| **Định dạng message** | Không có body JSON. |
| **URL** | `/api/dashboard/interviews` |

### Bảng request

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | Tham số lọc trạng thái | `status` | String (query) | — | No | Một trong: `scheduled`, `completed`, `cancelled`, `rescheduled`. Bỏ qua = lấy tất cả. |
| 2 | 1 | Phiên làm việc | — | Cookie / Header session | — | Yes | Đăng nhập HR/Admin/Interviewer; candidate bị từ chối (`401`). |

---

## API 2 — `GET /api/dashboard/interviews/metadata`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `GET /api/dashboard/interviews/metadata` |
| **APINo.** | `2` |
| **Khái quát chức năng** | Lấy dữ liệu phục vụ form lên lịch: danh sách đơn ứng tuyển (kèm ứng viên, job) và danh sách user có thể làm phỏng vấn viên. |
| **Định dạng message** | Không có body. |
| **URL** | `/api/dashboard/interviews/metadata` |

### Bảng request

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | Phiên làm việc | — | Cookie / Header session | — | Yes | Chỉ **admin** hoặc **hr** (`401` nếu không đủ quyền). |

Không có query string, không có body.

---

## API 3 — `POST /api/dashboard/interviews`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `POST /api/dashboard/interviews` |
| **APINo.** | `3` |
| **Khái quát chức năng** | Tạo buổi phỏng vấn mới. |
| **Định dạng message** | `application/json` |
| **URL** | `/api/dashboard/interviews` |

### Bảng request (body)

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | ID đơn ứng tuyển | `application_id` | String (UUID) | 36 ký tự | Yes | Khóa ngoại `applications.id`. |
| 2 | 1 | ID phỏng vấn viên | `interviewer_id` | String (UUID) | 36 | Yes | `User.id` được giao phỏng vấn. |
| 3 | 1 | Thời gian bắt đầu | `scheduled_at` | String (ISO datetime) | — | Yes | Server: `new Date(scheduled_at)`. |
| 4 | 1 | Thời lượng (phút) | `duration_minutes` | Number | — | No | Mặc định **60** nếu không gửi hoặc không parse được. |
| 5 | 1 | Hình thức PV | `type` | String | — | No | `video` \| `phone` \| `onsite` \| `technical` (enum `interviews_type`). |
| 6 | 1 | Link họp trực tuyến | `meeting_link` | String | Text | No | Có thể `null`. |
| 7 | 1 | Địa điểm | `location` | String | Max ~255 | No | Có thể `null`. |
| 8 | 1 | Ghi chú nội bộ | `notes` | String | Text | No | Có thể `null`. |
| 9 | 1 | Phiên làm việc | — | Cookie / Header session | — | Yes | Chỉ **admin** / **hr**. |

---

## API 4 — `GET /api/dashboard/interviews/{id}`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `GET /api/dashboard/interviews/{id}` |
| **APINo.** | `4` |
| **Khái quát chức năng** | Lấy chi tiết một buổi phỏng vấn (ứng viên, job, PV viên, danh sách điểm đánh giá). |
| **Định dạng message** | Không có body. |
| **URL** | `/api/dashboard/interviews/{id}` |

### Bảng request

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | ID buổi phỏng vấn | `id` | String (UUID, path) | 36 | Yes | Path parameter `{id}`. |
| 2 | 1 | Phiên làm việc | — | Cookie / Header session | — | Yes | Không phải **candidate**. |

---

## API 5 — `PATCH /api/dashboard/interviews/{id}`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `PATCH /api/dashboard/interviews/{id}` |
| **APINo.** | `5` |
| **Khái quát chức năng** | Cập nhật trạng thái buổi phỏng vấn. |
| **Định dạng message** | `application/json` |
| **URL** | `/api/dashboard/interviews/{id}` |

### Bảng request

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | ID buổi phỏng vấn | `id` | String (UUID, path) | 36 | Yes | Path parameter `{id}`. |
| 2 | 1 | Trạng thái mới | `status` | String | — | Yes | `scheduled` \| `completed` \| `cancelled` \| `rescheduled` (`interviews_status`). |
| 3 | 1 | Phiên làm việc | — | Cookie / Header session | — | Yes | Không phải **candidate**. |

---

## API 6 — `GET /api/dashboard/interviews/{id}` *(màn chấm điểm)*

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `GET /api/dashboard/interviews/{id}` |
| **APINo.** | `6` |
| **Khái quát chức năng** | Cùng endpoint với API 4 — dùng trên màn chấm điểm để lấy ngữ cảnh ứng viên / vị trí. |
| **Định dạng message** | Không có body. |
| **URL** | `/api/dashboard/interviews/{id}` |

### Bảng request

Giống **API 4** (path `id` + session).

---

## API 7 — `POST /api/dashboard/interviews/{id}/score`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `POST /api/dashboard/interviews/{id}/score` |
| **APINo.** | `7` |
| **Khái quát chức năng** | Tạo hoặc cập nhật (upsert) bảng điểm của **user đăng nhập** cho buổi PV đó (khóa `interview_id` + `evaluator_id`). |
| **Định dạng message** | `application/json` |
| **URL** | `/api/dashboard/interviews/{id}/score` |

### Bảng request (body + path)

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | ID buổi phỏng vấn | `id` | String (UUID, path) | 36 | Yes | Path parameter `{id}` (trước `/score`). |
| 2 | 1 | Điểm kỹ thuật | `technical_score` | Number | 1–10 | No | Server `parseInt`; có thể lưu `null`. |
| 3 | 1 | Điểm giao tiếp | `communication_score` | Number | 1–10 | No | |
| 4 | 1 | Điểm cultural fit | `cultural_fit_score` | Number | 1–10 | No | |
| 5 | 1 | Điểm chung | `overall_score` | Number | 1–10 | No | |
| 6 | 1 | Điểm mạnh | `strengths` | String | Text | No | |
| 7 | 1 | Điểm yếu | `weaknesses` | String | Text | No | |
| 8 | 1 | Phản hồi chi tiết | `feedback` | String | Text | No | |
| 9 | 1 | Kết quả đánh giá | `result` | String | — | **Yes** | `pass` \| `fail` \| `hold` (`interview_scores_result`). |
| 10 | 1 | Đánh dấu kết quả cuối | `is_final` | Boolean | — | No | Mặc định `false`. |
| 11 | 1 | Người chấm | — | — | — | — | **Không gửi trong body**; server dùng `session.user.id` làm `evaluator_id`. |
| 12 | 1 | Phiên làm việc | — | Cookie / Header session | — | Yes | Không phải **candidate**. |

---

## Ghi chú triển khai

- Trong mã nguồn Next.js App Router, dynamic segment viết là `[id]`; trong tài liệu URL có thể thống nhất ký hiệu `{id}`.
- Bảng `interviews` và `interview_scores` định nghĩa trong `prisma/schema.prisma`.
- File route tương ứng: `app/api/dashboard/interviews/route.ts`, `metadata/route.ts`, `[id]/route.ts`, `[id]/score/route.ts`.
