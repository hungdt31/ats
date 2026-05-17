# UTE - Unit Test Evidence
# Module G - Quản lý Công việc (Dashboard)

| Thông tin | Nội dung |
|-----------|----------|
| **Tên hệ thống** | ATS - Applicant Tracking System |
| **ID chức năng** | G-01 đến G-04 |
| **Tên chức năng** | Quản lý Tin tuyển dụng |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Người test lần 1** | |
| **Người test lần 2** | |
| **Người test lần 3** | |
| **Tổng số item test** | 55 |
| **Tổng số bug** | |

> **Quy ước kết quả:** ○: OK | ×: NG chưa giải quyết | ×→○: NG đã giải quyết | －: Không test

---

## G-01 · Danh sách tin tuyển dụng (`/dashboard/jobs`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | G-01 |
| **Tên chức năng** | Danh sách tin tuyển dụng |
| **Tổng số item test** | 13 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 1 | Bảo vệ route – Guest | Xóa cookie JWT, truy cập `/dashboard/jobs` | Redirect về `/login` | | | | |
| 2 | Bảo vệ route – Candidate | Đăng nhập role=candidate, truy cập `/dashboard/jobs` | Trả 403 hoặc redirect | | | | |
| 3 | Bảo vệ route – Interviewer | Đăng nhập role=interviewer, truy cập `/dashboard/jobs` | Trả 403 hoặc redirect | | | | |
| 4 | Khởi tạo – HR/Admin | Đăng nhập role=hr hoặc admin | Trang load HTTP 200; hiển thị danh sách tất cả jobs | | | | |
| 5 | Empty state – Không có job | DB không có job nào | Hiển thị message trống; nút "Tạo tin mới" vẫn hiển thị | | | | |
| 6 | Hiển thị cột bảng | DB có ≥1 job | Bảng hiển thị đủ cột: Tiêu đề, Phòng ban, Trạng thái, Số ứng viên, Người tạo, Ngày tạo | | | | |
| 7 | Badge trạng thái màu sắc | DB có jobs ở mỗi trạng thái | draft=gray, active=green, closed=yellow, archived=red | | | | |
| 8 | Số ứng viên (_count.applications) | Job A có 5 applications | Cột "Số ứng viên" của Job A hiển thị đúng số 5 | | | | |
| 9 | Lọc theo status=active | Chọn filter "Active", click Áp dụng | Chỉ hiển thị jobs có status=active; URL chứa `?status=active` | | | | |
| 10 | Lọc theo status=draft | Chọn filter "Draft", click Áp dụng | Chỉ hiển thị jobs status=draft | | | | |
| 11 | Lọc theo status=closed/archived | Lần lượt chọn closed và archived | Lọc đúng theo từng status | | | | |
| 12 | Phân trang | DB có >20 jobs; click trang 2 | Hiển thị đúng bản ghi trang 2; URL `?page=2` | | | | |
| 13 | Link Chỉnh sửa / Kênh đăng | Click nút "Sửa" → `/dashboard/jobs/[id]/edit`; click "Kênh đăng" → `/dashboard/jobs/[id]/channels` | Điều hướng đúng với `id` tương ứng | | | | |

---

## G-02 · Tạo tin tuyển dụng mới (`/dashboard/jobs/new`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | G-02 |
| **Tên chức năng** | Tạo tin tuyển dụng mới |
| **Tổng số item test** | 20 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 14 | Bảo vệ route – Guest | Guest truy cập `/dashboard/jobs/new` | Redirect về `/login` | | | | |
| 15 | Bảo vệ route – Interviewer | Đăng nhập interviewer, truy cập form tạo | Trả 403, không hiển thị form | | | | |
| 16 | Khởi tạo form – Giá trị mặc định | HR/Admin mở `/dashboard/jobs/new` | `employment_type` mặc định = full_time; `headcount` mặc định = 1; `status` mặc định = draft; form trống, chưa có lỗi | | | | |
| 17 | G-VAL-001 – Thiếu title | Submit form khi `title` rỗng | Hiển thị lỗi "Tiêu đề tin tuyển dụng là bắt buộc" | | | | |
| 18 | G-VAL-001 – title vượt 200 ký tự | Nhập title 201 ký tự | Hiển thị lỗi "Tiêu đề tối đa 200 ký tự" | | | | |
| 19 | G-VAL-002 – Thiếu description | Submit form khi `description` rỗng | Hiển thị lỗi "Mô tả công việc là bắt buộc" | | | | |
| 20 | G-VAL-002 – description vượt 10000 ký tự | Nhập description 10001 ký tự | Hiển thị lỗi "Mô tả tối đa 10.000 ký tự" | | | | |
| 21 | G-VAL-003 – employment_type bắt buộc | Xóa chọn employment_type, submit | Hiển thị lỗi "Loại hợp đồng là bắt buộc"; chỉ chấp nhận full_time/part_time/contract | | | | |
| 22 | G-VAL-004 – salary_min > salary_max | Nhập salary_min = 20,000,000; salary_max = 10,000,000; submit | Hiển thị lỗi "Lương tối thiểu không được lớn hơn lương tối đa" | | | | |
| 23 | G-VAL-004 – salary_min = salary_max (hợp lệ) | Nhập cả hai = 15,000,000 | Không lỗi; cho phép lưu | | | | |
| 24 | G-VAL-004 – Chỉ nhập salary_max (không có min) | Để trống salary_min, nhập salary_max | Không lỗi; lưu thành công | | | | |
| 25 | G-VAL-005 – headcount = 0 | Nhập headcount = 0; submit | Hiển thị lỗi "Số lượng tuyển phải lớn hơn 0" | | | | |
| 26 | G-VAL-005 – headcount âm | Nhập headcount = -1 | Hiển thị lỗi "Số lượng tuyển phải lớn hơn 0" | | | | |
| 27 | G-VAL-006 – expires_at trong quá khứ | Chọn expires_at = ngày hôm qua | Hiển thị lỗi "Hạn đăng tuyển phải ở tương lai" | | | | |
| 28 | G-VAL-006 – expires_at để trống (tùy chọn) | Không chọn expires_at; submit với dữ liệu hợp lệ | Lưu thành công; `expires_at = null` trong DB | | | | |
| 29 | Auto-slug từ title | Nhập title = "Senior Backend Developer"; submit | Slug tạo tự động dạng `senior-backend-developer` (hoặc có suffix); field slug không cần user nhập | | | | |
| 30 | Auto-slug – Xử lý trùng slug | Tạo 2 job có cùng title "Frontend Developer" | Job thứ 2 có slug khác (ví dụ: `frontend-developer-abc123`); không lỗi UNIQUE constraint | | | | |
| 31 | required_skills – JSON array | Nhập skills dạng tags: "React, TypeScript, Node.js" | Lưu dạng `["React","TypeScript","Node.js"]` trong DB; không lỗi | | | | |
| 32 | Tạo job thành công – Status draft | Điền đủ title, description, employment_type=full_time; submit với status=draft | API `POST /api/dashboard/jobs` trả 201; redirect về `/dashboard/jobs`; toast "Tạo tin tuyển dụng thành công"; `created_by = currentUser.id` | | | | |
| 33 | Tạo job thành công – Status active | Điền đủ thông tin; chọn status=active | Tạo thành công với status=active; job xuất hiện trên trang public | | | | |

---

## G-03 · Chỉnh sửa tin tuyển dụng (`/dashboard/jobs/[id]/edit`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | G-03 |
| **Tên chức năng** | Chỉnh sửa tin tuyển dụng |
| **Tổng số item test** | 12 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 34 | Bảo vệ route – Guest | Guest truy cập `/dashboard/jobs/[id]/edit` | Redirect về `/login` | | | | |
| 35 | ID không tồn tại | HR truy cập edit job với ID không hợp lệ | Hiển thị trang 404 | | | | |
| 36 | Pre-fill dữ liệu | HR/Admin mở edit job đã tạo | Tất cả trường được pre-fill đúng giá trị hiện tại từ DB: title, description, employment_type, status, salary, v.v. | | | | |
| 37 | Chỉnh sửa title | Đổi title sang giá trị mới hợp lệ; submit | API `PATCH /api/dashboard/jobs/[id]` trả 200; title cập nhật đúng; slug KHÔNG tự động thay đổi | | | | |
| 38 | Chỉnh sửa description | Đổi nội dung description; submit | Lưu thành công; description mới hiển thị trên trang detail | | | | |
| 39 | Đổi status: draft → active | Job ở draft; chọn status=active; submit | Job cập nhật status=active; xuất hiện trên trang public listing | | | | |
| 40 | Đổi status: active → closed | Job ở active; chọn status=closed; submit | Job cập nhật status=closed; không còn nhận đơn mới | | | | |
| 41 | Đổi status: closed → archived | Job ở closed; chọn status=archived; submit (không còn ứng viên active) | Job cập nhật status=archived thành công | | | | |
| 42 | Không cho archived nếu còn ứng viên active | Job có application có status ≠ hired/rejected; chọn status=archived; submit | API trả lỗi 400/422 "Không thể lưu trữ job khi còn ứng viên đang xử lý"; toast lỗi | | | | |
| 43 | Validate các trường giống form tạo mới | Xóa trắng title, submit | Hiển thị lỗi validation tương tự form tạo mới | | | | |
| 44 | Nút Hủy | Click "Hủy" khi đang sửa | Redirect về `/dashboard/jobs`; dữ liệu trong DB không thay đổi | | | | |
| 45 | API 403 – Interviewer cố sửa | Giả lập role=interviewer gọi `PATCH /api/dashboard/jobs/[id]` | API trả 403 Forbidden | | | | |

---

## G-04 · Quản lý kênh đăng tin (`/dashboard/jobs/[id]/channels`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | G-04 |
| **Tên chức năng** | Quản lý kênh đăng tin tuyển dụng |
| **Tổng số item test** | 10 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 46 | Bảo vệ route – Guest | Guest truy cập `/dashboard/jobs/[id]/channels` | Redirect về `/login` | | | | |
| 47 | Khởi tạo – Không có kênh | HR mở trang channels của job mới | Bảng hiển thị trống; nút "Thêm kênh" hiển thị | | | | |
| 48 | Hiển thị danh sách kênh | Job đã có ≥1 channel | Bảng hiển thị: Tên kênh, URL bài đăng, Badge trạng thái, Ngày đăng, Hạn đăng | | | | |
| 49 | Badge trạng thái kênh màu sắc | DB có channels ở mỗi trạng thái | pending=yellow, posted=green, failed=red, expired=gray, removed=gray | | | | |
| 50 | Mở modal thêm kênh | Click nút "Thêm kênh" | Modal thêm kênh mở ra với form: tên kênh, URL, hạn đăng | | | | |
| 51 | Validate – Tên kênh để trống | Submit modal không nhập tên kênh | Hiển thị lỗi "Tên kênh là bắt buộc" | | | | |
| 52 | Validate – URL không hợp lệ | Nhập external_url = "not-a-url" | Hiển thị lỗi "URL bài đăng phải là URL hợp lệ" | | | | |
| 53 | Thêm kênh thành công | Nhập channel="LinkedIn", external_url hợp lệ; submit | API `POST /api/dashboard/jobs/[id]/channels` trả 201; kênh mới xuất hiện trong bảng với `status=pending`; toast "Thêm kênh thành công" | | | | |
| 54 | Thêm kênh trùng – 409 Conflict | Đã có channel="LinkedIn" cho job này; thêm lại "LinkedIn" | API trả 409 Conflict; toast lỗi "Kênh này đã được thêm cho tin tuyển dụng"; không tạo bản ghi mới | | | | |
| 55 | API 403 – Interviewer cố thêm kênh | Giả lập role=interviewer gọi `POST .../channels` | API trả 403 Forbidden | | | | |
