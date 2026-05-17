# TEST CASE DOCUMENT
# Module G - Quản lý Công việc (Jobs)

| Thông tin | Nội dung |
|-----------|----------|
| **Module** | G - Jobs (`/dashboard/jobs`, `/dashboard/jobs/new`, `/dashboard/jobs/[id]/edit`, `/dashboard/jobs/[id]/channels`) |
| **Ngày tạo** | 2026-05-17 |
| **Người tạo** | AI Agent |
| **Phiên bản** | 1.0 |

---

| No. | Item test | Điều kiện test | Kết quả mong đợi/cách xác nhận | Kết quả test - 1st | Kết quả test - 2nd | Kết quả test - 3rd | Note |
|-----|-----------|----------------|-------------------------------|-------------------|-------------------|-------------------|------|
| 1 | Phân quyền - Truy cập<br>・/dashboard/jobs chưa đăng nhập | ・Chưa đăng nhập<br>・Truy cập trực tiếp URL | Redirect đến `/login` | | | | |
| 2 | Phân quyền - Truy cập<br>・/dashboard/jobs với role candidate | ・Đăng nhập role candidate | Redirect hoặc 403 | | | | |
| 3 | Phân quyền - Truy cập<br>・/dashboard/jobs với role interviewer | ・Đăng nhập role interviewer<br>・Truy cập `/dashboard/jobs` | Redirect hoặc 403<br>・Interviewer không được phép truy cập module này | | | | |
| 4 | Phân quyền - Truy cập<br>・/dashboard/jobs với role hr | ・Đăng nhập role hr | Trang hiển thị đúng<br>・Có nút "Tạo tin mới"<br>・Có link Chỉnh sửa và Kênh đăng | | | | |
| 5 | Phân quyền - Truy cập<br>・/dashboard/jobs với role admin | ・Đăng nhập role admin | Trang hiển thị đúng<br>・Full access: xem, tạo, sửa, quản lý kênh | | | | |
| 6 | Jobs List - Khởi tạo<br>・Layout | ・Đăng nhập admin<br>・Có ≥3 job trong DB | Trang hiển thị:<br>・Bảng: Tiêu đề, Phòng ban, Trạng thái, Số ứng viên, Người tạo, Ngày tạo<br>・Bộ lọc status<br>・Nút "Tạo tin mới" | | | | |
| 7 | Jobs List - Khởi tạo<br>・Không có dữ liệu | ・DB chưa có job nào | Hiển thị "Chưa có tin tuyển dụng nào. Bấm 'Tạo tin mới' để bắt đầu."<br>・Nút "Tạo tin mới" | | | | |
| 8 | Jobs List - Filter<br>・Filter theo status=draft | ・Chọn status "draft" | Chỉ hiển thị job có status=draft | | | | |
| 9 | Jobs List - Filter<br>・Filter theo status=active | ・Chọn status "active" | Chỉ hiển thị job đang active | | | | |
| 10 | Jobs List - Filter<br>・Filter theo status=closed | ・Chọn status "closed" | Chỉ hiển thị job đã đóng | | | | |
| 11 | Jobs List - Filter<br>・Filter theo status=archived | ・Chọn status "archived" | Chỉ hiển thị job đã lưu trữ | | | | |
| 12 | Jobs List - Filter<br>・Không có kết quả | ・Chọn status nhưng không có job nào thỏa | Hiển thị "Không tìm thấy tin phù hợp" + nút xóa filter | | | | |
| 13 | Jobs List - Filter<br>・Reset filter | ・Đang có filter<br>・Xóa filter | Toàn bộ jobs hiển thị lại | | | | |
| 14 | Jobs List - Badge màu<br>・Kiểm tra màu theo trạng thái | ・Có đủ 4 trạng thái trong danh sách | Badge màu đúng:<br>・draft=xám, active=xanh, closed=vàng, archived=đỏ | | | | Cần confirm màu theo design |
| 15 | Jobs List - Số ứng viên<br>・Hiển thị đúng _count | ・Job có 5 ứng viên<br>・Xem danh sách | Cột "Số ứng viên" hiển thị đúng = 5 | | | | |
| 16 | Jobs List - Phân trang<br>・>20 jobs | ・Có >20 jobs trong DB | Phân trang đúng<br>・Mặc định 20/trang | | | | |
| 17 | Jobs List - Navigation<br>・Click link Chỉnh sửa | ・Click nút/link Chỉnh sửa của một job | Redirect đến `/dashboard/jobs/[id]/edit` | | | | |
| 18 | Jobs List - Navigation<br>・Click link Kênh đăng | ・Click nút/link Kênh đăng của một job | Redirect đến `/dashboard/jobs/[id]/channels` | | | | |
| 19 | Jobs List - API<br>・GET /api/dashboard/jobs thành công | ・Gọi API với session hợp lệ (admin) | Response 200:<br>・`{ success: true, data: { items: [...], total, page, limit } }`<br>・Mỗi item có: id, title, department, status, _count.applications, created_by, created_at | | | | |
| 20 | Jobs List - API<br>・GET với filter query string | ・GET /api/dashboard/jobs?status=active | Chỉ trả về jobs có status=active | | | | |
| 21 | Jobs List - API<br>・401 chưa đăng nhập | ・Gọi API không có cookie | Response 401 | | | | |
| 22 | Jobs List - API<br>・403 role interviewer | ・Gọi API với role interviewer | Response 403 | | | | |
| 23 | Create Job - Khởi tạo form<br>・Layout | ・Truy cập `/dashboard/jobs/new` | Form hiển thị đầy đủ fields:<br>・Tiêu đề (bắt buộc), Mô tả (bắt buộc), Yêu cầu, Lợi ích, Địa điểm, Phòng ban<br>・Lương tối thiểu/tối đa, Loại hợp đồng (bắt buộc)<br>・Kỹ năng, Số lượng tuyển (default 1), Trạng thái (default draft)<br>・Hạn đăng tuyển, Nút Lưu và Hủy | | | | |
| 24 | Create Job - Validation<br>・Tiêu đề bỏ trống | ・Bỏ trống title<br>・Click Lưu | Lỗi G-VAL-001: "Tiêu đề tin tuyển dụng không được để trống."<br>・Không gọi API | | | | |
| 25 | Create Job - Validation<br>・Tiêu đề vượt 200 ký tự | ・Nhập title > 200 ký tự | Lỗi G-VAL-001 hoặc field tự giới hạn | | | | |
| 26 | Create Job - Validation<br>・Mô tả bỏ trống | ・Bỏ trống description<br>・Click Lưu | Lỗi G-VAL-002: "Mô tả công việc không được để trống." | | | | |
| 27 | Create Job - Validation<br>・Loại hợp đồng bỏ trống | ・Không chọn employment_type | Lỗi G-VAL-003: "Vui lòng chọn loại hợp đồng." | | | | |
| 28 | Create Job - Validation<br>・salary_min > salary_max | ・Nhập salary_min = 20,000,000<br>・salary_max = 10,000,000<br>・Click Lưu | Lỗi G-VAL-004: "Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu." | | | | |
| 29 | Create Job - Validation<br>・Số lượng tuyển = 0 | ・Nhập headcount = 0 | Lỗi G-VAL-005: "Số lượng tuyển phải là số nguyên dương." | | | | |
| 30 | Create Job - Validation<br>・Số lượng tuyển âm | ・Nhập headcount = -1 | Lỗi G-VAL-005 | | | | |
| 31 | Create Job - Validation<br>・Hạn đăng tuyển trong quá khứ | ・Chọn expires_at = hôm qua | Lỗi G-VAL-006: "Hạn đăng tuyển phải là ngày trong tương lai." | | | | |
| 32 | Create Job - Submit<br>・Tạo thành công (tối thiểu) | ・Điền title, description, employment_type<br>・Các trường còn lại để trống/default<br>・Click Lưu | API POST /api/dashboard/jobs trả 201<br>・Job record mới trong DB với status=draft<br>・slug auto-generated từ title<br>・created_by = ID user hiện tại<br>・Redirect về `/dashboard/jobs`<br>・Toast: "Tin tuyển dụng đã được tạo thành công." (G-SUC-001) | | | | |
| 33 | Create Job - Submit<br>・Tạo thành công (đầy đủ fields) | ・Điền đầy đủ tất cả fields hợp lệ<br>・status=active, expires_at tương lai<br>・Click Lưu | API 201<br>・Job record đầy đủ trong DB<br>・Toast G-SUC-001 | | | | |
| 34 | Create Job - Auto slug<br>・Kiểm tra slug generation | ・Title = "Frontend Developer 2026"<br>・Tạo thành công | slug trong DB = "frontend-developer-2026" hoặc có UUID suffix nếu trùng<br>・URL công khai `/jobs/[slug]` hoạt động | | | | |
| 35 | Create Job - Auto slug<br>・Tiêu đề trùng lặp | ・Tạo 2 job cùng title "Backend Developer"<br>・Submit lần 2 | Job thứ 2 có slug "backend-developer-[uuid]" (không trùng slug với job 1) | | | | |
| 36 | Create Job - Submit<br>・API 500 | ・Mock API POST trả 500 | Toast lỗi G-ERR-002: "Không thể tạo tin tuyển dụng. Vui lòng kiểm tra lại thông tin."<br>・Không tạo record trong DB<br>・Form không reset | | | | Cần mock API |
| 37 | Create Job - Trạng thái mặc định<br>・status default = draft | ・Mở form tạo job<br>・Không chọn status | Dropdown trạng thái hiển thị sẵn "draft" | | | | |
| 38 | Create Job - Hủy<br>・Click Hủy | ・Đang ở form tạo job<br>・Click Hủy | Redirect về `/dashboard/jobs`<br>・Không tạo record | | | | |
| 39 | Edit Job - Khởi tạo form<br>・Pre-fill dữ liệu | ・Truy cập `/dashboard/jobs/[id]/edit`<br>・Job tồn tại | Form pre-fill đầy đủ dữ liệu hiện tại của job:<br>・title, description, requirements, benefits, location...<br>・status hiển thị đúng giá trị hiện tại | | | | |
| 40 | Edit Job - ID không tồn tại<br>・404 | ・Truy cập `/dashboard/jobs/99999/edit` | Hiển thị lỗi G-ERR-006: "Tin tuyển dụng không tồn tại." | | | | |
| 41 | Edit Job - Submit<br>・Sửa tiêu đề thành công | ・Sửa title thành "Senior Frontend Developer"<br>・Click Lưu thay đổi | API PATCH /api/dashboard/jobs/[id] trả 200<br>・DB cập nhật title mới<br>・Redirect về `/dashboard/jobs`<br>・Toast: "Tin tuyển dụng đã được cập nhật." (G-SUC-002) | | | | |
| 42 | Edit Job - Đổi status<br>・draft → active | ・Job đang draft<br>・Chọn status = active<br>・Click Lưu | API PATCH 200<br>・DB cập nhật status = active<br>・Job xuất hiện trên trang public | | | | |
| 43 | Edit Job - Đổi status<br>・active → closed | ・Job đang active<br>・Chọn status = closed<br>・Click Lưu | API PATCH 200<br>・status = closed<br>・Job không còn nhận đơn mới | | | | |
| 44 | Edit Job - Validation<br>・Giống Create Job | ・Xóa trắng title<br>・Click Lưu thay đổi | Cùng validation rules như form tạo mới<br>・Lỗi G-VAL-001 | | | | |
| 45 | Edit Job - Submit<br>・API 500 | ・Mock API PATCH trả 500 | Toast lỗi G-ERR-003: "Không thể cập nhật tin tuyển dụng. Vui lòng thử lại." | | | | Cần mock API |
| 46 | Edit Job - Hủy<br>・Click Hủy | ・Đang ở form edit<br>・Click Hủy | Redirect về `/dashboard/jobs`<br>・Không lưu thay đổi | | | | |
| 47 | Job Channels - Khởi tạo<br>・Layout | ・Truy cập `/dashboard/jobs/[id]/channels`<br>・Có ≥1 kênh đã thêm | Trang hiển thị:<br>・Bảng kênh: Tên kênh, URL, Trạng thái, Ngày đăng, Hết hạn<br>・Badge trạng thái kênh đúng màu<br>・Nút "Thêm kênh" | | | | |
| 48 | Job Channels - Khởi tạo<br>・Chưa có kênh nào | ・Job chưa có kênh đăng | Bảng rỗng<br>・Nút "Thêm kênh" vẫn hiển thị | | | | |
| 49 | Job Channels - Thêm kênh<br>・Mở modal | ・Click nút "Thêm kênh" | Modal hiển thị form:<br>・Tên kênh (bắt buộc), URL bài đăng (tùy chọn), Hạn đăng kênh (tùy chọn)<br>・Nút Lưu kênh và Hủy | | | | |
| 50 | Job Channels - Validation<br>・Tên kênh bỏ trống | ・Bỏ trống tên kênh<br>・Click Lưu kênh | Lỗi G-VAL-007: "Tên kênh đăng không được để trống."<br>・Không gọi API | | | | |
| 51 | Job Channels - Validation<br>・URL không hợp lệ | ・Nhập external_url = "not-a-url"<br>・Click Lưu kênh | Lỗi G-VAL-008: "URL bài đăng không đúng định dạng." | | | | |
| 52 | Job Channels - Validation<br>・Hạn đăng kênh trong quá khứ | ・Nhập expires_at = hôm qua | Lỗi hoặc cảnh báo<br>・Không thêm được kênh | | | | Cần confirm validation này |
| 53 | Job Channels - Thêm kênh thành công | ・Nhập tên kênh "LinkedIn"<br>・URL hợp lệ<br>・Click Lưu kênh | API POST /api/dashboard/jobs/[id]/channels trả 201<br>・Kênh mới xuất hiện trong bảng<br>・Modal đóng<br>・Toast: "Kênh đăng tin đã được thêm thành công." (G-SUC-003) | | | | |
| 54 | Job Channels - Thêm kênh trùng lặp<br>・Kênh đã tồn tại | ・Job đã có kênh "LinkedIn"<br>・Thêm kênh "LinkedIn" lần 2 | API trả 409 Conflict<br>・Toast lỗi G-ERR-005: "Kênh đăng này đã tồn tại cho tin tuyển dụng." | | | | |
| 55 | Job Channels - Badge trạng thái kênh<br>・Màu theo trạng thái | ・Có kênh ở các trạng thái khác nhau | Badge màu đúng:<br>・pending=vàng, posted=xanh, failed=đỏ, expired=xám | | | | Cần confirm màu theo design |
| 56 | Job Channels - Cập nhật trạng thái kênh<br>・pending → posted | ・Có kênh đang pending<br>・Cập nhật trạng thái sang posted | API PATCH /api/dashboard/jobs/[id]/channels/[channelId] trả 200<br>・Trạng thái kênh cập nhật đúng | | | | Cần confirm UI action này |
| 57 | Job Channels - API<br>・GET /api/dashboard/jobs/[id]/channels | ・Gọi API với job ID hợp lệ | Response 200:<br>・`{ success: true, data: [...channels] }`<br>・Chỉ trả về channels của job đó | | | | |
| 58 | Job Channels - Job không tồn tại<br>・GET channels của job không có | ・Truy cập `/dashboard/jobs/99999/channels` | Hiển thị lỗi G-ERR-006: "Tin tuyển dụng không tồn tại." | | | | |
| 59 | API - POST /api/dashboard/jobs<br>・401 không có session | ・Gọi API POST jobs không có cookie | Response 401 | | | | |
| 60 | API - PATCH /api/dashboard/jobs/[id]<br>・403 role interviewer | ・Đăng nhập interviewer<br>・Gọi PATCH API | Response 403 | | | | |
| 61 | API - GET /api/dashboard/jobs/[id]<br>・Chi tiết job | ・Gọi GET /api/dashboard/jobs/[id] | Response 200:<br>・`{ success: true, data: { ...job, _count, channels, creator } }` | | | | |
| 62 | Loading / UX<br>・Skeleton khi tải danh sách | ・Network chậm<br>・Truy cập `/dashboard/jobs` | Skeleton rows hiển thị trong khi fetching | | | | |
| 63 | Loading / UX<br>・Skeleton khi load form edit | ・Network chậm<br>・Truy cập `/dashboard/jobs/[id]/edit` | Skeleton hoặc spinner hiển thị trước khi form pre-fill | | | | |
| 64 | Double submit<br>・Click Lưu nhiều lần (Create) | ・Form tạo job hợp lệ<br>・Click Lưu nhanh nhiều lần | Nút disabled sau click đầu tiên<br>・Chỉ gọi API 1 lần<br>・Chỉ tạo 1 job record | | | | |
| 65 | Double submit<br>・Click Lưu thay đổi nhiều lần (Edit) | ・Form edit job hợp lệ<br>・Click nhanh nhiều lần | Nút disabled sau click đầu tiên<br>・Chỉ gọi API 1 lần | | | | |
| 66 | Message / Toast<br>・Tất cả actions thành công | ・Tạo / Sửa job / Thêm kênh thành công | Toast xanh với nội dung theo MessageCD<br>・Tự đóng sau ~3-5 giây | | | | |
| 67 | Message / Toast<br>・Tất cả actions lỗi | ・API lỗi | Toast đỏ với thông báo lỗi rõ ràng | | | | |
| 68 | Security<br>・Candidate không truy cập được API jobs | ・Đăng nhập candidate<br>・GET /api/dashboard/jobs | Response 403 | | | | |
| 69 | Security<br>・Interviewer không tạo được job qua API | ・Đăng nhập interviewer<br>・POST /api/dashboard/jobs | Response 403 | | | | |
| 70 | URL sync<br>・Filter phản ánh vào URL | ・Chọn filter status=active<br>・Copy URL và mở tab mới | Tab mới tải với filter status=active sẵn | | | | |
| 71 | Job public URL<br>・Slug hoạt động trên public route | ・Job có status=active<br>・Truy cập `/jobs/[slug]` | Trang chi tiết job hiển thị đúng thông tin<br>・Không cần đăng nhập | | | | |
| 72 | Job public URL<br>・Job không active không hiển thị public | ・Job có status=draft hoặc closed<br>・Truy cập `/jobs/[slug]` | Trang 404 hoặc redirect<br>・Không hiển thị job chưa active | | | | Cần confirm business rule |
