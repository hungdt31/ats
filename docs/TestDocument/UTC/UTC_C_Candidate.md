# TEST CASE DOCUMENT
# Module C - Khu vực của Ứng viên (Candidate)

| Thông tin | Nội dung |
|-----------|----------|
| **Module** | C - Candidate Area (`/candidate`, `/candidate/profile`, `/candidate/applications`) |
| **Ngày tạo** | 2026-05-17 |
| **Người tạo** | AI Agent |
| **Phiên bản** | 1.0 |

---

| No. | Item test | Điều kiện test | Kết quả mong đợi/cách xác nhận | Kết quả test - 1st | Kết quả test - 2nd | Kết quả test - 3rd | Note |
|-----|-----------|----------------|-------------------------------|-------------------|-------------------|-------------------|------|
| 1 | Phân quyền - Truy cập<br>・/candidate khi chưa đăng nhập | ・Chưa đăng nhập<br>・Truy cập trực tiếp `/candidate` | Redirect đến `/login`<br>・Không hiển thị nội dung | | | | |
| 2 | Phân quyền - Truy cập<br>・/candidate với role admin | ・Đăng nhập role admin<br>・Truy cập `/candidate` | Redirect đến `/dashboard` hoặc `/unauthorized`<br>・Không cho vào khu vực candidate | | | | |
| 3 | Phân quyền - Truy cập<br>・/candidate với role hr | ・Đăng nhập role hr<br>・Truy cập `/candidate` | Redirect phù hợp (không phải /candidate) | | | | |
| 4 | Phân quyền - Truy cập<br>・/candidate với role interviewer | ・Đăng nhập role interviewer<br>・Truy cập `/candidate` | Redirect phù hợp (không phải /candidate) | | | | |
| 5 | Phân quyền - Truy cập<br>・/candidate với role candidate | ・Đăng nhập role candidate<br>・Truy cập `/candidate` | Trang candidate dashboard hiển thị đúng<br>・Không redirect | | | | |
| 6 | Candidate Dashboard - Khởi tạo<br>・Layout tổng thể | ・Đăng nhập role candidate<br>・Truy cập `/candidate` | Trang hiển thị đầy đủ:<br>・KPI tóm tắt số đơn theo trạng thái<br>・Lịch phỏng vấn sắp tới<br>・Danh sách job gợi ý<br>・Navigation sidebar/menu | | | | |
| 7 | Candidate Dashboard - KPI<br>・Thống kê đơn ứng tuyển | ・Candidate đã có đơn ứng tuyển trong các trạng thái khác nhau | Hiển thị đúng số đơn theo từng trạng thái:<br>・Đã nộp (applied), Đang xét duyệt (screening), Phỏng vấn (interviewing), Đề nghị (offered), Đã tuyển (hired), Bị từ chối (rejected) | | | | |
| 8 | Candidate Dashboard - KPI<br>・Candidate mới (chưa có đơn) | ・Candidate mới đăng ký chưa nộp đơn nào<br>・Truy cập `/candidate` | Tất cả KPI hiển thị = 0<br>・Không có lỗi<br>・Không hiển thị dữ liệu của candidate khác | | | | |
| 9 | Candidate Dashboard<br>・Lịch phỏng vấn sắp tới | ・Candidate có lịch PV được lên trong vòng 7 ngày tới | Danh sách lịch PV hiển thị:<br>・Tên vị trí, thời gian, hình thức (phone/video/onsite)<br>・Sắp xếp theo thời gian tăng dần | | | | |
| 10 | Candidate Dashboard<br>・Không có lịch PV | ・Candidate không có lịch PV nào sắp tới | Section lịch PV hiển thị:<br>・"Chưa có lịch phỏng vấn sắp tới"<br>・Không có lỗi | | | | |
| 11 | Candidate Dashboard<br>・Job gợi ý | ・Candidate có profile đầy đủ | Hiển thị danh sách job gợi ý<br>・Mỗi item có thể click để xem chi tiết | | | | Cần confirm logic gợi ý |
| 12 | Candidate Profile - Khởi tạo<br>・Layout | ・Truy cập `/candidate/profile`<br>・Candidate có profile đã tạo | Trang hiển thị form profile với dữ liệu hiện tại:<br>・fullName, phone, title, bio, skills, education, linkedin, github<br>・Avatar hiện tại (nếu có)<br>・Nút Lưu | | | | |
| 13 | Candidate Profile - Khởi tạo<br>・Profile chưa có (mới) | ・Candidate mới, chưa có candidate_profile<br>・Truy cập `/candidate/profile` | Trang hiển thị form rỗng<br>・fullName lấy từ user.fullName làm mặc định<br>・Các field khác để trống<br>・Nút Lưu | | | | Cần confirm theo tài liệu thiết kế |
| 14 | Profile - Validation fullName<br>・fullName bắt buộc | ・Xóa nội dung fullName về trống<br>・Click Lưu | Lỗi: "Họ tên là bắt buộc"<br>・Không gọi API | | | | |
| 15 | Profile - Validation fullName<br>・fullName vượt 255 ký tự | ・Nhập fullName 256 ký tự | Lỗi: "Họ tên không được vượt quá 255 ký tự" | | | | |
| 16 | Profile - Validation fullName<br>・fullName hợp lệ (tối đa 255 ký tự) | ・Nhập fullName đúng 255 ký tự | Không có lỗi, field chấp nhận | | | | |
| 17 | Profile - Validation phone<br>・Phone tùy chọn (để trống) | ・Để trống field phone<br>・Click Lưu | Lưu thành công<br>・phone = null trong DB | | | | |
| 18 | Profile - Validation phone<br>・Phone sai format | ・Nhập phone "123abc"<br>・Click Lưu | Lỗi: "Số điện thoại không đúng định dạng VN"<br>・Gợi ý format: 10 chữ số bắt đầu bằng 0 | | | | |
| 19 | Profile - Validation phone<br>・Phone VN hợp lệ | ・Nhập "0987654321" | Không có lỗi | | | | |
| 20 | Profile - Validation skills<br>・Skills - JSON array | ・Nhập skills theo dạng tag/chip input | Skills được lưu dạng JSON array<br>・Ví dụ: ["JavaScript", "React", "TypeScript"]<br>・Hiển thị lại đúng sau khi lưu | | | | Cần confirm UI type cho skills field |
| 21 | Profile - Validation bio<br>・Bio tùy chọn (để trống) | ・Để trống bio<br>・Click Lưu | Lưu thành công<br>・bio = null trong DB | | | | |
| 22 | Profile - Validation linkedin/github<br>・URL không hợp lệ | ・Nhập linkedin "khong-phai-url"<br>・Click Lưu | Lỗi: "URL LinkedIn không hợp lệ"<br>・Format: https://linkedin.com/in/... | | | | Cần confirm validation URL |
| 23 | Profile - Validation linkedin/github<br>・URL hợp lệ | ・Nhập "https://linkedin.com/in/username" | Không có lỗi | | | | |
| 24 | Profile - Lưu profile<br>・Cập nhật thành công | ・Thay đổi fullName, phone, bio<br>・Click Lưu | API POST /api/candidate/profile trả 200<br>・Toast: "Cập nhật hồ sơ thành công"<br>・Dữ liệu hiển thị đúng sau khi lưu<br>・Dữ liệu trong DB được cập nhật | | | | |
| 25 | Profile - Lưu profile<br>・API 401 (session hết hạn) | ・Session hết hạn<br>・Click Lưu | Toast lỗi: "Phiên đăng nhập hết hạn"<br>・Redirect đến `/login` | | | | |
| 26 | Profile - Lưu profile<br>・API 500 | ・Mock API /api/candidate/profile trả 500 | Toast lỗi: "Có lỗi xảy ra khi cập nhật hồ sơ"<br>・Dữ liệu không thay đổi trong DB | | | | Cần mock API |
| 27 | Profile - Lưu profile<br>・Không có thay đổi | ・Vào trang profile<br>・Không thay đổi gì<br>・Click Lưu | API vẫn được gọi hoặc nút Lưu disabled khi không có thay đổi<br>・Toast thành công hoặc không gọi API | | | | Cần confirm UX |
| 28 | Profile - Avatar<br>・Upload avatar | ・Click nút upload avatar<br>・Chọn file ảnh JPG/PNG hợp lệ | Ảnh được upload lên Appwrite storage<br>・Avatar mới hiển thị ngay<br>・URL avatar được cập nhật trong profile | | | | |
| 29 | Profile - Avatar<br>・File ảnh không hợp lệ | ・Upload file `.pdf` làm avatar | Lỗi: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF)"<br>・Không upload | | | | |
| 30 | Profile - Avatar<br>・File ảnh vượt kích thước | ・Upload ảnh >2MB (giả sử giới hạn) | Lỗi: "Ảnh không được vượt quá [X]MB" | | | | Cần confirm giới hạn size avatar |
| 31 | Candidate Applications - Khởi tạo<br>・Layout | ・Truy cập `/candidate/applications`<br>・Có ≥2 đơn ứng tuyển | Danh sách đơn hiển thị:<br>・Mỗi row: tên công việc, trạng thái, ngày nộp<br>・Có thể click vào row để xem chi tiết<br>・Sắp xếp theo ngày nộp giảm dần | | | | |
| 32 | Candidate Applications - Khởi tạo<br>・Không có đơn nào | ・Candidate chưa nộp đơn nào | Hiển thị:<br>・"Bạn chưa ứng tuyển vào vị trí nào"<br>・Nút/link "Tìm việc làm" dẫn đến `/jobs` | | | | |
| 33 | Candidate Applications - Danh sách<br>・Hiển thị trạng thái | ・Có đơn với các trạng thái khác nhau | Badge trạng thái hiển thị đúng màu:<br>・Applied: xám/xanh nhạt<br>・Screening: vàng<br>・Interviewing: xanh<br>・Offered: tím<br>・Hired: xanh đậm<br>・Rejected: đỏ | | | | Cần confirm màu sắc theo design |
| 34 | Candidate Applications - Chi tiết<br>・Click vào đơn | ・Danh sách đơn hiển thị<br>・Click vào một row | Mở trang/modal chi tiết đơn<br>・Hiển thị timeline lịch sử trạng thái<br>・Thông tin job, ngày nộp, CV đã nộp | | | | |
| 35 | Candidate Applications - Chi tiết<br>・Timeline trạng thái | ・Mở chi tiết đơn có lịch sử thay đổi trạng thái | Timeline hiển thị đúng:<br>・Từng bước thay đổi trạng thái có timestamp<br>・Note/ghi chú từ HR (nếu có)<br>・Thứ tự chronological | | | | |
| 36 | Candidate Applications - API<br>・GET /api/candidate/applications | ・Gọi API<br>・Cookie hợp lệ | Response 200:<br>・Chỉ trả về đơn của candidate đang đăng nhập<br>・Không trả về đơn của candidate khác (isolation) | | | | |
| 37 | Candidate Applications - API<br>・401 khi chưa đăng nhập | ・Gọi /api/candidate/applications không có cookie | Response 401 | | | | |
| 38 | File CV - Khởi tạo<br>・Danh sách file | ・Truy cập trang quản lý file (trong profile hoặc riêng)<br>・Đã có ≥1 file CV | Danh sách file CV hiển thị:<br>・Tên file, ngày upload, nút xem/xóa | | | | Cần confirm vị trí UI quản lý file |
| 39 | File CV - Upload<br>・Upload file CV hợp lệ | ・Click Upload<br>・Chọn file PDF, <5MB | File được upload lên Appwrite storage<br>・API POST /api/candidate/files trả 200<br>・File mới xuất hiện trong danh sách<br>・Toast: "Upload file thành công" | | | | |
| 40 | File CV - Upload<br>・File không hợp lệ (sai loại) | ・Upload file `.exe` | Lỗi: "Chỉ chấp nhận file PDF, DOC, DOCX"<br>・Không upload | | | | |
| 41 | File CV - Upload<br>・File vượt 5MB | ・Upload PDF >5MB | Lỗi: "File không được vượt quá 5MB" | | | | |
| 42 | File CV - Xem file<br>・Click xem | ・Click nút xem file CV | File được mở trong tab mới hoặc preview<br>・URL là signed URL từ Appwrite storage | | | | |
| 43 | File CV - Xóa file<br>・Click xóa | ・Click nút xóa file<br>・Xác nhận trong popup confirm | API DELETE /api/candidate/files/[id] trả 200<br>・File bị xóa khỏi Appwrite storage<br>・File biến mất khỏi danh sách<br>・Toast: "Xóa file thành công" | | | | |
| 44 | File CV - Xóa file<br>・Hủy xóa | ・Click xóa<br>・Click Hủy trong popup confirm | File không bị xóa<br>・Danh sách không thay đổi | | | | |
| 45 | File CV - Xóa file<br>・API lỗi khi xóa | ・Mock API DELETE /api/candidate/files/[id] trả 500 | Toast lỗi: "Không thể xóa file"<br>・File vẫn còn trong danh sách | | | | Cần mock API |
| 46 | File CV - Xóa file<br>・Confirm dialog | ・Click nút xóa | Popup confirm hiển thị:<br>・Câu hỏi xác nhận: "Bạn có chắc muốn xóa file này?"<br>・Nút OK và Hủy | | | | |
| 47 | Interviews - Xem lịch PV<br>・GET /api/candidate/interviews | ・Có lịch PV được lên cho candidate | Danh sách lịch PV trả về đúng<br>・Thông tin: datetime, type, link/location, interviewer name | | | | |
| 48 | Interviews - Trạng thái lịch PV<br>・Lịch đã qua | ・Có lịch PV với datetime đã qua | Hiển thị đúng:<br>・Badge "Đã qua" hoặc dựa vào status (completed/cancelled) | | | | |
| 49 | Navigation - Sidebar<br>・Menu candidate | ・Đăng nhập role candidate<br>・Xem sidebar/navigation | Menu hiển thị các link:<br>・Dashboard<br>・Hồ sơ<br>・Đơn ứng tuyển<br>・Không hiển thị menu của admin/hr | | | | |
| 50 | Security - Data isolation<br>・Không xem được data của candidate khác | ・Đăng nhập candidate A<br>・Thử gọi API với ID của candidate B | API trả 403 hoặc 404<br>・Không trả về dữ liệu của candidate B | | | | Kiểm tra security |
| 51 | Loading state<br>・Tải dữ liệu profile | ・Truy cập `/candidate/profile`<br>・Network chậm | Skeleton loader hoặc spinner hiển thị<br>・Không flash nội dung rỗng | | | | |
| 52 | Loading state<br>・Tải danh sách đơn | ・Truy cập `/candidate/applications`<br>・Network chậm | Skeleton loader hiển thị trong lúc chờ | | | | |
| 53 | React Query - Cache<br>・Dữ liệu không reload khi switch tab | ・Truy cập /candidate<br>・Switch sang tab khác và quay lại | `refetchOnWindowFocus: false` → Không tự gọi lại API<br>・Dữ liệu cũ vẫn được giữ | | | | |
| 54 | Profile - Cancel edit<br>・Hủy thay đổi | ・Thay đổi thông tin profile<br>・Click Hủy (nếu có) hoặc navigate đi | Thay đổi không được lưu<br>・Dữ liệu trong DB không thay đổi<br>・Quay lại trang profile vẫn thấy dữ liệu cũ | | | | Cần confirm UI có nút Cancel không |
| 55 | Message / Toast<br>・Toast update profile thành công | ・Cập nhật profile thành công | Toast xanh: "Cập nhật hồ sơ thành công"<br>・Tự đóng sau ~3 giây | | | | |
| 56 | Message / Toast<br>・Toast upload CV thành công | ・Upload file thành công | Toast xanh: "Upload file thành công" | | | | |
| 57 | Message / Toast<br>・Toast xóa file thành công | ・Xóa file thành công | Toast xanh: "Xóa file thành công" | | | | |
| 58 | Responsive<br>・Mobile view Candidate Dashboard | ・Truy cập `/candidate` trên mobile | Trang responsive đúng:<br>・KPI cards xếp theo cột<br>・Sidebar thu gọn hoặc hamburger menu | | | | |
| 59 | GET candidate/profile - API<br>・Profile chưa tạo | ・Candidate mới, chưa có candidate_profile record<br>・Gọi GET /api/candidate/profile | Response phù hợp:<br>・200 với data null/empty<br>・Hoặc 404 (cần confirm) | | | | Cần confirm API behavior |
| 60 | Đăng xuất từ khu vực candidate<br>・Logout và không vào lại được | ・Đang ở `/candidate`<br>・Click Logout<br>・Thử truy cập lại `/candidate` | Sau logout, redirect đến `/login`<br>・Truy cập lại `/candidate` → redirect `/login` | | | | |
