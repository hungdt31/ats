# UTE - Unit Test Evidence
# Module F - Quản lý Phỏng vấn (Dashboard)

| Thông tin | Nội dung |
|-----------|----------|
| **Tên hệ thống** | ATS - Applicant Tracking System |
| **ID chức năng** | F-01 đến F-05 |
| **Tên chức năng** | Quản lý Phỏng vấn |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Người test lần 1** | |
| **Người test lần 2** | |
| **Người test lần 3** | |
| **Tổng số item test** | 55 |
| **Tổng số bug** | |

> **Quy ước kết quả:** ○: OK | ×: NG chưa giải quyết | ×→○: NG đã giải quyết | －: Không test

---

## F-01 · Danh sách phỏng vấn (`/dashboard/interviews`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | F-01 |
| **Tên chức năng** | Danh sách lịch phỏng vấn |
| **Tổng số item test** | 14 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 1 | Bảo vệ route – Guest | Xóa cookie, truy cập `/dashboard/interviews` | Redirect về `/login` | | | | |
| 2 | Bảo vệ route – Candidate | Đăng nhập role=candidate | Trả 403 hoặc redirect, không hiển thị danh sách | | | | |
| 3 | Khởi tạo – HR/Admin | Đăng nhập role=hr hoặc admin | Trang load HTTP 200; hiển thị toàn bộ danh sách PV của hệ thống | | | | |
| 4 | Khởi tạo – Interviewer (scope riêng) | Đăng nhập role=interviewer (user A) | Chỉ hiển thị những PV có `interviewer_id = A.id`; không thấy PV của interviewer khác | | | | |
| 5 | Empty state – Không có PV | DB trống hoặc interviewer chưa có PV nào | Hiển thị message "Chưa có lịch phỏng vấn nào" | | | | |
| 6 | Hiển thị cột bảng | DB có ≥1 interview | Bảng hiển thị đủ cột: Ứng viên, Vị trí, Interviewer, Ngày giờ, Hình thức, Trạng thái | | | | |
| 7 | Badge trạng thái màu sắc | DB có PV ở mỗi trạng thái | scheduled=blue, completed=green, cancelled=red, rescheduled=orange | | | | |
| 8 | Lọc theo Trạng thái | Chọn status=completed, click Áp dụng | Chỉ hiển thị PV có status=completed; URL chứa `?status=completed` | | | | |
| 9 | Lọc theo Ngày | Nhập ngày cụ thể (YYYY-MM-DD), click Áp dụng | Chỉ hiển thị PV có `scheduled_at` trong ngày đó | | | | |
| 10 | Kết hợp lọc Status + Ngày | Chọn status=scheduled + ngày hôm nay | Chỉ hiển thị PV scheduled hôm nay | | | | |
| 11 | Sắp xếp mặc định | Load trang không filter | Danh sách sắp theo `scheduled_at ASC` (sắp tới trước) | | | | |
| 12 | Phân trang | DB có >20 PV; click trang 2 | Hiển thị đúng bản ghi trang 2; URL cập nhật `?page=2` | | | | |
| 13 | Nút Tạo PV mới – HR/Admin | Đăng nhập hr/admin | Nút "Tạo PV mới" hiển thị; click điều hướng đến `/dashboard/interviews/new` | | | | |
| 14 | Nút Tạo PV mới – Interviewer | Đăng nhập interviewer | Nút "Tạo PV mới" không hiển thị | | | | |

---

## F-02 · Tạo phỏng vấn mới (`/dashboard/interviews/new`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | F-02 |
| **Tên chức năng** | Tạo lịch phỏng vấn mới |
| **Tổng số item test** | 17 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 15 | Bảo vệ route – Guest | Guest truy cập `/dashboard/interviews/new` | Redirect về `/login` | | | | |
| 16 | Bảo vệ route – Interviewer | Đăng nhập interviewer, truy cập `/dashboard/interviews/new` | Trả 403, không hiển thị form | | | | |
| 17 | Khởi tạo form – HR/Admin | Đăng nhập hr/admin | Form hiển thị đầy đủ 8 trường; dropdown Interviewer tải dữ liệu từ metadata API | | | | |
| 18 | F-VAL-001 – Thiếu application_id | Submit form không chọn hồ sơ ứng tuyển | Hiển thị lỗi "Vui lòng chọn hồ sơ ứng tuyển" dưới trường tương ứng | | | | |
| 19 | F-VAL-002 – Thiếu interviewer_id | Submit form không chọn interviewer | Hiển thị lỗi "Vui lòng chọn interviewer" | | | | |
| 20 | F-VAL-003 – Thiếu scheduled_at | Submit form không nhập ngày giờ | Hiển thị lỗi "Ngày giờ phỏng vấn là bắt buộc" | | | | |
| 21 | F-VAL-003 – scheduled_at trong quá khứ | Nhập ngày giờ đã qua (ví dụ: hôm qua) | Hiển thị lỗi "Ngày giờ phỏng vấn phải ở tương lai" | | | | |
| 22 | F-VAL-004 – Thiếu type | Submit form không chọn hình thức | Hiển thị lỗi "Hình thức phỏng vấn là bắt buộc" | | | | |
| 23 | F-VAL-005 – duration_minutes default | Submit form không nhập duration | `duration_minutes` mặc định = 60; không lỗi | | | | |
| 24 | F-VAL-006 – meeting_link URL không hợp lệ | Nhập meeting_link = "not-a-url" | Hiển thị lỗi "Link họp phải là URL hợp lệ" | | | | |
| 25 | Dropdown hình thức enum hợp lệ | Mở dropdown "Hình thức" | Hiển thị đúng 4 option: phone, video, onsite, technical | | | | |
| 26 | Dropdown Interviewer – Load từ metadata | Form load | Dropdown Interviewer hiển thị danh sách users có role=interviewer từ `GET /api/dashboard/interviews/metadata` | | | | |
| 27 | Tạo PV thành công – Video | Điền đủ: application, interviewer, scheduled_at tương lai, type=video, meeting_link hợp lệ | API `POST /api/dashboard/interviews` trả 201; redirect đến `/dashboard/interviews/<id>`; toast "Tạo lịch phỏng vấn thành công" | | | | |
| 28 | Tạo PV thành công – Onsite | type=onsite, nhập location; không nhập meeting_link | Tạo thành công; `location` lưu đúng trong DB | | | | |
| 29 | Tạo PV thành công – Phone | type=phone, không nhập meeting_link và location | Tạo thành công; các trường optional là null | | | | |
| 30 | Nút Hủy | Click "Hủy" khi đang điền form | Redirect về `/dashboard/interviews`; không có bản ghi mới trong DB | | | | |
| 31 | API 422 – application_id không tồn tại | Submit với application_id không tồn tại trong DB | API trả 422/404; toast lỗi hiển thị "Hồ sơ ứng tuyển không tồn tại" | | | | |

---

## F-03 · Chi tiết phỏng vấn (`/dashboard/interviews/[id]`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | F-03 |
| **Tên chức năng** | Xem chi tiết buổi phỏng vấn |
| **Tổng số item test** | 11 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 32 | Bảo vệ route – Guest | Guest truy cập link chi tiết PV | Redirect về `/login` | | | | |
| 33 | Scope – Interviewer xem PV của mình | Đăng nhập interviewer A, truy cập PV có `interviewer_id=A.id` | Trang load HTTP 200, hiển thị đầy đủ thông tin | | | | |
| 34 | Scope – Interviewer xem PV của người khác | Đăng nhập interviewer A, truy cập PV có `interviewer_id=B.id` | Trả 403 Forbidden "Bạn không có quyền xem phỏng vấn này" | | | | |
| 35 | ID không tồn tại | HR truy cập `/dashboard/interviews/invalid-id` | Hiển thị trang 404 | | | | |
| 36 | Hiển thị thông tin ứng viên | HR mở chi tiết PV | Hiển thị: Tên ứng viên, email, vị trí ứng tuyển | | | | |
| 37 | Hiển thị thông tin interviewer | HR mở chi tiết PV | Hiển thị: Tên interviewer, email | | | | |
| 38 | Hiển thị thông tin buổi PV | HR mở chi tiết PV | Hiển thị: Ngày giờ, hình thức, thời lượng, meeting_link/location, badge trạng thái | | | | |
| 39 | Scorecard – Chưa có điểm | PV chưa được chấm điểm | Section scorecard hiển thị "Chưa có đánh giá" | | | | |
| 40 | Scorecard – Đã có điểm | PV đã có `interview_scores` | Hiển thị điểm kỹ thuật, giao tiếp, văn hóa, tổng thể; strengths; weaknesses; feedback; kết luận (pass/fail/hold) | | | | |
| 41 | Nút Chấm điểm – Chỉ Interviewer của PV | Đăng nhập đúng interviewer của PV | Nút "Chấm điểm" hiển thị; HR/Admin không thấy nút này | | | | |
| 42 | Nút Chỉnh sửa / Đổi trạng thái – HR/Admin | Đăng nhập hr/admin | Nút "Chỉnh sửa" và dropdown "Đổi trạng thái" hiển thị | | | | |

---

## F-04 · Cập nhật phỏng vấn (`PATCH /api/dashboard/interviews/[id]`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | F-04 |
| **Tên chức năng** | Cập nhật thông tin / trạng thái phỏng vấn |
| **Tổng số item test** | 7 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 43 | Reschedule – Đổi ngày giờ hợp lệ | HR nhập `scheduled_at` mới trong tương lai, submit | API `PATCH .../[id]` trả 200; `interviews.scheduled_at` cập nhật đúng; toast "Cập nhật thành công" | | | | |
| 44 | Reschedule – Ngày giờ trong quá khứ | HR nhập `scheduled_at` đã qua | Hiển thị lỗi "Ngày giờ phỏng vấn phải ở tương lai"; không cập nhật | | | | |
| 45 | Đổi trạng thái: scheduled → cancelled | HR chọn status=cancelled | PV cập nhật status=cancelled; badge đổi màu đỏ | | | | |
| 46 | Đổi trạng thái: scheduled → rescheduled | HR chọn status=rescheduled | PV cập nhật status=rescheduled; badge đổi màu orange | | | | |
| 47 | Đổi trạng thái: scheduled → completed | HR chọn status=completed | PV cập nhật status=completed; badge đổi màu xanh | | | | |
| 48 | API 403 – Interviewer cố cập nhật | Giả lập role=interviewer gọi `PATCH .../[id]` | API trả 403 Forbidden | | | | |
| 49 | API 404 – ID không tồn tại | Gọi `PATCH /api/dashboard/interviews/not-exist` | API trả 404 | | | | |

---

## F-05 · Chấm điểm phỏng vấn (`/dashboard/interviews/[id]/score`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | F-05 |
| **Tên chức năng** | Form chấm điểm và đánh giá phỏng vấn |
| **Tổng số item test** | 16 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 50 | Bảo vệ route – Guest | Guest truy cập `/dashboard/interviews/[id]/score` | Redirect về `/login` | | | | |
| 51 | Bảo vệ route – HR/Admin không chấm điểm | Đăng nhập hr, truy cập trang `/score` | Trả 403 hoặc redirect; HR không có quyền chấm điểm | | | | |
| 52 | Scope – Interviewer sai buổi PV | Đăng nhập interviewer A, truy cập score của PV có `interviewer_id=B.id` | Trả 403 Forbidden | | | | |
| 53 | Validate – technical_score dưới 1 | Nhập technical_score = 0 | Hiển thị lỗi "Điểm phải từ 1 đến 10" | | | | |
| 54 | Validate – technical_score trên 10 | Nhập technical_score = 11 | Hiển thị lỗi "Điểm phải từ 1 đến 10" | | | | |
| 55 | Validate – communication_score ngoài [1,10] | Nhập communication_score = 0 hoặc 11 | Hiển thị lỗi tương tự | | | | |
| 56 | Validate – cultural_fit_score ngoài [1,10] | Nhập cultural_fit_score = 0 hoặc 11 | Hiển thị lỗi tương tự | | | | |
| 57 | Validate – overall_score ngoài [1,10] | Nhập overall_score = 0 hoặc 11 | Hiển thị lỗi "Điểm tổng thể phải từ 1 đến 10" | | | | |
| 58 | Validate – Không chọn kết luận (result) | Submit form không chọn pass/fail/hold | Hiển thị lỗi "Vui lòng chọn kết luận đánh giá" | | | | |
| 59 | Chấm điểm thành công lần đầu (CREATE) | Interviewer nhập đủ điểm hợp lệ, result=pass, is_final=false; submit | API `POST .../score` trả 201; bản ghi `interview_scores` mới được tạo; `interview.status` vẫn là scheduled | | | | |
| 60 | is_final = true → interview.status = completed | Submit với is_final=true | `interview_scores.is_final=true`; `interviews.status` cập nhật thành completed | | | | |
| 61 | UPSERT – Chấm điểm lại (UPDATE) | Interviewer đã có score, mở form chấm lại với điểm mới | API thực hiện UPDATE thay vì INSERT; không tạo bản ghi trùng (UNIQUE constraint interview_id+evaluator_id); giá trị điểm được cập nhật | | | | |
| 62 | Pre-fill form khi đã có điểm | Interviewer đã chấm điểm, mở lại form `/score` | Form pre-fill toàn bộ giá trị điểm đã lưu trước đó | | | | |
| 63 | Các trường optional (strengths, weaknesses, feedback) | Submit không nhập strengths/weaknesses/feedback | Lưu thành công; giá trị null trong DB | | | | |
| 64 | Dropdown result enum | Mở dropdown "Kết luận" | Hiển thị đúng 3 option: pass, fail, hold | | | | |
| 65 | API 401 – Token hết hạn | Token hết hạn khi submit form chấm điểm | API trả 401; redirect về `/login` | | | | |
