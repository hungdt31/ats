# TEST CASE DOCUMENT
# Module A - Khu vực Công khai (Public & Landing)

| Thông tin | Nội dung |
|-----------|----------|
| **Module** | A - Public & Landing (`/`, `/jobs`, `/jobs/[slug]`) |
| **Ngày tạo** | 2026-05-17 |
| **Người tạo** | AI Agent |
| **Phiên bản** | 1.0 |

---

| No. | Item test | Điều kiện test | Kết quả mong đợi/cách xác nhận | Kết quả test - 1st | Kết quả test - 2nd | Kết quả test - 3rd | Note |
|-----|-----------|----------------|-------------------------------|-------------------|-------------------|-------------------|------|
| 1 | Khởi tạo Landing Page<br>・Layout tổng thể | ・Truy cập `/` khi chưa đăng nhập<br>・DB có ít nhất 1 job active | Trang hiển thị đầy đủ:<br>・Hero section với tiêu đề và CTA<br>・Danh sách featured jobs<br>・Navbar hiển thị nút Login/Register<br>・Không có lỗi console | | | | |
| 2 | Khởi tạo Landing Page<br>・Hero section | ・Truy cập `/`<br>・Kiểm tra nội dung hero | Hero section hiển thị:<br>・Tiêu đề chính<br>・Sub-title hoặc description<br>・Nút CTA "Xem việc làm" dẫn đến `/jobs` | | | | |
| 3 | Khởi tạo Landing Page<br>・Featured Jobs | ・Truy cập `/`<br>・DB có ≥3 job active | Danh sách featured jobs hiển thị đúng:<br>・Mỗi job card có: tiêu đề, công ty, địa điểm, loại hình<br>・Click vào card → điều hướng đến `/jobs/[slug]` | | | | |
| 4 | Khởi tạo Landing Page<br>・Không có featured jobs | ・Truy cập `/`<br>・DB không có job active nào | Trang vẫn tải được bình thường<br>・Section featured jobs hiển thị thông báo "Chưa có việc làm nổi bật"<br>hoặc ẩn section đó | | | | Cần confirm theo tài liệu thiết kế |
| 5 | Khởi tạo Landing Page<br>・Navbar khi đã đăng nhập (candidate) | ・Đăng nhập với role candidate<br>・Truy cập `/` | Navbar hiển thị:<br>・Avatar/tên user<br>・Không hiển thị nút Login/Register<br>・Có dropdown menu: Profile, Logout | | | | |
| 6 | Khởi tạo Landing Page<br>・Navbar khi đã đăng nhập (admin/hr) | ・Đăng nhập với role admin hoặc hr<br>・Truy cập `/` | Navbar hiển thị:<br>・Avatar/tên user<br>・Link đến `/dashboard`<br>・Không hiển thị nút Login/Register | | | | |
| 7 | Khởi tạo Jobs List<br>・Layout tổng thể | ・Truy cập `/jobs`<br>・DB có ≥5 job active | Trang hiển thị đầy đủ:<br>・Danh sách tất cả job active<br>・Bộ lọc: keyword, location, type, department<br>・Mỗi job card đầy đủ thông tin | | | | |
| 8 | Khởi tạo Jobs List<br>・Tải dữ liệu ban đầu | ・Truy cập `/jobs`<br>・API GET /api/jobs trả về thành công | Danh sách jobs được hiển thị đúng<br>・Số lượng job card khớp với số records trong DB (status=active)<br>・Không hiển thị job có status=draft/closed/archived | | | | |
| 9 | Khởi tạo Jobs List<br>・Trạng thái loading | ・Truy cập `/jobs`<br>・Network chậm (throttle 3G) | Trong thời gian tải:<br>・Hiển thị skeleton loader hoặc spinner<br>・Không hiển thị nội dung rỗng đột ngột | | | | |
| 10 | Khởi tạo Jobs List<br>・Không có dữ liệu | ・Truy cập `/jobs`<br>・DB không có job active nào | Hiển thị thông báo trống:<br>・"Hiện chưa có vị trí tuyển dụng nào"<br>・Không hiển thị lỗi | | | | Cần confirm nội dung message |
| 11 | Jobs List - Filter<br>・Filter theo keyword | ・Truy cập `/jobs`<br>・Nhập keyword "Frontend" vào ô tìm kiếm<br>・Nhấn Enter hoặc click Search | Danh sách lọc:<br>・Chỉ hiển thị job có title/description chứa "Frontend"<br>・Hiển thị số kết quả tìm được<br>・Keyword được giữ nguyên trong ô search | | | | |
| 12 | Jobs List - Filter<br>・Filter theo location | ・Truy cập `/jobs`<br>・Chọn location "Hà Nội" từ dropdown | Danh sách lọc:<br>・Chỉ hiển thị job có location = "Hà Nội"<br>・Nếu không có kết quả → hiển thị "Không tìm thấy kết quả" | | | | |
| 13 | Jobs List - Filter<br>・Filter theo employment type | ・Truy cập `/jobs`<br>・Chọn type "Full Time" | Danh sách lọc:<br>・Chỉ hiển thị job có employment_type = full_time<br>・Label hiển thị đúng ("Full Time") | | | | |
| 14 | Jobs List - Filter<br>・Filter theo department | ・Truy cập `/jobs`<br>・Chọn department "Engineering" | Danh sách lọc:<br>・Chỉ hiển thị job thuộc department đó<br>・Không hiển thị job department khác | | | | |
| 15 | Jobs List - Filter<br>・Kết hợp nhiều điều kiện | ・Nhập keyword "Developer"<br>・Chọn location "TP. Hồ Chí Minh"<br>・Chọn type "Full Time" | Danh sách lọc:<br>・Chỉ hiển thị job thỏa tất cả 3 điều kiện<br>・Kết quả ít hơn hoặc bằng từng filter riêng lẻ | | | | |
| 16 | Jobs List - Filter<br>・Không có kết quả | ・Nhập keyword không tồn tại "xyzabc123456"<br>・Nhấn Search | Hiển thị:<br>・"Không tìm thấy việc làm phù hợp"<br>・Danh sách rỗng<br>・Không hiển thị lỗi | | | | |
| 17 | Jobs List - Filter<br>・Reset filter | ・Đang có filter active<br>・Click nút "Xóa bộ lọc" hoặc "Reset" | Tất cả filter được xóa:<br>・Danh sách hiển thị lại toàn bộ jobs<br>・Các ô filter trở về giá trị mặc định | | | | Cần confirm UI có nút reset không |
| 18 | Jobs List - Filter<br>・Keyword có ký tự đặc biệt | ・Nhập keyword `<script>alert(1)</script>` | Hệ thống xử lý an toàn:<br>・Không thực thi script<br>・Hiển thị kết quả trống hoặc tìm kiếm literal string<br>・Không có lỗi server | | | | Kiểm tra XSS |
| 19 | Jobs List - Hiển thị card<br>・Nội dung job card | ・Danh sách jobs được tải thành công | Mỗi job card hiển thị đầy đủ:<br>・Tiêu đề công việc (job title)<br>・Địa điểm<br>・Loại hình (Full Time / Part Time / Contract)<br>・Ngày đăng hoặc deadline<br>・Nút "Xem chi tiết" | | | | |
| 20 | Jobs List - Navigation<br>・Click vào job card | ・Danh sách jobs hiển thị<br>・Click vào job card | Điều hướng đến `/jobs/[slug]`<br>・URL chứa đúng slug của job<br>・Trang chi tiết job load đúng | | | | |
| 21 | Job Detail - Khởi tạo<br>・Layout tổng thể | ・Truy cập `/jobs/[slug]` với slug hợp lệ<br>・API GET /api/jobs/[slug] thành công | Trang hiển thị đầy đủ:<br>・Tiêu đề công việc<br>・Mô tả công việc<br>・Yêu cầu ứng tuyển<br>・Thông tin lương (nếu có)<br>・Nút Apply | | | | |
| 22 | Job Detail - Khởi tạo<br>・Job không tồn tại | ・Truy cập `/jobs/slug-khong-ton-tai` | Hiển thị trang 404<br>・Message "Không tìm thấy công việc này"<br>・Có nút quay lại danh sách | | | | |
| 23 | Job Detail - Khởi tạo<br>・Job đã đóng (closed/archived) | ・Truy cập `/jobs/[slug]` với job có status=closed | Hiển thị trang không tuyển dụng:<br>・Message "Vị trí này đã đóng tuyển dụng"<br>・Nút Apply bị disabled hoặc ẩn | | | | Cần confirm theo tài liệu thiết kế |
| 24 | Job Detail - Phân quyền<br>・Nút Apply khi chưa đăng nhập | ・Truy cập `/jobs/[slug]` khi chưa đăng nhập | Nút Apply hiển thị nhưng khi click:<br>・Chuyển hướng đến `/login`<br>・Hoặc hiển thị thông báo "Vui lòng đăng nhập để ứng tuyển" | | | | |
| 25 | Job Detail - Phân quyền<br>・Nút Apply với role candidate | ・Đăng nhập với role candidate<br>・Truy cập `/jobs/[slug]` | Nút Apply được kích hoạt (enabled)<br>・Click vào nút → form apply hiển thị hoặc mở modal | | | | |
| 26 | Job Detail - Phân quyền<br>・Nút Apply với role hr | ・Đăng nhập với role hr<br>・Truy cập `/jobs/[slug]` | Nút Apply bị disabled<br>・Hiển thị tooltip hoặc message: "HR không thể ứng tuyển"<br>・Không thể mở form apply | | | | Cần confirm nội dung message |
| 27 | Job Detail - Phân quyền<br>・Nút Apply với role admin | ・Đăng nhập với role admin<br>・Truy cập `/jobs/[slug]` | Nút Apply bị disabled<br>・Hiển thị message phù hợp cho admin<br>・Không thể submit form apply | | | | Cần confirm nội dung message |
| 28 | Job Detail - Phân quyền<br>・Nút Apply với role interviewer | ・Đăng nhập với role interviewer<br>・Truy cập `/jobs/[slug]` | Nút Apply bị disabled<br>・Hiển thị message "Bạn không thể ứng tuyển với vai trò này" | | | | |
| 29 | Form Apply - Validation<br>・CV file bắt buộc | ・Mở form apply<br>・Không chọn file CV<br>・Click Submit | Hiển thị lỗi validation:<br>・"CV là bắt buộc" hoặc "Vui lòng upload CV"<br>・Form không được submit<br>・Focus vào field CV | | | | |
| 30 | Form Apply - Validation<br>・CV file - kiểu file hợp lệ (PDF) | ・Chọn file `.pdf` đúng format<br>・File < 5MB | File được chấp nhận<br>・Hiển thị tên file đã chọn<br>・Không có thông báo lỗi | | | | |
| 31 | Form Apply - Validation<br>・CV file - kiểu file hợp lệ (DOC) | ・Chọn file `.doc`<br>・File < 5MB | File được chấp nhận<br>・Hiển thị tên file đã chọn | | | | |
| 32 | Form Apply - Validation<br>・CV file - kiểu file hợp lệ (DOCX) | ・Chọn file `.docx`<br>・File < 5MB | File được chấp nhận<br>・Hiển thị tên file đã chọn | | | | |
| 33 | Form Apply - Validation<br>・CV file - kiểu file không hợp lệ | ・Chọn file `.jpg` hoặc `.png` hoặc `.txt` | Hiển thị lỗi:<br>・"Chỉ chấp nhận file PDF, DOC, DOCX"<br>・File không được upload<br>・Form không submit | | | | |
| 34 | Form Apply - Validation<br>・CV file - vượt quá 5MB | ・Chọn file PDF có dung lượng > 5MB | Hiển thị lỗi:<br>・"File CV không được vượt quá 5MB"<br>・File không được upload<br>・Form không submit | | | | |
| 35 | Form Apply - Validation<br>・CV file - đúng 5MB (biên trên) | ・Chọn file PDF đúng 5MB | File được chấp nhận<br>・Không có lỗi<br>・Form có thể submit | | | | |
| 36 | Form Apply - Validation<br>・Cover letter - tùy chọn (để trống) | ・Để trống trường cover letter<br>・CV hợp lệ đã được chọn<br>・Click Submit | Form submit thành công<br>・Cover letter = null hoặc chuỗi rỗng<br>・Không có lỗi validation | | | | |
| 37 | Form Apply - Validation<br>・Cover letter - độ dài tối đa | ・Nhập cover letter đúng 2000 ký tự | Field chấp nhận 2000 ký tự<br>・Không hiển thị lỗi<br>・Counter hiển thị "2000/2000" | | | | Cần confirm UI có counter không |
| 38 | Form Apply - Validation<br>・Cover letter - vượt 2000 ký tự | ・Nhập cover letter 2001 ký tự | Hiển thị lỗi:<br>・"Cover letter không được vượt quá 2000 ký tự"<br>・Hoặc field tự cắt bớt tại 2000 ký tự<br>・Form không submit khi vượt | | | | |
| 39 | Form Apply - Submit<br>・Submit hợp lệ | ・Đăng nhập role candidate<br>・Chọn CV hợp lệ (PDF, <5MB)<br>・Cover letter tùy chọn<br>・Click Submit | API POST /api/jobs/[slug]/apply được gọi<br>・Response 200 với `{ success: true }`<br>・Toast thành công: "Ứng tuyển thành công!"<br>・Form đóng hoặc redirect<br>・Nút Apply chuyển thành "Đã ứng tuyển" (disabled) | | | | |
| 40 | Form Apply - Submit<br>・Đã ứng tuyển trước đó | ・Candidate đã apply job này trước đó<br>・Truy cập lại job detail | Nút Apply hiển thị "Đã ứng tuyển" (disabled)<br>・Hoặc thông báo "Bạn đã ứng tuyển vị trí này" | | | | Cần confirm theo tài liệu thiết kế |
| 41 | Form Apply - API lỗi<br>・API 401 Unauthorized | ・Session hết hạn<br>・Submit form apply | API trả 401<br>・Toast lỗi: "Phiên đăng nhập hết hạn"<br>・Redirect đến `/login` | | | | |
| 42 | Form Apply - API lỗi<br>・API 403 Forbidden | ・User không có quyền apply (role != candidate)<br>・Submit form | API trả 403<br>・Toast lỗi: "Bạn không có quyền thực hiện thao tác này"<br>・Form không submit | | | | |
| 43 | Form Apply - API lỗi<br>・API 404 Job not found | ・Job bị xóa trong lúc đang điền form<br>・Submit form | API trả 404<br>・Toast lỗi: "Vị trí tuyển dụng không còn tồn tại"<br>・Gợi ý quay lại danh sách jobs | | | | |
| 44 | Form Apply - API lỗi<br>・API 500 Server error | ・Mock API /api/jobs/[slug]/apply trả 500 | Toast lỗi: "Có lỗi xảy ra, vui lòng thử lại"<br>・Form không bị reset<br>・User có thể retry | | | | Cần mock API |
| 45 | Form Apply - API lỗi<br>・Network error | ・Tắt kết nối mạng<br>・Submit form apply | Toast lỗi: "Không thể kết nối đến máy chủ"<br>・Form không bị reset<br>・Button trở về trạng thái enabled | | | | |
| 46 | API Jobs List<br>・GET /api/jobs - thành công | ・Request GET /api/jobs<br>・DB có data | Response 200:<br>・`{ success: true, data: [...] }`<br>・Mảng chỉ chứa jobs có status=active<br>・Các field đầy đủ: id, title, location, type, slug, createdAt | | | | |
| 47 | API Jobs List<br>・GET /api/jobs - lỗi DB | ・Mock DB connection lỗi | Response 500:<br>・`{ success: false, error: "..." }`<br>・Không lộ thông tin stack trace | | | | Cần mock DB |
| 48 | API Job Detail<br>・GET /api/jobs/[slug] - thành công | ・Request GET /api/jobs/valid-slug | Response 200:<br>・`{ success: true, data: { ...jobDetail } }`<br>・Data đầy đủ: title, description, requirements, salary, location, type | | | | |
| 49 | API Job Detail<br>・GET /api/jobs/[slug] - không tìm thấy | ・Request GET /api/jobs/slug-khong-ton-tai | Response 404:<br>・`{ success: false, error: "Job not found" }` | | | | |
| 50 | Message / Toast<br>・Toast apply thành công | ・Submit form apply hợp lệ<br>・API trả 200 | Toast hiển thị:<br>・Màu xanh/thành công<br>・Nội dung: "Ứng tuyển thành công!"<br>・Tự động đóng sau 3-5 giây | | | | |
| 51 | Message / Toast<br>・Toast lỗi validation | ・Submit form với CV thiếu | Lỗi validation hiển thị inline dưới field<br>・Màu đỏ<br>・Nội dung rõ ràng | | | | |
| 52 | Message / Toast<br>・Toast lỗi API | ・API trả lỗi 500 | Toast hiển thị:<br>・Màu đỏ/cảnh báo<br>・Nội dung lỗi từ server<br>・Có nút đóng | | | | |
| 53 | Responsive<br>・Mobile view Jobs List | ・Truy cập `/jobs` trên mobile (375px) | Trang hiển thị đúng trên mobile:<br>・Filter không bị tràn<br>・Job card responsive<br>・Không có horizontal scroll không mong muốn | | | | |
| 54 | Responsive<br>・Mobile view Job Detail | ・Truy cập `/jobs/[slug]` trên mobile | Trang hiển thị đúng:<br>・Form apply responsive<br>・Nút Apply dễ thao tác<br>・Text không bị cắt | | | | |
| 55 | SEO / Meta<br>・Meta tags Job Detail | ・Truy cập `/jobs/[slug]` | Thẻ meta đúng:<br>・`<title>` chứa tên job<br>・`<meta name="description">` có nội dung<br>・OG tags (nếu có) | | | | Cần confirm theo tài liệu thiết kế |
| 56 | Navigation<br>・Breadcrumb Jobs | ・Truy cập `/jobs/[slug]` | Breadcrumb hiển thị:<br>・Trang chủ > Việc làm > [Tên job]<br>・Click "Việc làm" → về `/jobs` | | | | Cần confirm UI có breadcrumb không |
| 57 | Double submit<br>・Click Submit nhiều lần | ・Đang submit form apply<br>・Click Submit thêm lần nữa | Nút Submit bị disabled trong lúc đang loading<br>・Chỉ gọi API 1 lần<br>・Không tạo duplicate application | | | | |
| 58 | Form Apply - UX<br>・Upload CV preview | ・Chọn file CV hợp lệ | Hiển thị tên file đã chọn<br>・Có nút xóa/thay đổi file<br>・Có thể chọn file khác để thay thế | | | | |
| 59 | Jobs List - API lỗi<br>・GET /api/jobs trả 500 | ・Mock API /api/jobs trả 500 | Hiển thị thông báo lỗi thay vì danh sách:<br>・"Không thể tải danh sách việc làm"<br>・Có nút "Thử lại" | | | | Cần mock API |
| 60 | Jobs List - API lỗi<br>・Network timeout | ・Tắt mạng, truy cập `/jobs` | Hiển thị trạng thái lỗi kết nối<br>・"Không có kết nối mạng"<br>・Không hiển thị trang trắng | | | | |
