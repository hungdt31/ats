# UTE - Unit Test Evidence
# Module D - Dashboard Admin/HR

| Thông tin | Nội dung |
|-----------|----------|
| **Tên hệ thống** | ATS - Applicant Tracking System |
| **ID chức năng** | D-01 đến D-02 |
| **Tên chức năng** | Admin/HR Dashboard |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Người test lần 1** | |
| **Người test lần 2** | |
| **Người test lần 3** | |
| **Tổng số item test** | 42 |
| **Tổng số bug** | |

> **Quy ước kết quả:** ○: OK | ×: NG chưa giải quyết | ×→○: NG đã giải quyết | －: Không test

---

## D-01 · Trang chủ Dashboard với KPI Cards (`/dashboard`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 1 | Bảo vệ route – Guest chưa đăng nhập | Xóa cookie, truy cập `/dashboard` | Redirect về `/login` | | | | |
| 2 | Bảo vệ route – Role candidate | Đăng nhập role=candidate, truy cập `/dashboard` | Redirect về `/candidate` hoặc trả 403 | | | | |
| 3 | Bảo vệ route – Role interviewer | Đăng nhập role=interviewer, truy cập `/dashboard` | Trả 403 hoặc redirect, không hiển thị KPI | | | | |
| 4 | Khởi tạo – Admin truy cập | Đăng nhập role=admin | Dashboard load HTTP 200, hiển thị 4 KPI cards | | | | |
| 5 | Khởi tạo – HR truy cập | Đăng nhập role=hr | Dashboard load HTTP 200, hiển thị 4 KPI cards | | | | |
| 6 | KPI – Số job đang active | DB có N job `status=active` | KPI card "Tin tuyển dụng active" hiển thị đúng số N | | | | |
| 7 | KPI – Hồ sơ mới (7 ngày) | DB có M đơn trong 7 ngày gần nhất | KPI card "Hồ sơ mới" hiển thị đúng số M | | | | |
| 8 | KPI – Lịch phỏng vấn hôm nay | DB có P interview `scheduled_at = TODAY` và `status=scheduled` | KPI card "Lịch PV hôm nay" hiển thị đúng số P | | | | |
| 9 | KPI – Tổng ứng viên đã tuyển | DB có Q application `status=hired` | KPI card "Đã tuyển" hiển thị đúng số Q | | | | |
| 10 | KPI – Giá trị = 0 (không có dữ liệu) | DB trống hoàn toàn | Tất cả KPI cards hiển thị "0", không lỗi | | | | |
| 11 | Layout – 4 KPI Cards | Truy cập `/dashboard` | Hiển thị đủ 4 card: Active Jobs, Hồ sơ mới, PV hôm nay, Đã tuyển; mỗi card có icon, số liệu, label | | | | |
| 12 | Layout – Biểu đồ xu hướng ứng tuyển | Truy cập `/dashboard` | Biểu đồ line/bar hiển thị số lượng hồ sơ theo thời gian (theo tuần hoặc tháng) | | | | |
| 13 | Biểu đồ xu hướng – Chuyển đổi kỳ | Click "Theo tuần" / "Theo tháng" | Biểu đồ cập nhật dữ liệu theo kỳ được chọn | | | | |
| 14 | Layout – Biểu đồ phân phối trạng thái | Truy cập `/dashboard` | Biểu đồ donut/bar hiển thị tỉ lệ đơn ứng tuyển theo từng trạng thái: applied, screening, interviewing, offered, hired, rejected | | | | |
| 15 | Biểu đồ phân phối – Không có dữ liệu | DB không có application nào | Biểu đồ hiển thị trạng thái empty ("Chưa có dữ liệu") | | | | |
| 16 | Điều hướng nhanh – Link đến Jobs | Click card/link "Quản lý tin tuyển dụng" | Chuyển đến `/dashboard/jobs` | | | | |
| 17 | Điều hướng nhanh – Link đến Applications | Click card/link "Quản lý hồ sơ" | Chuyển đến `/dashboard/applications` | | | | |
| 18 | Điều hướng nhanh – Link đến Interviews | Click card/link "Lịch phỏng vấn" | Chuyển đến `/dashboard/interviews` | | | | |
| 19 | Responsive – Layout dashboard | Xem trên màn hình 768px | KPI cards hiển thị dạng 2 cột (grid), biểu đồ không bị vỡ | | | | |
| 20 | API – Dữ liệu KPI | Dashboard load, kiểm tra network | API trả đúng 4 giá trị KPI, status 200 | | | | |
| 21 | API – Lỗi khi fetch KPI | Giả lập DB lỗi khi dashboard load | Hiển thị skeleton/fallback, toast lỗi hoặc retry | | | | |
| 22 | Refresh dữ liệu | Click nút "Làm mới" hoặc reload trang | KPI cards cập nhật giá trị mới nhất từ DB | | | | |
| 23 | UserNav – Hiển thị tên và role | Đăng nhập admin/hr, xem header | Header UserNav hiển thị đúng tên và badge role (Admin/HR) | | | | |
| 24 | Sidebar – Hiển thị menu điều hướng | Truy cập `/dashboard` | Sidebar có đầy đủ menu: Dashboard, Jobs, Applications, Interviews, Emails (với role tương ứng) | | | | |
| 25 | Sidebar – Active state | Đang ở `/dashboard` | Menu "Dashboard" được highlight active | | | | |

---

## D-02 · Nhật ký email hệ thống (`/dashboard/emails`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 26 | Bảo vệ route – Guest | Guest truy cập `/dashboard/emails` | Redirect về `/login` | | | | |
| 27 | Bảo vệ route – Candidate | Đăng nhập candidate, truy cập `/dashboard/emails` | Trả về 403 hoặc redirect | | | | |
| 28 | Bảo vệ route – Interviewer | Đăng nhập interviewer, truy cập `/dashboard/emails` | Trả về 403 hoặc redirect | | | | |
| 29 | Khởi tạo – Admin truy cập | Đăng nhập admin | Trang load HTTP 200, hiển thị danh sách email logs | | | | |
| 30 | Khởi tạo – HR truy cập | Đăng nhập hr | Trang load HTTP 200, hiển thị danh sách email logs | | | | |
| 31 | Layout – Bảng nhật ký email | Có email logs trong DB | Bảng hiển thị các cột: Người nhận, Loại email, Tiêu đề, Trạng thái gửi, Thời gian gửi | | | | |
| 32 | Hiển thị – Không có log | Bảng `email_logs` trống | Hiển thị empty state "Chưa có email nào được gửi" | | | | |
| 33 | Lọc – Theo loại email | Chọn loại email trong dropdown (vd: OTP, Interview Invitation, Status Update) | Chỉ hiển thị email logs của loại đó | | | | |
| 34 | Lọc – Theo trạng thái gửi | Chọn "Thành công" hoặc "Thất bại" | Chỉ hiển thị log có trạng thái tương ứng | | | | |
| 35 | Lọc – Theo khoảng thời gian | Chọn date range từ ngày X đến ngày Y | Chỉ hiển thị email logs trong khoảng thời gian đó | | | | |
| 36 | Lọc – Tìm kiếm theo email người nhận | Nhập địa chỉ email vào ô tìm kiếm | Chỉ hiển thị log email gửi đến địa chỉ đó | | | | |
| 37 | Lọc – Xóa bộ lọc | Sau khi lọc, click "Xóa bộ lọc" | Hiển thị lại toàn bộ email logs | | | | |
| 38 | Phân trang | Có nhiều hơn 20 bản ghi email logs | Hiển thị phân trang, mỗi trang tối đa 20 (hoặc N theo cấu hình) bản ghi | | | | |
| 39 | Xem chi tiết email | Click vào 1 bản ghi email log | Mở modal/drawer hiển thị đầy đủ: người nhận, nội dung email, thời gian gửi, trạng thái | | | | |
| 40 | Trạng thái gửi – Email thất bại | Có email log với `status=failed` | Hiển thị badge/tag "Thất bại" màu đỏ, có thể thấy lý do thất bại | | | | |
| 41 | Phân quyền – Chỉ xem log của hệ thống | Admin xem tất cả log | Hiển thị toàn bộ email log không giới hạn theo user | | | | |
| 42 | API – Lỗi khi load email logs | Giả lập DB lỗi | Hiển thị thông báo lỗi, có nút retry | | | | |
