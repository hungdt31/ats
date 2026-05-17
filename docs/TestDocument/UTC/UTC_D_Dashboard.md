# TEST CASE DOCUMENT
# Module D - Quản trị chung (Dashboard Admin / HR)

| Thông tin | Nội dung |
|-----------|----------|
| **Module** | D - Dashboard (`/dashboard`, `/dashboard/emails`) |
| **Ngày tạo** | 2026-05-17 |
| **Người tạo** | AI Agent |
| **Phiên bản** | 1.0 |

---

| No. | Item test | Điều kiện test | Kết quả mong đợi/cách xác nhận | Kết quả test - 1st | Kết quả test - 2nd | Kết quả test - 3rd | Note |
|-----|-----------|----------------|-------------------------------|-------------------|-------------------|-------------------|------|
| 1 | Phân quyền - Truy cập<br>・/dashboard khi chưa đăng nhập | ・Chưa đăng nhập<br>・Truy cập trực tiếp `/dashboard` | Redirect đến `/login`<br>・Không hiển thị nội dung dashboard | | | | |
| 2 | Phân quyền - Truy cập<br>・/dashboard với role candidate | ・Đăng nhập role candidate<br>・Truy cập `/dashboard` | Redirect đến `/candidate` hoặc `/unauthorized`<br>・Không hiển thị nội dung dashboard | | | | |
| 3 | Phân quyền - Truy cập<br>・/dashboard với role admin | ・Đăng nhập role admin<br>・Truy cập `/dashboard` | Trang dashboard hiển thị đầy đủ<br>・Không redirect<br>・Hiển thị tất cả chức năng của admin | | | | |
| 4 | Phân quyền - Truy cập<br>・/dashboard với role hr | ・Đăng nhập role hr<br>・Truy cập `/dashboard` | Trang dashboard hiển thị đúng<br>・Chức năng phù hợp với quyền hr | | | | |
| 5 | Phân quyền - Truy cập<br>・/dashboard với role interviewer | ・Đăng nhập role interviewer<br>・Truy cập `/dashboard` | Trang dashboard hiển thị<br>・Chức năng bị giới hạn phù hợp với interviewer | | | | Cần confirm quyền interviewer trên dashboard |
| 6 | Phân quyền - URL trực tiếp<br>・/dashboard/emails với role candidate | ・Đăng nhập role candidate<br>・Truy cập `/dashboard/emails` | Redirect đến `/candidate` hoặc `/unauthorized` | | | | |
| 7 | Dashboard Home - Khởi tạo<br>・Layout tổng thể | ・Đăng nhập role admin<br>・Truy cập `/dashboard` | Trang hiển thị đầy đủ:<br>・4 KPI cards: Active Jobs, New Applications, Scheduled Interviews, Hired count<br>・Charts: Application funnel, Interviews by status, Team size by role<br>・Quick links: Jobs/Applications/Interviews | | | | |
| 8 | Dashboard Home - KPI Cards<br>・Active Jobs | ・Có ≥1 job status=active trong DB | KPI card "Active Jobs" hiển thị đúng số lượng<br>・So sánh với query: SELECT COUNT(*) FROM jobs WHERE status='active' | | | | |
| 9 | Dashboard Home - KPI Cards<br>・New Applications | ・Có đơn ứng tuyển mới (trong 7 ngày/30 ngày) | KPI card "New Applications" hiển thị đúng số<br>・Có label thời gian: "7 ngày qua" hoặc tương đương | | | | Cần confirm định nghĩa "new" |
| 10 | Dashboard Home - KPI Cards<br>・Scheduled Interviews | ・Có lịch PV với status=scheduled | KPI card "Scheduled Interviews" hiển thị đúng số | | | | |
| 11 | Dashboard Home - KPI Cards<br>・Hired count | ・Có application với status=hired | KPI card "Hired" hiển thị đúng số<br>・So sánh với query DB | | | | |
| 12 | Dashboard Home - KPI Cards<br>・Tất cả = 0 (DB rỗng/mới) | ・DB chưa có dữ liệu thực<br>・Truy cập dashboard | Tất cả KPI hiển thị 0<br>・Không có lỗi<br>・Charts hiển thị trạng thái rỗng | | | | |
| 13 | Dashboard Home - Charts<br>・Application Funnel | ・Có applications ở các trạng thái khác nhau | Biểu đồ funnel hiển thị đúng:<br>・Applied → Screening → Interviewing → Offered → Hired<br>・Số liệu khớp với DB<br>・Không có lỗi render | | | | |
| 14 | Dashboard Home - Charts<br>・Interviews by status | ・Có interviews với các status khác nhau | Biểu đồ hiển thị phân bố:<br>・scheduled / completed / cancelled / rescheduled<br>・Số liệu đúng | | | | |
| 15 | Dashboard Home - Charts<br>・Team size by role | ・Có users với các role khác nhau | Biểu đồ hiển thị số người theo role:<br>・candidate / hr / admin / interviewer | | | | |
| 16 | Dashboard Home - Charts<br>・Responsive chart | ・Resize browser window | Charts tự điều chỉnh kích thước<br>・Không bị overflow hoặc ẩn nhãn | | | | |
| 17 | Dashboard Home - Quick Links<br>・Link đến Jobs | ・Click Quick link "Jobs" | Redirect đến trang quản lý jobs (`/dashboard/jobs`) | | | | Cần confirm path |
| 18 | Dashboard Home - Quick Links<br>・Link đến Applications | ・Click Quick link "Applications" | Redirect đến `/dashboard/applications` | | | | |
| 19 | Dashboard Home - Quick Links<br>・Link đến Interviews | ・Click Quick link "Interviews" | Redirect đến trang quản lý interviews | | | | Cần confirm path |
| 20 | Dashboard Home - Navigation<br>・Sidebar menu admin | ・Đăng nhập role admin | Sidebar hiển thị menu đầy đủ:<br>・Dashboard, Jobs, Applications, Interviews, Email Logs, Users (nếu có) | | | | |
| 21 | Dashboard Home - Navigation<br>・Sidebar menu hr | ・Đăng nhập role hr | Sidebar hiển thị menu phù hợp với hr<br>・Không hiển thị chức năng chỉ admin | | | | Cần confirm quyền hr |
| 22 | Dashboard Home - Navigation<br>・Sidebar menu interviewer | ・Đăng nhập role interviewer | Sidebar hiển thị menu giới hạn<br>・Chủ yếu: Dashboard, Applications (view only), Interviews | | | | Cần confirm quyền interviewer |
| 23 | Dashboard Home - Loading<br>・Tải dữ liệu KPI | ・Network chậm<br>・Truy cập `/dashboard` | Skeleton loader hiển thị cho KPI cards và charts<br>・Không hiển thị số 0 rồi mới load số thật | | | | |
| 24 | Dashboard Home - API lỗi<br>・API KPI trả 500 | ・Mock API dashboard trả 500 | Hiển thị thông báo lỗi phù hợp<br>・"Không thể tải dữ liệu dashboard"<br>・Có nút retry | | | | Cần mock API |
| 25 | Dashboard Home - API lỗi<br>・API KPI trả 401 | ・Session hết hạn<br>・Truy cập dashboard | Redirect đến `/login` | | | | |
| 26 | Email Logs - Khởi tạo<br>・Layout | ・Truy cập `/dashboard/emails`<br>・Đăng nhập role admin | Trang hiển thị:<br>・Bảng email logs<br>・Filter: loại email (type), trạng thái (status)<br>・Các cột: subject, type, recipient, status, sent_at | | | | |
| 27 | Email Logs - Khởi tạo<br>・Không có email log | ・DB chưa có email_logs nào | Bảng hiển thị:<br>・"Chưa có email log nào"<br>・Không có lỗi | | | | |
| 28 | Email Logs - Bảng<br>・Hiển thị dữ liệu | ・Có ≥5 email logs trong DB | Mỗi row hiển thị đúng:<br>・subject, type, recipient (email), status (sent/failed/pending), sent_at format datetime | | | | |
| 29 | Email Logs - Filter<br>・Filter theo type | ・Chọn type "application_update" từ dropdown | Chỉ hiển thị email logs có type = "application_update"<br>・Số row giảm so với không filter | | | | |
| 30 | Email Logs - Filter<br>・Filter theo status=sent | ・Chọn status "sent" | Chỉ hiển thị emails có status = sent | | | | |
| 31 | Email Logs - Filter<br>・Filter theo status=failed | ・Chọn status "failed" | Chỉ hiển thị emails có status = failed<br>・Có thể highlight màu đỏ | | | | |
| 32 | Email Logs - Filter<br>・Filter theo status=pending | ・Chọn status "pending" | Chỉ hiển thị emails có status = pending | | | | |
| 33 | Email Logs - Filter<br>・Kết hợp type + status | ・Chọn type "interview_invite" + status "failed" | Chỉ hiển thị emails thỏa cả 2 điều kiện | | | | |
| 34 | Email Logs - Filter<br>・Không có kết quả | ・Chọn filter combination không có data | Hiển thị "Không có email nào phù hợp điều kiện" | | | | |
| 35 | Email Logs - Filter<br>・Reset filter | ・Đang có filter<br>・Click "Reset" hoặc xóa filter | Hiển thị lại toàn bộ email logs | | | | |
| 36 | Email Logs - Bảng<br>・Sort theo sent_at | ・Click vào header cột sent_at | Danh sách được sắp xếp theo thời gian gửi<br>・Toggle giữa asc/desc | | | | Cần confirm UI có sort không |
| 37 | Email Logs - Bảng<br>・Phân trang (pagination) | ・Có >10 email logs | Phân trang hiển thị đúng:<br>・Mỗi trang X records<br>・Nút Next/Prev/số trang<br>・Chuyển trang đúng dữ liệu | | | | Cần confirm số records/trang |
| 38 | Email Logs - API<br>・GET /api/dashboard/emails thành công | ・Gọi API với cookie hợp lệ (admin) | Response 200:<br>・`{ success: true, data: [...emailLogs] }`<br>・Fields: id, subject, type, recipient, status, sent_at | | | | |
| 39 | Email Logs - API<br>・GET /api/dashboard/emails với role candidate | ・Đăng nhập candidate<br>・Gọi GET /api/dashboard/emails | Response 403:<br>・`{ success: false, error: "Forbidden" }` | | | | |
| 40 | Email Logs - API<br>・GET /api/dashboard/emails không có cookie | ・Gọi API không có session cookie | Response 401 | | | | |
| 41 | Email Logs - API<br>・Lỗi 500 | ・Mock API /api/dashboard/emails trả 500 | Bảng hiển thị lỗi<br>・"Không thể tải danh sách email"<br>・Có nút Thử lại | | | | Cần mock API |
| 42 | Email Logs - Status badge<br>・Màu sắc status | ・Có email logs với status khác nhau | Badge màu đúng:<br>・sent: xanh lá<br>・failed: đỏ<br>・pending: vàng | | | | Cần confirm theo design |
| 43 | Email Logs - Xem chi tiết<br>・Click vào row (nếu có) | ・Click vào row email log | Hiển thị chi tiết email:<br>・Nội dung body email (nếu được lưu)<br>・Error message (nếu status=failed) | | | | Cần confirm có tính năng này không |
| 44 | Dashboard - Refresh data<br>・Nút refresh | ・Đang ở dashboard<br>・Click nút refresh/reload data | Dữ liệu KPI và charts được tải lại từ API<br>・Hiển thị số mới nhất | | | | Cần confirm có nút refresh không |
| 45 | Dashboard - User info<br>・Hiển thị thông tin user đăng nhập | ・Đăng nhập với role admin, tên "Nguyễn Văn A" | Góc phải trên hiển thị:<br>・Avatar hoặc initials<br>・Tên: "Nguyễn Văn A"<br>・Role: "Admin" | | | | |
| 46 | Dashboard - Breadcrumb<br>・Email Logs page | ・Truy cập `/dashboard/emails` | Breadcrumb: Dashboard > Email Logs | | | | |
| 47 | Responsive<br>・Mobile view Dashboard | ・Truy cập `/dashboard` trên mobile (375px) | Trang responsive:<br>・KPI cards xếp 1 cột<br>・Sidebar ẩn, hamburger menu<br>・Charts co giãn đúng | | | | |
| 48 | Responsive<br>・Mobile view Email Logs | ・Truy cập `/dashboard/emails` trên mobile | Bảng có thể scroll ngang<br>・Không bị tràn viewport | | | | |
| 49 | Security<br>・Interviewer không xem được Email Logs | ・Đăng nhập role interviewer<br>・Truy cập `/dashboard/emails` | Nếu không có quyền: redirect hoặc 403<br>・Không hiển thị dữ liệu email | | | | Cần confirm quyền interviewer |
| 50 | Dashboard - Logout<br>・Từ trang dashboard | ・Đang ở `/dashboard`<br>・Click Logout trong user menu | Logout thành công<br>・Cookie bị xóa<br>・Redirect đến `/login`<br>・Truy cập lại `/dashboard` → redirect `/login` | | | | |
