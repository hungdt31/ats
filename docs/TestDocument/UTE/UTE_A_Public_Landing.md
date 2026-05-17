# UTE - Unit Test Evidence
# Module A - Khu vực Công khai (Public & Landing)

| Thông tin | Nội dung |
|-----------|----------|
| **Tên hệ thống** | ATS - Applicant Tracking System |
| **ID chức năng** | A-01 đến A-03 |
| **Tên chức năng** | Public & Landing Page |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Người test lần 1** | |
| **Người test lần 2** | |
| **Người test lần 3** | |
| **Tổng số item test** | 50 |
| **Tổng số bug** | |

> **Quy ước kết quả:** ○: OK | ×: NG chưa giải quyết | ×→○: NG đã giải quyết | －: Không test

---

## A-01 · Trang chủ – Landing Page (`/`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 1 | Khởi tạo trang – guest chưa đăng nhập | Xóa cookie `session_token`, truy cập `/` | Trang load thành công (HTTP 200), hero section hiển thị, nút "Đăng nhập" và "Đăng ký" hiển thị trong header | | | | |
| 2 | Khởi tạo trang – đã đăng nhập (candidate) | Đăng nhập với role `candidate`, truy cập `/` | Trang load thành công, header hiển thị UserNav với avatar và tên người dùng, không hiển thị nút "Đăng nhập" | | | | |
| 3 | Khởi tạo trang – đã đăng nhập (admin/hr) | Đăng nhập với role `admin` hoặc `hr`, truy cập `/` | Trang load, UserNav hiển thị đúng role, không hiển thị nút "Nộp đơn" | | | | |
| 4 | Layout – Hero Section | Guest truy cập `/` | Hero section hiển thị: tiêu đề hệ thống ATS, mô tả ngắn, nút CTA "Xem việc làm" hoặc "Đăng ký ngay" | | | | |
| 5 | Layout – Featured Jobs | DB có ít nhất 1 job `status=active` | Danh sách featured jobs hiển thị tối đa 6 JobCard, sắp xếp theo ngày tạo mới nhất | | | | |
| 6 | Layout – Featured Jobs (không có dữ liệu) | DB không có job nào `status=active` | Hiển thị trạng thái empty state ("Chưa có việc làm nào") hoặc section ẩn đi | | | | |
| 7 | Layout – Navigation header | Truy cập `/` | Header chứa logo, menu điều hướng (Trang chủ, Việc làm), nút đăng nhập/đăng ký (khi chưa login) | | | | |
| 8 | Layout – Footer | Truy cập `/` | Footer hiển thị thông tin liên hệ, link điều khoản, bản quyền | | | | |
| 9 | CTA – Click "Xem việc làm" | Guest truy cập `/`, click nút CTA | Chuyển hướng đến `/jobs` | | | | |
| 10 | CTA – Click "Đăng ký ngay" | Guest truy cập `/`, click nút Đăng ký | Chuyển hướng đến `/(auth)/register` | | | | |
| 11 | UserNav – Avatar dropdown | Đã đăng nhập, click avatar | Dropdown hiển thị: tên người dùng, email, link đến profile/dashboard, nút "Đăng xuất" | | | | |
| 12 | UserNav – Đăng xuất | Đã đăng nhập, click "Đăng xuất" trong dropdown | Gọi POST `/api/auth/logout`, xóa cookie `session_token`, redirect về `/` | | | | |
| 13 | Featured Jobs – Click JobCard | Trang chủ có featured jobs, click 1 JobCard | Chuyển hướng đến `/jobs/[slug]` của job đó | | | | |
| 14 | Featured Jobs – Giới hạn 6 job | DB có hơn 6 job `status=active` | Chỉ hiển thị đúng 6 JobCard, không hiển thị nhiều hơn | | | | |
| 15 | Responsive – Mobile | Truy cập `/` trên viewport 375px | Layout chuyển sang mobile (hamburger menu, stack layout), không bị vỡ giao diện | | | | |
| 16 | SEO – Page title | Truy cập `/` | `<title>` tag chứa tên hệ thống ATS | | | | |
| 17 | Performance – Thời gian load | Truy cập `/` lần đầu | Trang tải xong trong vòng 3 giây (LCP < 2.5s) | | | | |

---

## A-02 · Danh sách tin tuyển dụng (`/jobs`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 18 | Khởi tạo – Guest truy cập | Xóa cookie, truy cập `/jobs` | Trang load HTTP 200, hiển thị danh sách tất cả job `status=active` | | | | |
| 19 | Khởi tạo – Không có job active | DB không có job `status=active` | Hiển thị empty state "Hiện chưa có tin tuyển dụng nào" | | | | |
| 20 | Layout – Danh sách JobCard | DB có nhiều job active | Mỗi JobCard hiển thị: tiêu đề job, địa điểm, loại hợp đồng, phòng ban, thời gian đăng | | | | |
| 21 | Layout – Bộ lọc (Filter bar) | Truy cập `/jobs` | Hiển thị thanh tìm kiếm và các dropdown lọc: Location, Employment Type, Department | | | | |
| 22 | Tìm kiếm – keyword khớp title | Nhập keyword trùng với title của 1 job, nhấn Enter | Chỉ hiển thị job có title chứa keyword đó | | | | |
| 23 | Tìm kiếm – keyword khớp description | Nhập keyword có trong description nhưng không có trong title | Hiển thị job có description chứa keyword | | | | |
| 24 | Tìm kiếm – keyword không khớp | Nhập keyword không tồn tại trong DB | Hiển thị empty state "Không tìm thấy kết quả" | | | | |
| 25 | Lọc – theo Location | Chọn 1 location trong dropdown | Chỉ hiển thị job có `location` trùng giá trị đã chọn | | | | |
| 26 | Lọc – theo Employment Type (full_time) | Chọn "Full-time" trong dropdown | Chỉ hiển thị job có `employment_type = full_time` | | | | |
| 27 | Lọc – theo Employment Type (part_time) | Chọn "Part-time" trong dropdown | Chỉ hiển thị job có `employment_type = part_time` | | | | |
| 28 | Lọc – theo Employment Type (contract) | Chọn "Contract" trong dropdown | Chỉ hiển thị job có `employment_type = contract` | | | | |
| 29 | Lọc – theo Department | Chọn 1 department trong dropdown | Chỉ hiển thị job thuộc department đó | | | | |
| 30 | Lọc – kết hợp nhiều tiêu chí | Nhập keyword + chọn location + employment_type | Hiển thị job thỏa đủ tất cả tiêu chí lọc | | | | |
| 31 | Lọc – xóa bộ lọc | Sau khi lọc, click "Xóa bộ lọc" hoặc clear input | Hiển thị lại toàn bộ job active | | | | |
| 32 | Phân trang – Next page | Có hơn 10 job, click "Next" | Hiển thị trang tiếp theo, URL cập nhật `?page=2` | | | | |
| 33 | Click JobCard – điều hướng | Click vào 1 JobCard trong danh sách | Chuyển hướng đến `/jobs/[slug]` đúng với job đó | | | | |
| 34 | API – GET /api/jobs thành công | Truy cập `/jobs` | API trả về array job, status 200 | | | | |
| 35 | API – GET /api/jobs lỗi server | Giả lập DB lỗi | Hiển thị thông báo lỗi "Đã có lỗi xảy ra, vui lòng thử lại" | | | | |

---

## A-03 · Chi tiết tin tuyển dụng (`/jobs/[slug]`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 36 | Khởi tạo – slug hợp lệ, job active | Truy cập `/jobs/[slug]` với slug tồn tại, status=active | Trang load HTTP 200, hiển thị đầy đủ chi tiết job | | | | |
| 37 | Khởi tạo – slug không tồn tại | Truy cập `/jobs/invalid-slug` | Trả về trang 404 hoặc redirect Not Found | | | | |
| 38 | Khởi tạo – job có status=draft/closed/archived | Truy cập slug của job status không phải `active` | Trả về 404 hoặc hiển thị "Tin tuyển dụng không còn tồn tại" | | | | |
| 39 | Layout – Thông tin chi tiết job | Truy cập job detail hợp lệ | Hiển thị: title, location, employment_type, department, salary_min/max, required_skills, description, requirements, benefits | | | | |
| 40 | Layout – Nút "Nộp đơn" (guest) | Guest truy cập job detail | Nút "Nộp đơn" hiển thị, khi click redirect về `/login` | | | | |
| 41 | Layout – Nút "Nộp đơn" (candidate đã login) | Candidate truy cập job detail, chưa nộp đơn job này | Nút "Nộp đơn ngay" active, có thể click để mở form | | | | |
| 42 | Layout – Nút "Đã nộp đơn" | Candidate đã nộp đơn vào job này trước đó | Nút chuyển thành "Đã nộp đơn" (disabled), không thể nộp thêm | | | | |
| 43 | Layout – HR/Admin xem job detail | Đăng nhập role HR, truy cập job detail | Xem được chi tiết job, không hiển thị form nộp đơn | | | | |
| 44 | Form nộp đơn – hiển thị | Candidate click "Nộp đơn ngay" | Form hiển thị: upload CV (required), cover letter (optional), source channel (dropdown) | | | | |
| 45 | Form nộp đơn – submit thiếu CV | Candidate submit form không chọn file CV | Hiển thị lỗi validation "Vui lòng tải lên CV của bạn" | | | | |
| 46 | Form nộp đơn – CV sai định dạng | Upload file không phải PDF/DOC/DOCX | Hiển thị lỗi "Định dạng file không được hỗ trợ" | | | | |
| 47 | Form nộp đơn – submit thành công | Candidate upload CV hợp lệ, click Submit | Gọi POST `/api/jobs/[slug]/apply`, trả về 201, hiển thị toast "Nộp đơn thành công!", nút đổi sang "Đã nộp đơn" | | | | |
| 48 | API – apply lỗi 409 (đã nộp) | Candidate gọi API apply lần 2 | Trả về 409 Conflict, toast "Bạn đã nộp đơn vào vị trí này trước đó" | | | | |
| 49 | API – apply lỗi 401 (chưa login) | Guest gọi POST `/api/jobs/[slug]/apply` trực tiếp | Trả về 401 Unauthorized | | | | |
| 50 | API – apply lỗi 403 (role không phải candidate) | HR gọi POST `/api/jobs/[slug]/apply` | Trả về 403 Forbidden | | | | |
