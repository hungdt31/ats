# TEST CASE DOCUMENT
# Module E - Quản lý Đơn ứng tuyển (Applications)

| Thông tin | Nội dung |
|-----------|----------|
| **Module** | E - Applications (`/dashboard/applications`, `/dashboard/applications/[id]`, `/dashboard/applications/[id]/status`) |
| **Ngày tạo** | 2026-05-17 |
| **Người tạo** | AI Agent |
| **Phiên bản** | 1.0 |

---

| No. | Item test | Điều kiện test | Kết quả mong đợi/cách xác nhận | Kết quả test - 1st | Kết quả test - 2nd | Kết quả test - 3rd | Note |
|-----|-----------|----------------|-------------------------------|-------------------|-------------------|-------------------|------|
| 1 | Phân quyền - Truy cập<br>・/dashboard/applications chưa đăng nhập | ・Chưa đăng nhập<br>・Truy cập trực tiếp URL | Redirect đến `/login` | | | | |
| 2 | Phân quyền - Truy cập<br>・/dashboard/applications với role candidate | ・Đăng nhập role candidate<br>・Truy cập `/dashboard/applications` | Redirect đến `/candidate` hoặc `/unauthorized` | | | | |
| 3 | Phân quyền - Truy cập<br>・/dashboard/applications với role admin | ・Đăng nhập role admin<br>・Truy cập `/dashboard/applications` | Trang hiển thị đúng<br>・Full access: xem, đổi trạng thái, gửi email, lên lịch PV | | | | |
| 4 | Phân quyền - Truy cập<br>・/dashboard/applications với role hr | ・Đăng nhập role hr | Trang hiển thị đúng<br>・Full access giống admin | | | | |
| 5 | Phân quyền - Truy cập<br>・/dashboard/applications với role interviewer | ・Đăng nhập role interviewer | Trang hiển thị nhưng chỉ có quyền xem (view only)<br>・Các nút action bị disabled hoặc ẩn | | | | Cần confirm quyền interviewer |
| 6 | Applications List - Khởi tạo<br>・Layout | ・Đăng nhập admin<br>・Truy cập `/dashboard/applications`<br>・Có ≥5 đơn trong DB | Trang hiển thị:<br>・Bảng danh sách đơn ứng tuyển<br>・Filter: job, trạng thái, nguồn<br>・Cột bảng: tên ứng viên, vị trí, trạng thái, ngày nộp<br>・Có thể click vào row | | | | |
| 7 | Applications List - Khởi tạo<br>・Không có đơn | ・DB chưa có application nào | Bảng hiển thị:<br>・"Chưa có đơn ứng tuyển nào"<br>・Không có lỗi | | | | |
| 8 | Applications List - Filter<br>・Filter theo job | ・Chọn job "Frontend Developer" từ dropdown | Chỉ hiển thị đơn ứng tuyển của job đó<br>・Số row giảm hoặc = 0 nếu không có | | | | |
| 9 | Applications List - Filter<br>・Filter theo status=applied | ・Chọn status "applied" | Chỉ hiển thị đơn có status=applied | | | | |
| 10 | Applications List - Filter<br>・Filter theo status=screening | ・Chọn status "screening" | Chỉ hiển thị đơn có status=screening | | | | |
| 11 | Applications List - Filter<br>・Filter theo status=interviewing | ・Chọn status "interviewing" | Chỉ hiển thị đơn có status=interviewing | | | | |
| 12 | Applications List - Filter<br>・Filter theo status=offered | ・Chọn status "offered" | Chỉ hiển thị đơn có status=offered | | | | |
| 13 | Applications List - Filter<br>・Filter theo status=hired | ・Chọn status "hired" | Chỉ hiển thị đơn có status=hired | | | | |
| 14 | Applications List - Filter<br>・Filter theo status=rejected | ・Chọn status "rejected" | Chỉ hiển thị đơn có status=rejected | | | | |
| 15 | Applications List - Filter<br>・Filter theo source | ・Chọn source "LinkedIn" hoặc nguồn khác | Chỉ hiển thị đơn từ nguồn đó | | | | Cần confirm các giá trị source |
| 16 | Applications List - Filter<br>・Kết hợp job + status | ・Chọn job "Backend Developer" + status "screening" | Hiển thị đơn thỏa cả 2 điều kiện | | | | |
| 17 | Applications List - Filter<br>・Không có kết quả | ・Filter combination không có data | Hiển thị "Không có đơn nào phù hợp" | | | | |
| 18 | Applications List - Filter<br>・Reset filter | ・Đang có filter<br>・Click Reset | Toàn bộ đơn được hiển thị lại | | | | |
| 19 | Applications List - Bảng<br>・Hiển thị trạng thái badge | ・Có đơn nhiều trạng thái khác nhau | Badge màu đúng theo từng trạng thái:<br>・applied: xám, screening: vàng, interviewing: xanh, offered: tím, hired: xanh đậm, rejected: đỏ | | | | Cần confirm màu theo design |
| 20 | Applications List - Bảng<br>・Phân trang | ・Có >10 đơn | Phân trang hiển thị đúng<br>・Chuyển trang đúng dữ liệu | | | | |
| 21 | Applications List - Navigation<br>・Click vào row | ・Click vào row đơn bất kỳ | Redirect đến `/dashboard/applications/[id]`<br>・Trang chi tiết ứng tuyển load đúng | | | | |
| 22 | Applications List - API<br>・GET /api/dashboard/applications thành công | ・Gọi API với session hợp lệ (admin) | Response 200:<br>・`{ success: true, data: [...applications] }`<br>・Fields đầy đủ: id, candidateName, jobTitle, status, createdAt, source | | | | |
| 23 | Applications List - API<br>・Filter params trong query string | ・Gọi GET /api/dashboard/applications?jobId=1&status=applied | API chỉ trả về đơn thỏa điều kiện<br>・Không trả dư dữ liệu | | | | |
| 24 | Applications List - API<br>・401 không có session | ・Gọi API không có cookie | Response 401 | | | | |
| 25 | Applications List - API<br>・403 role candidate | ・Gọi API với role candidate | Response 403 | | | | |
| 26 | Application Detail - Khởi tạo<br>・Layout chi tiết | ・Truy cập `/dashboard/applications/[id]`<br>・ID hợp lệ | Trang hiển thị đầy đủ:<br>・Thông tin ứng viên (tên, email, phone, CV link)<br>・Thông tin job đã ứng tuyển<br>・Trạng thái hiện tại<br>・3 tab: Lịch sử trạng thái, Phỏng vấn, Nhật ký email | | | | |
| 27 | Application Detail - Khởi tạo<br>・ID không tồn tại | ・Truy cập `/dashboard/applications/99999` | Hiển thị trang 404<br>・"Không tìm thấy đơn ứng tuyển"<br>・Link quay lại danh sách | | | | |
| 28 | Application Detail - Tab<br>・Tab Lịch sử trạng thái | ・Click tab "Lịch sử trạng thái" | Hiển thị timeline:<br>・Từng bước thay đổi với trạng thái cũ → mới<br>・Người thay đổi, thời gian, ghi chú | | | | |
| 29 | Application Detail - Tab<br>・Tab Phỏng vấn | ・Click tab "Phỏng vấn"<br>・Có ≥1 lịch PV | Danh sách lịch PV:<br>・Ngày giờ, hình thức, interviewer, link/địa điểm, trạng thái | | | | |
| 30 | Application Detail - Tab<br>・Tab Phỏng vấn - không có lịch PV | ・Tab Phỏng vấn, chưa có lịch | Hiển thị "Chưa có lịch phỏng vấn"<br>・Nút "Lên lịch phỏng vấn" | | | | |
| 31 | Application Detail - Tab<br>・Tab Nhật ký email | ・Click tab "Nhật ký email"<br>・Có ≥1 email đã gửi | Danh sách email đã gửi cho ứng viên này:<br>・subject, type, status (sent/failed), sent_at | | | | |
| 32 | Application Detail - API<br>・GET /api/dashboard/applications/[id] | ・Gọi API với ID hợp lệ | Response 200:<br>・`{ success: true, data: { application: {...}, interviewers: [...] } }` | | | | |
| 33 | Đổi trạng thái - Mở modal<br>・Click nút Đổi trạng thái | ・Đang ở trang chi tiết đơn<br>・Role admin/hr<br>・Click nút "Đổi trạng thái" | Modal hiển thị:<br>・Dropdown chọn trạng thái mới<br>・Textarea ghi chú (tùy chọn)<br>・Nút Xác nhận và Hủy | | | | |
| 34 | Đổi trạng thái - Validation<br>・Không chọn trạng thái mới | ・Mở modal đổi trạng thái<br>・Không chọn status mới<br>・Click Xác nhận | Lỗi: "Vui lòng chọn trạng thái mới"<br>・Không gọi API | | | | |
| 35 | Đổi trạng thái - Validation<br>・Chọn trạng thái hiện tại | ・Trạng thái hiện tại = "applied"<br>・Chọn lại "applied"<br>・Click Xác nhận | Lỗi hoặc cảnh báo: "Trạng thái không thay đổi"<br>・Không gọi API | | | | Cần confirm xử lý này |
| 36 | Đổi trạng thái - Submit<br>・applied → screening | ・Đơn đang ở status=applied<br>・Chọn to_status=screening<br>・Nhập note tùy chọn<br>・Click Xác nhận | API POST /api/dashboard/applications/[id]/status trả 200<br>・Status trong DB cập nhật thành screening<br>・application_status_history có record mới<br>・Badge trạng thái cập nhật ngay trên UI<br>・Toast: "Cập nhật trạng thái thành công" | | | | |
| 37 | Đổi trạng thái - Submit<br>・screening → interviewing | ・Đơn đang ở status=screening<br>・Chọn to_status=interviewing | Như trên, cập nhật đúng | | | | |
| 38 | Đổi trạng thái - Submit<br>・interviewing → offered | ・Đơn ở status=interviewing → offered | Cập nhật đúng | | | | |
| 39 | Đổi trạng thái - Submit<br>・offered → hired | ・Đơn ở offered → hired | Cập nhật đúng<br>・KPI "Hired" trên dashboard tăng 1 | | | | |
| 40 | Đổi trạng thái - Submit<br>・→ rejected (từ bất kỳ trạng thái) | ・Đơn ở bất kỳ trạng thái<br>・Chọn rejected | Cập nhật đúng thành rejected | | | | |
| 41 | Đổi trạng thái - Ghi chú<br>・Nhập ghi chú | ・Nhập note "Ứng viên không đạt yêu cầu kỹ thuật"<br>・Xác nhận đổi trạng thái | Ghi chú được lưu trong application_status_history<br>・Hiển thị trong tab Lịch sử trạng thái | | | | |
| 42 | Đổi trạng thái - API lỗi<br>・API 500 | ・Mock API POST .../status trả 500 | Toast lỗi: "Không thể cập nhật trạng thái"<br>・Trạng thái trong DB không thay đổi<br>・Modal không đóng | | | | Cần mock API |
| 43 | Đổi trạng thái - API lỗi<br>・API 403 (interviewer) | ・Đăng nhập role interviewer<br>・Gọi API đổi trạng thái | API trả 403<br>・Nút "Đổi trạng thái" ẩn hoặc disabled với interviewer | | | | |
| 44 | Đổi trạng thái - Hủy<br>・Click Hủy trong modal | ・Mở modal đổi trạng thái<br>・Click Hủy | Modal đóng<br>・Trạng thái không thay đổi<br>・Không gọi API | | | | |
| 45 | Gửi Email - Mở modal<br>・Click nút Gửi Email | ・Đang ở chi tiết đơn<br>・Role admin/hr<br>・Click "Gửi Email" | Modal form gửi email hiển thị:<br>・Field: subject (bắt buộc), type (bắt buộc), body (bắt buộc)<br>・Nút Gửi và Hủy | | | | |
| 46 | Gửi Email - Validation<br>・Subject bắt buộc | ・Để trống subject<br>・Điền đầy đủ các field khác<br>・Click Gửi | Lỗi: "Tiêu đề email là bắt buộc"<br>・Không gọi API | | | | |
| 47 | Gửi Email - Validation<br>・Type bắt buộc | ・Không chọn loại email<br>・Click Gửi | Lỗi: "Vui lòng chọn loại email"<br>・Không gọi API | | | | |
| 48 | Gửi Email - Validation<br>・Body bắt buộc | ・Để trống nội dung email<br>・Click Gửi | Lỗi: "Nội dung email là bắt buộc" | | | | |
| 49 | Gửi Email - Submit<br>・Gửi email thành công | ・Điền đầy đủ subject, type, body<br>・Click Gửi | API POST /api/dashboard/applications/[id]/email trả 200<br>・Email được gửi qua Resend<br>・email_logs tạo record mới với status=sent<br>・Toast: "Email đã được gửi thành công"<br>・Modal đóng | | | | |
| 50 | Gửi Email - Submit<br>・Lỗi gửi email (Resend lỗi) | ・Mock Resend service lỗi | API trả lỗi<br>・email_logs tạo record với status=failed<br>・Toast lỗi: "Không thể gửi email"<br>・Modal không đóng | | | | Cần mock Resend |
| 51 | Gửi Email - API<br>・POST .../email với role interviewer | ・Đăng nhập interviewer<br>・Gọi API gửi email | API trả 403<br>・Không gửi email | | | | |
| 52 | Gửi Email - Tab Nhật ký<br>・Email mới xuất hiện sau gửi | ・Sau khi gửi email thành công<br>・Click tab "Nhật ký email" | Email mới xuất hiện trong danh sách<br>・Status = sent, sent_at = thời điểm vừa gửi | | | | |
| 53 | Lên lịch PV - Mở modal<br>・Click Lên lịch phỏng vấn | ・Đang ở tab Phỏng vấn của chi tiết đơn<br>・Role admin/hr<br>・Click "Lên lịch phỏng vấn" | Modal form hiển thị:<br>・Fields: interviewer (bắt buộc), datetime (bắt buộc), type (bắt buộc), link/location (tùy chọn), notes (tùy chọn)<br>・Dropdown interviewer lấy từ data interviewers | | | | |
| 54 | Lên lịch PV - Validation<br>・Interviewer bắt buộc | ・Không chọn interviewer<br>・Click Lưu | Lỗi: "Vui lòng chọn người phỏng vấn" | | | | |
| 55 | Lên lịch PV - Validation<br>・Datetime bắt buộc | ・Không chọn ngày giờ | Lỗi: "Vui lòng chọn thời gian phỏng vấn" | | | | |
| 56 | Lên lịch PV - Validation<br>・Datetime trong quá khứ | ・Chọn datetime đã qua (hôm qua) | Lỗi: "Thời gian phỏng vấn phải là tương lai" | | | | |
| 57 | Lên lịch PV - Validation<br>・Type bắt buộc | ・Không chọn loại phỏng vấn (phone/video/onsite/technical) | Lỗi: "Vui lòng chọn hình thức phỏng vấn" | | | | |
| 58 | Lên lịch PV - Validation<br>・Video type cần link | ・Chọn type = video<br>・Để trống link | Cảnh báo hoặc lỗi: "Link phỏng vấn video là bắt buộc" | | | | Cần confirm validation này |
| 59 | Lên lịch PV - Validation<br>・Onsite type cần location | ・Chọn type = onsite<br>・Để trống location | Cảnh báo hoặc lỗi: "Địa điểm phỏng vấn là bắt buộc" | | | | Cần confirm validation này |
| 60 | Lên lịch PV - Submit<br>・Tạo lịch thành công | ・Điền đầy đủ thông tin hợp lệ<br>・Click Lưu | API POST /api/dashboard/applications/[id]/interviews trả 200/201<br>・Record mới trong bảng interviews<br>・Lịch mới xuất hiện trong tab Phỏng vấn<br>・Toast: "Lên lịch phỏng vấn thành công"<br>・Modal đóng | | | | |
| 61 | Lên lịch PV - Submit<br>・API 500 | ・Mock API trả 500 | Toast lỗi: "Không thể tạo lịch phỏng vấn"<br>・Không tạo record trong DB | | | | Cần mock API |
| 62 | Lên lịch PV - Interviewer dropdown<br>・Danh sách interviewer | ・Mở modal lên lịch PV | Dropdown hiển thị tất cả users có role=interviewer<br>・Tên đầy đủ hiển thị<br>・Không hiển thị user role khác | | | | |
| 63 | Lên lịch PV - Interviewer dropdown<br>・Không có interviewer nào | ・DB không có user role=interviewer | Dropdown rỗng hoặc thông báo "Chưa có interviewer" | | | | |
| 64 | Lên lịch PV - Hủy<br>・Click Hủy trong modal | ・Mở modal lên lịch PV<br>・Click Hủy | Modal đóng<br>・Không tạo record | | | | |
| 65 | Application Detail - CV<br>・Xem CV ứng viên | ・Đang ở trang chi tiết đơn<br>・Click link/nút xem CV | File CV mở trong tab mới<br>・Signed URL từ Appwrite storage | | | | |
| 66 | Application Detail - Cover letter<br>・Xem cover letter | ・Đơn có cover letter<br>・Xem chi tiết | Cover letter hiển thị đầy đủ nội dung | | | | |
| 67 | Application Detail - Cover letter<br>・Không có cover letter | ・Đơn không có cover letter | Hiển thị "Không có cover letter" hoặc ẩn section | | | | |
| 68 | API GET applications/[id]/emails<br>・Email logs của đơn cụ thể | ・Gọi GET /api/dashboard/applications/[id]/emails | Response 200:<br>・Chỉ trả về email logs của application đó<br>・Không trả về email của application khác | | | | |
| 69 | Status flow - Kiểm tra luồng<br>・applied → hired (bỏ qua bước) | ・Đơn ở applied<br>・Thử chọn to_status=hired thẳng | API chấp nhận hoặc từ chối<br>・Nếu có enforce flow: lỗi "Không thể bỏ qua bước"<br>・Nếu không enforce: cập nhật được | | | | Cần confirm business rule |
| 70 | Loading / UX<br>・Loading khi tải chi tiết đơn | ・Network chậm<br>・Truy cập `/dashboard/applications/[id]` | Skeleton loader hiển thị<br>・Tabs render sau khi data load | | | | |
| 71 | Double submit<br>・Click Xác nhận nhiều lần | ・Mở modal đổi trạng thái<br>・Click Xác nhận nhiều lần nhanh | Nút Xác nhận bị disabled ngay khi click lần đầu<br>・Chỉ gọi API 1 lần<br>・Không tạo duplicate status history | | | | |
| 72 | Message / Toast<br>・Tất cả actions thành công | ・Đổi trạng thái / Gửi email / Lên lịch PV thành công | Toast xanh xuất hiện với nội dung phù hợp<br>・Tự đóng sau ~3-5 giây<br>・Không chồng chéo nhau | | | | |
| 73 | Message / Toast<br>・Tất cả actions lỗi | ・API lỗi cho mọi action | Toast đỏ xuất hiện với thông báo lỗi<br>・Nội dung rõ ràng để user biết cần làm gì | | | | |
| 74 | Security<br>・Interviewer không thể đổi trạng thái | ・Đăng nhập interviewer<br>・Xem chi tiết đơn | Nút "Đổi trạng thái" bị ẩn hoặc disabled<br>・Nếu cố gọi API trực tiếp: trả 403 | | | | |
| 75 | Security<br>・Interviewer không thể gửi email | ・Đăng nhập interviewer<br>・Xem chi tiết đơn | Nút "Gửi Email" bị ẩn hoặc disabled | | | | |
