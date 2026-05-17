# UTE - Unit Test Evidence
# Module E - Quản lý Đơn ứng tuyển (Dashboard)

| Thông tin | Nội dung |
|-----------|----------|
| **Tên hệ thống** | ATS - Applicant Tracking System |
| **ID chức năng** | E-01 đến E-06 |
| **Tên chức năng** | Quản lý Đơn ứng tuyển |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Người test lần 1** | |
| **Người test lần 2** | |
| **Người test lần 3** | |
| **Tổng số item test** | 70 |
| **Tổng số bug** | |

> **Quy ước kết quả:** ○: OK | ×: NG chưa giải quyết | ×→○: NG đã giải quyết | －: Không test

---

## E-01 · Danh sách đơn ứng tuyển (`/dashboard/applications`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | E-01 |
| **Tên chức năng** | Danh sách hồ sơ ứng tuyển |
| **Tổng số item test** | 20 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 1 | Bảo vệ route – Guest chưa đăng nhập | Xóa cookie JWT, truy cập `/dashboard/applications` | Redirect về `/login`, không hiển thị danh sách | | | | |
| 2 | Bảo vệ route – Role candidate | Đăng nhập role=candidate, truy cập `/dashboard/applications` | Trả về 403 hoặc redirect, không hiển thị nội dung | | | | |
| 3 | Bảo vệ route – Role interviewer | Đăng nhập role=interviewer, truy cập `/dashboard/applications` | Trả về 403 hoặc redirect | | | | |
| 4 | Khởi tạo – HR truy cập | Đăng nhập role=hr | Trang load HTTP 200, hiển thị danh sách đơn | | | | |
| 5 | Khởi tạo – Admin truy cập | Đăng nhập role=admin | Trang load HTTP 200, hiển thị danh sách đơn | | | | |
| 6 | Empty state – Không có dữ liệu | DB không có application nào | Hiển thị message "Chưa có hồ sơ nào. Khi ứng viên nộp đơn, hồ sơ sẽ xuất hiện tại đây." | | | | |
| 7 | Hiển thị cột bảng | DB có ≥1 application | Bảng hiển thị đủ cột: Ứng viên, Job, Trạng thái, Nguồn, Ngày nộp | | | | |
| 8 | Badge trạng thái màu sắc | DB có đơn với mỗi status khác nhau | applied=gray, screening=yellow, interviewing=blue, offered=purple, hired=green, rejected=red | | | | |
| 9 | Lọc theo Job | Chọn 1 job từ dropdown "Bộ lọc Job", click Áp dụng | Chỉ hiển thị đơn thuộc job đó; URL chứa `?jobId=<uuid>` | | | | |
| 10 | Lọc theo Trạng thái | Chọn status "screening" từ dropdown, click Áp dụng | Chỉ hiển thị đơn có status=screening | | | | |
| 11 | Lọc theo Nguồn ứng tuyển | Chọn source "linkedin", click Áp dụng | Chỉ hiển thị đơn có source_channel=linkedin | | | | |
| 12 | Kết hợp nhiều bộ lọc | Chọn job + status + source đồng thời, click Áp dụng | API gọi với đủ 3 query params; bảng lọc đúng dữ liệu | | | | |
| 13 | Reset bộ lọc | Sau khi lọc, xóa chọn về "Tất cả" rồi Áp dụng | Hiển thị lại toàn bộ danh sách không lọc | | | | |
| 14 | Phân trang – Chuyển trang | DB có >20 applications; click trang 2 | Hiển thị đúng 20 bản ghi trang tiếp theo; URL cập nhật `?page=2` | | | | |
| 15 | Phân trang – Trang đầu/cuối | Đang ở trang cuối | Nút "Trang sau" bị disabled; số trang hiển thị đúng | | | | |
| 16 | Sắp xếp mặc định | Load trang không có filter | Danh sách sắp xếp theo `applied_at DESC` (mới nhất lên đầu) | | | | |
| 17 | Click xem chi tiết đơn | Click vào hàng trong bảng | Điều hướng đến `/dashboard/applications/<id>` | | | | |
| 18 | API Error – Fetch thất bại | Giả lập server 500 khi gọi `GET /api/dashboard/applications` | Hiển thị toast lỗi hoặc error state, không crash trang | | | | |
| 19 | Sidebar active state | Đang ở `/dashboard/applications` | Menu "Hồ sơ ứng tuyển" trong sidebar được highlight active | | | | |
| 20 | Loading state | Mạng chậm, API chưa trả về | Skeleton loader hoặc spinner hiển thị trong khi chờ; không flash dữ liệu cũ | | | | |

---

## E-02 · Chi tiết hồ sơ ứng tuyển (`/dashboard/applications/[id]`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | E-02 |
| **Tên chức năng** | Xem chi tiết hồ sơ ứng tuyển |
| **Tổng số item test** | 20 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 21 | Bảo vệ route – Guest | Guest truy cập `/dashboard/applications/abc-123` | Redirect về `/login` | | | | |
| 22 | Bảo vệ route – Candidate | Đăng nhập role=candidate, truy cập link chi tiết | Trả 403 hoặc redirect | | | | |
| 23 | Bảo vệ route – Interviewer | Đăng nhập role=interviewer, truy cập link chi tiết | Trả 403 hoặc redirect | | | | |
| 24 | ID không tồn tại | HR truy cập `/dashboard/applications/invalid-uuid` | Hiển thị trang 404 "Hồ sơ không tìm thấy" | | | | |
| 25 | Hiển thị thông tin ứng viên | HR mở chi tiết đơn có đủ dữ liệu | Section thông tin hiển thị: Họ tên, email, số điện thoại ứng viên | | | | |
| 26 | Hiển thị thông tin job | HR mở chi tiết đơn | Section job hiển thị: Tiêu đề vị trí, phòng ban | | | | |
| 27 | Hiển thị CV – Link tải xuống | Đơn có `cv_file_url` | Nút "Tải CV" hiển thị; click mở URL file trong tab mới | | | | |
| 28 | Hiển thị CV – Không có file | Đơn không có `cv_file_url` | Hiển thị text "Chưa có CV" hoặc ẩn nút tải | | | | |
| 29 | Hiển thị cover letter | Đơn có `cover_letter` không rỗng | Nội dung cover letter hiển thị đúng trong section | | | | |
| 30 | Hiển thị badge trạng thái hiện tại | Đơn có status=interviewing | Badge màu blue với text "Interviewing" hiển thị trên trang | | | | |
| 31 | Tab Lịch sử trạng thái – Mặc định mở | Load trang chi tiết | Tab "Lịch sử trạng thái" là tab active mặc định | | | | |
| 32 | Tab Lịch sử – Hiển thị dòng thời gian | Đơn có ≥2 lần đổi trạng thái | Timeline hiển thị đúng: from_status → to_status, người thực hiện, thời gian, ghi chú | | | | |
| 33 | Tab Lịch sử – Không có lịch sử | Đơn mới, chưa đổi trạng thái lần nào | Tab hiển thị message "Chưa có lịch sử thay đổi trạng thái" | | | | |
| 34 | Tab Phỏng vấn – Chuyển tab | Click tab "Phỏng vấn" | Tab chuyển, hiển thị danh sách lịch PV liên quan đến đơn này | | | | |
| 35 | Tab Phỏng vấn – Có dữ liệu | Đơn có ≥1 interview | Hiển thị: Interviewer, ngày giờ, hình thức, trạng thái; link đến chi tiết PV | | | | |
| 36 | Tab Phỏng vấn – Không có dữ liệu | Đơn chưa có interview nào | Hiển thị "Chưa có lịch phỏng vấn" | | | | |
| 37 | Tab Email – Chuyển tab | Click tab "Nhật ký Email" | Tab chuyển, hiển thị danh sách email đã gửi | | | | |
| 38 | Tab Email – Có dữ liệu | Đơn có ≥1 email log | Hiển thị: Tiêu đề, loại email, trạng thái (sent/failed), thời gian gửi | | | | |
| 39 | Nút Đổi trạng thái hiển thị | Đăng nhập hr/admin | Nút/dropdown "Đổi trạng thái" hiển thị; interviewer không thấy nút này | | | | |
| 40 | Nút Gửi email hiển thị | Đăng nhập hr/admin | Nút "Gửi Email" hiển thị; interviewer không thấy nút này | | | | |

---

## E-03 · Đổi trạng thái hồ sơ (`/dashboard/applications/[id]/status`)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | E-03 |
| **Tên chức năng** | Đổi trạng thái hồ sơ ứng tuyển |
| **Tổng số item test** | 14 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 41 | Hiển thị trạng thái hiện tại | Mở form đổi trạng thái | Dropdown "Trạng thái mới" pre-fill hoặc hiển thị trạng thái hiện tại của đơn | | | | |
| 42 | Validate – Không chọn trạng thái mới | Submit form khi chưa chọn `toStatus` | Hiển thị lỗi "Vui lòng chọn trạng thái mới", nút Lưu bị disable | | | | |
| 43 | Validate – Ghi chú vượt 500 ký tự | Nhập ghi chú 501 ký tự | Hiển thị lỗi "Ghi chú tối đa 500 ký tự" | | | | |
| 44 | Flow hợp lệ: applied → screening | Đơn ở applied, chọn toStatus=screening | API `POST /api/dashboard/applications/[id]/status` trả 200; toast "Đổi trạng thái thành công"; redirect về chi tiết | | | | |
| 45 | Flow hợp lệ: screening → interviewing | Đơn ở screening, chọn toStatus=interviewing | Cập nhật thành công; lịch sử ghi nhận đúng from/to status | | | | |
| 46 | Flow hợp lệ: interviewing → offered | Đơn ở interviewing, chọn toStatus=offered | Cập nhật thành công; lịch sử được tạo mới | | | | |
| 47 | Flow hợp lệ: offered → hired | Đơn ở offered, chọn toStatus=hired | Cập nhật thành công; badge trạng thái chuyển sang hired | | | | |
| 48 | Flow hợp lệ: offered → rejected | Đơn ở offered, chọn toStatus=rejected | Cập nhật thành công; badge trạng thái chuyển sang rejected | | | | |
| 49 | Ghi nhật ký lịch sử | Đổi trạng thái với ghi chú "Test note" | DB có bản ghi `application_status_history`: đúng `from_status`, `to_status`, `changed_by`, `note` | | | | |
| 50 | Không có ghi chú (optional) | Submit form không nhập ghi chú | Đổi trạng thái thành công; `note` trong DB là null hoặc rỗng | | | | |
| 51 | Nút Hủy | Click nút "Hủy" | Redirect về `/dashboard/applications/[id]`, trạng thái không thay đổi | | | | |
| 52 | API 401 – Token hết hạn | Token JWT hết hạn, submit form | API trả 401; trang redirect về `/login` | | | | |
| 53 | API 403 – Interviewer submit | Giả lập role=interviewer gọi API `POST .../status` | API trả 403 Forbidden | | | | |
| 54 | API 404 – Application không tồn tại | Submit với ID application không hợp lệ | API trả 404; toast lỗi hiển thị | | | | |

---

## E-04 · Gửi email cho ứng viên (Modal/Form gửi email)

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | E-04 |
| **Tên chức năng** | Gửi email thông báo cho ứng viên |
| **Tổng số item test** | 10 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 55 | Mở modal gửi email | HR/Admin click nút "Gửi Email" trên chi tiết đơn | Modal gửi email mở ra với form trống; hiển thị dropdown Type, input Subject, textarea Body | | | | |
| 56 | Validate – Không chọn Type | Submit form khi `type` chưa chọn | Hiển thị lỗi "Vui lòng chọn loại email" | | | | |
| 57 | Validate – Subject để trống | Submit khi `subject` rỗng | Hiển thị lỗi "Tiêu đề email là bắt buộc" | | | | |
| 58 | Validate – Subject vượt 200 ký tự | Nhập subject 201 ký tự | Hiển thị lỗi "Tiêu đề tối đa 200 ký tự" | | | | |
| 59 | Validate – Body để trống | Submit khi `body` rỗng | Hiển thị lỗi "Nội dung email là bắt buộc" | | | | |
| 60 | Validate – Body vượt 5000 ký tự | Nhập body 5001 ký tự | Hiển thị lỗi "Nội dung tối đa 5000 ký tự" | | | | |
| 61 | Gửi email thành công | Điền đủ type=invite, subject, body hợp lệ; click Gửi | API trả 200; `email_logs` có bản ghi mới với `status=sent`; toast "Gửi email thành công"; modal đóng | | | | |
| 62 | Dropdown Type enum hợp lệ | Mở dropdown type trong modal | Các option hiển thị: invite, result, reminder, rejection, offer | | | | |
| 63 | Resend API lỗi | Giả lập Resend service trả lỗi | API vẫn trả về nhưng `email_logs.status=failed`; `error_message` được lưu; toast "Gửi email thất bại" | | | | |
| 64 | Đóng modal không gửi | Click nút "Hủy" hoặc click outside modal | Modal đóng; không có bản ghi email_logs mới; form reset | | | | |

---

## E-05 · Tạo lịch phỏng vấn từ chi tiết đơn

| Thông tin | Nội dung |
|-----------|----------|
| **ID chức năng** | E-05 |
| **Tên chức năng** | Tạo lịch phỏng vấn từ màn hình chi tiết hồ sơ |
| **Tổng số item test** | 6 |

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 65 | Nút Tạo lịch PV điều hướng | HR click nút "Tạo lịch PV" trên chi tiết đơn | Điều hướng đến `/dashboard/interviews/new` với query `?applicationId=<id>` pre-filled | | | | |
| 66 | Validate – Thiếu interviewer_id | Submit form tạo PV mà không chọn interviewer | Hiển thị lỗi "Vui lòng chọn interviewer" | | | | |
| 67 | Validate – Thiếu scheduled_at | Submit form không nhập ngày giờ PV | Hiển thị lỗi "Ngày giờ phỏng vấn là bắt buộc" | | | | |
| 68 | Validate – Thiếu type | Submit form không chọn hình thức PV | Hiển thị lỗi "Hình thức phỏng vấn là bắt buộc" | | | | |
| 69 | Tạo PV thành công từ đơn | Điền đủ thông tin hợp lệ, submit | API `POST /api/dashboard/applications/[id]/interviews` trả 201; interview record tạo thành công với `application_id` đúng; redirect hoặc toast "Tạo lịch phỏng vấn thành công" | | | | |
| 70 | Interview hiển thị trên Tab PV | Sau khi tạo PV thành công, quay lại chi tiết đơn | Tab "Phỏng vấn" hiển thị interview mới vừa tạo | | | | |
