# API Dashboard Phỏng vấn — Mô tả Response

Định dạng **`application/json`**. Chuẩn lỗi: `{ "success": false, "error": "..." }`.

Trong các bảng dưới, cột **Bắt buộc**: **O** = luôn có trong đúng **loại response** được ghi ở cột **Ghi chú** (200 thành công / lỗi).

---

## API 1 — `GET /api/dashboard/interviews`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `GET /api/dashboard/interviews` |
| **APINo.** | `1` |
| **Khái quát chức năng** | Trả danh sách buổi phỏng vấn (lọc theo `status` nếu có); interviewer chỉ thấy buổi được gán. |
| **Định dạng media** | `application/json` |
| **URL** | `/api/dashboard/interviews` |

### Bảng response

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | Cờ thành công | `success` | Boolean | — | O | `true` khi HTTP 200. |
| 2 | 1 | Payload dữ liệu | `data` | Array | — | O | HTTP 200. Mảng phần tử kiểu `interviews` kèm quan hệ (xem các dòng cấp 2). |
| 3 | 1 | Thông báo lỗi | `error` | String | — | O | HTTP 401, 500. Khi `success: true` thường **không** có khóa này. |
| 4 | 2 | ID buổi PV | `id` | String (UUID) | 36 | O | Phần tử trong `data[]`. |
| 5 | 2 | FK đơn ứng tuyển | `application_id` | String | 36 | O | |
| 6 | 2 | FK phỏng vấn viên | `interviewer_id` | String | 36 | O | |
| 7 | 2 | Thời gian bắt đầu | `scheduled_at` | String (ISO 8601) | — | O | Chuỗi thời gian sau serialize JSON. |
| 8 | 2 | Thời lượng (phút) | `duration_minutes` | Number | — | O | |
| 9 | 2 | Hình thức | `type` | String | — | O | Enum `interviews_type`. |
| 10 | 2 | Trạng thái | `status` | String | — | O | Enum `interviews_status`. |
| 11 | 2 | Link họp | `meeting_link` | String \| null | Text | — | Có thể `null`. |
| 12 | 2 | Địa điểm | `location` | String \| null | ≤255 | — | |
| 13 | 2 | Ghi chú | `notes` | String \| null | Text | — | |
| 14 | 2 | Ngày tạo | `created_at` | String (ISO 8601) | — | O | |
| 15 | 2 | Thông tin đơn / ứng viên / job | `applications` | Object | — | O | Nested; API `include` đầy đủ record `applications` + `users`, `jobs` (subset). |
| 16 | 3 | ID đơn | `id` | String | 36 | O | Trong object `applications`. |
| 17 | 3 | FK job / candidate | `job_id`, `candidate_id` | String | 36 | O | Theo schema Prisma. |
| 18 | 3 | Trạng thái đơn, CV, ngày nộp, … | `status`, `cv_file_url`, … | Mixed | — | O | Các cột bảng `applications` khác như API trả về. |
| 19 | 3 | Ứng viên (user) | `users` | Object | — | O | `select`: `fullName`, `email`. |
| 20 | 3 | Vị trí tuyển | `jobs` | Object | — | O | `select`: `title` (và các cột khác của `jobs` nếu có trong JSON). |
| 21 | 2 | Người phỏng vấn | `users` | Object | — | O | Interviewer (cùng key `users` ở cấp interview); `select`: `fullName`, `email`. |

*(Nếu list trả về rỗng: `success: true`, `data: []`.)*

---

## API 2 — `GET /api/dashboard/interviews/metadata`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `GET /api/dashboard/interviews/metadata` |
| **APINo.** | `2` |
| **Khái quát chức năng** | Trả danh sách đơn ứng tuyển + danh sách user được phép làm interviewer cho form lên lịch. |
| **Định dạng media** | `application/json` |
| **URL** | `/api/dashboard/interviews/metadata` |

### Bảng response

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | Cờ thành công | `success` | Boolean | — | O | `true` khi 200. |
| 2 | 1 | Payload | `data` | Object | — | O | HTTP 200. |
| 3 | 1 | Thông báo lỗi | `error` | String | — | O | HTTP 401, 500. |
| 4 | 2 | Danh sách đơn | `applications` | Array | — | O | Trong `data`. |
| 5 | 3 | Phần tử đơn | — | Object | — | O | Mỗi phần tử: các trường `applications` + `users` (`fullName`, `email`) + `jobs` (`title`). |
| 6 | 2 | Danh sách PV viên | `interviewers` | Array | — | O | Trong `data`. |
| 7 | 3 | Phần tử user | — | Object | — | O | `id`, `fullName`, `email`, `role`. |

---

## API 3 — `POST /api/dashboard/interviews`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `POST /api/dashboard/interviews` |
| **APINo.** | `3` |
| **Khái quát chức năng** | Trả bản ghi `interviews` vừa tạo. |
| **Định dạng media** | `application/json` |
| **URL** | `/api/dashboard/interviews` |

### Bảng response

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | Cờ thành công | `success` | Boolean | — | O | `true` khi 200. |
| 2 | 1 | Bản ghi interview | `data` | Object | — | O | HTTP 200. Không `include` quan hệ trong route. |
| 3 | 1 | Thông báo lỗi | `error` | String | — | O | HTTP 401, 400, 500. |
| 4 | 2 | ID | `id` | String | 36 | O | Trong `data`. |
| 5 | 2 | `application_id` | `application_id` | String | 36 | O | |
| 6 | 2 | `interviewer_id` | `interviewer_id` | String | 36 | O | |
| 7 | 2 | `scheduled_at` | `scheduled_at` | String (ISO) | — | O | |
| 8 | 2 | `duration_minutes` | `duration_minutes` | Number | — | O | |
| 9 | 2 | `type` | `type` | String | — | O | |
| 10 | 2 | `meeting_link` | `meeting_link` | String \| null | — | — | |
| 11 | 2 | `location` | `location` | String \| null | — | — | |
| 12 | 2 | `notes` | `notes` | String \| null | — | — | |
| 13 | 2 | `status` | `status` | String | — | O | Mặc định DB (thường `scheduled`). |
| 14 | 2 | `created_at` | `created_at` | String (ISO) | — | O | |

---

## API 4 — `GET /api/dashboard/interviews/{id}`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `GET /api/dashboard/interviews/{id}` |
| **APINo.** | `4` |
| **Khái quát chức năng** | Trả chi tiết một buổi PV, kèm đơn/ứng viên/job, interviewer, và mảng điểm đánh giá. |
| **Định dạng media** | `application/json` |
| **URL** | `/api/dashboard/interviews/{id}` |

### Bảng response

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | Cờ thành công | `success` | Boolean | — | O | `true` khi 200. |
| 2 | 1 | Chi tiết interview | `data` | Object | — | O | HTTP 200. |
| 3 | 1 | Thông báo lỗi | `error` | String | — | O | HTTP 401, 404, 500. |
| 4 | 2 | Các trường scalar interview | `id`, `application_id`, `interviewer_id`, `scheduled_at`, `duration_minutes`, `type`, `status`, `meeting_link`, `location`, `notes`, `created_at` | Mixed | — | O | Tương tự API 1 phần tử danh sách. |
| 5 | 2 | Đơn ứng tuyển | `applications` | Object | — | O | `include` đầy đủ; con `users` (`fullName`, `email`), `jobs` (`title`). |
| 6 | 2 | Interviewer | `users` | Object | — | O | `id`, `fullName`, `email`. |
| 7 | 2 | Danh sách điểm | `interview_scores` | Array | — | O | Có thể `[]`. |
| 8 | 3 | Một bản ghi điểm | — | Object | — | O | Phần tử trong `interview_scores`. |
| 9 | 4 | ID score | `id` | String | 36 | O | |
| 10 | 4 | FK | `interview_id`, `evaluator_id` | String | 36 | O | |
| 11 | 4 | Điểm số | `technical_score`, … | Number \| null | 0–10 | — | |
| 12 | 4 | Nhận xét | `strengths`, `weaknesses`, `feedback` | String \| null | Text | — | |
| 13 | 4 | Kết quả | `result` | String | — | O | `pass` \| `fail` \| `hold`. |
| 14 | 4 | Kết quả cuối | `is_final` | Boolean | — | O | |
| 15 | 4 | Ngày tạo | `created_at` | String (ISO) | — | O | |
| 16 | 4 | Người chấm | `users` | Object | — | O | `fullName`, `email`. |

---

## API 5 — `PATCH /api/dashboard/interviews/{id}`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `PATCH /api/dashboard/interviews/{id}` |
| **APINo.** | `5` |
| **Khái quát chức năng** | Trả bản ghi `interviews` sau khi cập nhật `status` (không trả lại `include` quan hệ). |
| **Định dạng media** | `application/json` |
| **URL** | `/api/dashboard/interviews/{id}` |

### Bảng response

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | Cờ thành công | `success` | Boolean | — | O | `true` khi 200. |
| 2 | 1 | Bản ghi đã cập nhật | `data` | Object | — | O | HTTP 200. Cấu trúc giống **API 3** `data` (scalar `interviews`). |
| 3 | 1 | Thông báo lỗi | `error` | String | — | O | HTTP 401, 400, 500. |

---

## API 6 — `GET /api/dashboard/interviews/{id}` *(màn chấm điểm)*

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `GET /api/dashboard/interviews/{id}` |
| **APINo.** | `6` |
| **Khái quát chức năng** | Cùng response **API 4** — dùng cho màn nhập điểm. |
| **Định dạng media** | `application/json` |
| **URL** | `/api/dashboard/interviews/{id}` |

### Bảng response

Giống hệ bảng **API 4**.

---

## API 7 — `POST /api/dashboard/interviews/{id}/score`

| Trường | Giá trị |
|--------|---------|
| **Tên API** | `POST /api/dashboard/interviews/{id}/score` |
| **APINo.** | `7` |
| **Khái quát chức năng** | Trả bản ghi `interview_scores` sau upsert (không `include` quan hệ trong route). |
| **Định dạng media** | `application/json` |
| **URL** | `/api/dashboard/interviews/{id}/score` |

### Bảng response

| NO | Cấp độ | Tên item | JSON Key | Kiểu | Size | Bắt buộc | Ghi chú |
|----|--------|----------|----------|------|------|----------|---------|
| 1 | 1 | Cờ thành công | `success` | Boolean | — | O | `true` khi 200. |
| 2 | 1 | Bản ghi điểm | `data` | Object | — | O | HTTP 200. |
| 3 | 1 | Thông báo lỗi | `error` | String | — | O | HTTP 401, 400, 500. |
| 4 | 2 | ID | `id` | String | 36 | O | |
| 5 | 2 | `interview_id` | `interview_id` | String | 36 | O | |
| 6 | 2 | `evaluator_id` | `evaluator_id` | String | 36 | O | Bằng user đăng nhập. |
| 7 | 2 | Các điểm & text | `technical_score`, `communication_score`, `cultural_fit_score`, `overall_score`, `strengths`, `weaknesses`, `feedback` | Mixed | — | — | Số hoặc `null`, chuỗi hoặc `null`. |
| 8 | 2 | `result` | `result` | String | — | O | |
| 9 | 2 | `is_final` | `is_final` | Boolean | — | O | |
| 10 | 2 | `created_at` | `created_at` | String (ISO) | — | O | |

---

## Ghi chú chung

- **HTTP 200 + `success: true`:** thường có `data`, không có `error`.
- **HTTP 4xx/5xx lỗi chuẩn `jsonError`:** `success: false`, có `error`; **không** có `data`.
- Kiểu `DateTime` Prisma khi `JSON.stringify` thành chuỗi ISO — bảng ghi **String (ISO 8601)**.
- Đường dẫn mã nguồn: `app/api/dashboard/interviews/…`.
