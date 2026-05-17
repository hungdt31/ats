# DETAIL DESIGN DOCUMENT
# Module A - Khu vực Công khai (Public & Landing)

## Mục lục

1. [Sheet 01 - Khái quát chức năng](#sheet-01)
2. [Sheet 02 - IPO](#sheet-02)
3. [Sheet 03 - IPO Chi tiết](#sheet-03)
4. [Sheet 04 - Chi tiết điều khiển](#sheet-04)
5. [Sheet 05 - Giao diện màn hình](#sheet-05)
6. [Sheet 06 - Thông báo](#sheet-06)
7. [Sheet 07 - API](#sheet-07)
8. [Sheet 08 - Request](#sheet-08)
9. [Sheet 09 - Response](#sheet-09)
10. [Sheet 10 - SQL](#sheet-10)
11. [Lịch sử thay đổi](#lich-su-thay-doi)

---

<a id="sheet-01"></a>
## Sheet 01 - Khái quát chức năng

### 1. Khái quát chức năng

| No | Chức năng | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Trang chủ (Landing Page) | Hiển thị hero section, giới thiệu hệ thống, danh sách job nổi bật | Route: `/` |
| 2 | Danh sách việc làm | Hiển thị tất cả job đang active, hỗ trợ lọc theo keyword, location, type, department | Route: `/jobs` |
| 3 | Chi tiết việc làm | Xem mô tả chi tiết một job, form nộp đơn ứng tuyển | Route: `/jobs/[slug]` |
| 4 | Nộp đơn ứng tuyển | Candidate upload CV, nhập cover letter và gửi đơn tới hệ thống | POST `/api/jobs/[slug]/apply` |

### 2. Danh sách table sử dụng

| No | Table | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | `jobs` | - | [x] | - | - | Đọc danh sách và chi tiết job active |
| 2 | `applications` | [x] | [x] | - | - | Tạo đơn khi candidate nộp, kiểm tra trùng |
| 3 | `users` | - | [x] | - | - | Đọc session khi đã đăng nhập để hiển thị UserNav |
| 4 | `job_channels` | - | [x] | - | - | Đọc kênh đăng tin cho job detail |

### 3. Đối tượng / Bộ phận sử dụng

| Vai trò | Mô tả | Quyền |
|---|---|---|
| Guest (chưa đăng nhập) | Người truy cập chưa có tài khoản | Xem Landing, xem danh sách job, xem chi tiết job; KHÔNG thể nộp đơn |
| Candidate | Ứng viên đã đăng nhập | Xem Landing, danh sách job, chi tiết job, **nộp đơn ứng tuyển** |
| HR / Admin / Interviewer | Nhân viên nội bộ đã đăng nhập | Chỉ xem, không nộp đơn |

---

<a id="sheet-02"></a>
## Sheet 02 - IPO

### 1. Danh sách nhóm chức năng

| No | Nhóm chức năng | Mô tả |
|---:|---|---|
| A | Hiển thị trang chủ | Tải và hiển thị hero, featured jobs từ DB |
| B | Danh sách việc làm | Tìm kiếm, lọc, phân trang danh sách job |
| C | Chi tiết việc làm | Tải chi tiết job theo slug |
| D | Nộp đơn ứng tuyển | Validate, upload CV, tạo application record |

### 2. Nhóm A - Hiển thị trang chủ

#### Chức năng cấu thành

| No | Chức năng | Mô tả |
|---:|---|---|
| A-1 | Hiển thị hero section | Banner giới thiệu hệ thống với CTA đăng nhập/đăng ký |
| A-2 | Hiển thị featured jobs | Lấy tối đa 6 job active, sắp xếp theo ngày tạo mới nhất |
| A-3 | UserNav | Khi đã đăng nhập: hiển thị avatar, tên, dropdown logout |

#### IPO

| | Input | Process | Output |
|---|---|---|---|
| A-1 | Trạng thái đăng nhập (cookie JWT) | Đọc session từ cookie; xác định guest/user | Hero section + nút CTA phù hợp |
| A-2 | Không có tham số | Query DB: `jobs WHERE status='active' ORDER BY created_at DESC LIMIT 6` | Danh sách ≤6 JobCard |
| A-3 | JWT cookie | Verify token, lấy `fullName`, `role`, `avatar_url` | Avatar dropdown menu |

### 3. Nhóm B - Danh sách việc làm

#### Chức năng cấu thành

| No | Chức năng | Mô tả |
|---:|---|---|
| B-1 | Hiển thị danh sách job | Render danh sách JobCard từ API |
| B-2 | Tìm kiếm theo keyword | Lọc theo `title` hoặc `description` |
| B-3 | Lọc theo location | Dropdown chọn địa điểm |
| B-4 | Lọc theo employment_type | Dropdown: full_time / part_time / contract |
| B-5 | Lọc theo department | Dropdown chọn phòng ban |

#### IPO

| | Input | Process | Output |
|---|---|---|---|
| B-1 | URL query params (keyword, location, type, department) | Gọi `GET /api/jobs?...` → React Query cache | Danh sách JobCard |
| B-2 | keyword string | API filter: `title LIKE %keyword% OR description LIKE %keyword%` | Danh sách job khớp |
| B-3 | location string | API filter: `location = ?` | Danh sách job theo địa điểm |
| B-4 | employment_type enum | API filter: `employment_type = ?` | Danh sách job theo loại hợp đồng |
| B-5 | department string | API filter: `department = ?` | Danh sách job theo phòng ban |

### 4. Nhóm C - Chi tiết việc làm

#### Chức năng cấu thành

| No | Chức năng | Mô tả |
|---:|---|---|
| C-1 | Tải chi tiết job | Lấy đầy đủ thông tin job theo slug |
| C-2 | Hiển thị job channels | Các kênh đăng tuyển bên ngoài (LinkedIn, ITviec…) |
| C-3 | Kiểm tra đã nộp đơn | Nếu candidate đã nộp: hiển thị badge trạng thái, ẩn form |

#### IPO

| | Input | Process | Output |
|---|---|---|---|
| C-1 | slug (path param) | `GET /api/jobs/[slug]` → Prisma query by slug | Chi tiết job object |
| C-2 | job_id | Join `job_channels` WHERE `job_id = ?` AND `status = 'posted'` | Danh sách external links |
| C-3 | candidate_id + job_id | `SELECT id FROM applications WHERE job_id=? AND candidate_id=?` | Boolean: hasApplied |

### 5. Nhóm D - Nộp đơn ứng tuyển

#### Chức năng cấu thành

| No | Chức năng | Mô tả |
|---:|---|---|
| D-1 | Form nộp đơn | Nhập cover letter, upload file CV |
| D-2 | Upload CV lên Appwrite | Lưu file storage, lấy URL |
| D-3 | Tạo application record | Insert vào `applications` |
| D-4 | Kiểm tra trùng đơn | Không cho nộp 2 lần cùng job |

#### IPO

| | Input | Process | Output |
|---|---|---|---|
| D-1 | cover_letter (text), cv_file (File) | Validate: file ≤5MB, type PDF/DOC/DOCX | Form đã điền |
| D-2 | File object | Upload to Appwrite Storage → nhận `appwrite_file_id` + URL | cv_file_url, cv_filename |
| D-3 | job_id, candidate_id, cv_file_url, cover_letter | `INSERT INTO applications` + `INSERT INTO files` | application object |
| D-4 | job_id + candidate_id | `SELECT COUNT(*) FROM applications WHERE ...` | Lỗi MSG-A-004 nếu đã tồn tại |

---

<a id="sheet-03"></a>
## Sheet 03 - IPO Chi tiết

### 1. GET /api/jobs - Danh sách job

#### Thông tin xử lý

| Field | Nội dung |
|---|---|
| Tên API | Lấy danh sách việc làm |
| Method | GET |
| Endpoint | `/api/jobs` |
| Auth | Public (không cần đăng nhập) |
| Mô tả | Trả về danh sách job có `status = active`, hỗ trợ lọc đa tiêu chí |

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Init | Parse query params: keyword, location, type, department | Default: tất cả, không filter |
| 2 | Validate | Kiểm tra `type` nếu có phải thuộc enum `jobs_employment_type` | Trả 400 nếu sai |
| 3 | Search | Build WHERE clause động theo params → query Prisma | `status = 'active'` luôn được áp dụng |
| 4 | Sort | `ORDER BY created_at DESC` | Mới nhất trước |
| 5 | Output | Serialize và trả `{ success: true, data: jobs[] }` | Loại bỏ trường nhạy cảm |

### 2. GET /api/jobs/[slug] - Chi tiết job

#### Thông tin xử lý

| Field | Nội dung |
|---|---|
| Tên API | Lấy chi tiết việc làm |
| Method | GET |
| Endpoint | `/api/jobs/[slug]` |
| Auth | Public |
| Mô tả | Trả về toàn bộ thông tin job theo slug, kèm job_channels |

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Init | Lấy `slug` từ path params | |
| 2 | Validate | Kiểm tra `slug` không rỗng | Trả 400 nếu rỗng |
| 3 | Search | `findUnique({ where: { slug } })` include `job_channels` | |
| 4 | Kiểm tra tồn tại | Nếu không tìm thấy → trả 404 | MSG-A-002 |
| 5 | Kiểm tra status | Nếu `status != active` → trả 404 (ẩn job không active) | |
| 6 | Output | Trả `{ success: true, data: job }` | |

### 3. POST /api/jobs/[slug]/apply - Nộp đơn

#### Thông tin xử lý

| Field | Nội dung |
|---|---|
| Tên API | Nộp đơn ứng tuyển |
| Method | POST |
| Endpoint | `/api/jobs/[slug]/apply` |
| Auth | Bắt buộc đăng nhập, role = candidate |
| Mô tả | Tạo đơn ứng tuyển mới cho job theo slug |

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Auth check | Verify JWT cookie → lấy `userId`, `role` | Trả 401 nếu chưa đăng nhập |
| 2 | Role check | `role === 'candidate'` | Trả 403 nếu không phải candidate |
| 3 | Init | Lấy slug từ path, parse FormData: `cv_file`, `cover_letter` | |
| 4 | Validate job | `findUnique({ where: { slug, status: 'active' } })` | Trả 404 nếu không có |
| 5 | Check duplicate | `findFirst({ where: { job_id, candidate_id } })` | Trả 409 + MSG-A-004 |
| 6 | Upload file | Upload CV lên Appwrite Storage | Trả 500 nếu upload lỗi |
| 7 | Save file record | `INSERT INTO files` | |
| 8 | Create application | `INSERT INTO applications` với `status = 'applied'`, `source_channel = 'website'` | Transaction với bước 7 |
| 9 | Output | Trả `{ success: true, data: application }` + MSG-A-001 | |

---

<a id="sheet-04"></a>
## Sheet 04 - Chi tiết điều khiển

### 1. Danh sách controls - Trang chủ `/`

| No | Control ID | Tên | Loại | Màn hình | Mô tả |
|---:|---|---|---|---|---|
| 1 | CTR-A-001 | Hero Title | Text/Heading | Landing | Tiêu đề chính trang chủ |
| 2 | CTR-A-002 | Hero CTA - Đăng nhập | Button | Landing | Điều hướng đến `/login` (hiển thị khi chưa đăng nhập) |
| 3 | CTR-A-003 | Hero CTA - Đăng ký | Button | Landing | Điều hướng đến `/register` (hiển thị khi chưa đăng nhập) |
| 4 | CTR-A-004 | Hero CTA - Xem việc làm | Button | Landing | Điều hướng đến `/jobs` (hiển thị khi đã đăng nhập) |
| 5 | CTR-A-005 | Featured Jobs Section | Section | Landing | Hiển thị lưới tối đa 6 JobCard |
| 6 | CTR-A-006 | JobCard | Card | Landing / Jobs | Card hiển thị: title, location, type, salary range, deadline |
| 7 | CTR-A-007 | Nút "Xem tất cả việc làm" | Button | Landing | Điều hướng đến `/jobs` |
| 8 | CTR-A-008 | UserNav Avatar | Button/Dropdown | Header | Hiển thị avatar + menu khi đã đăng nhập |
| 9 | CTR-A-009 | UserNav Dropdown | DropdownMenu | Header | Gồm: Tên user, role, link Profile, Logout |

### 2. Danh sách controls - Trang danh sách `/jobs`

| No | Control ID | Tên | Loại | Màn hình | Mô tả |
|---:|---|---|---|---|---|
| 10 | CTR-A-010 | Search Input | Input[text] | Jobs List | Tìm kiếm theo keyword |
| 11 | CTR-A-011 | Location Filter | Select/Dropdown | Jobs List | Lọc theo địa điểm |
| 12 | CTR-A-012 | Employment Type Filter | Select/Dropdown | Jobs List | Lọc theo loại: Full-time / Part-time / Contract |
| 13 | CTR-A-013 | Department Filter | Select/Dropdown | Jobs List | Lọc theo phòng ban |
| 14 | CTR-A-014 | Reset Filter Button | Button | Jobs List | Xóa tất cả bộ lọc |
| 15 | CTR-A-015 | Jobs Grid | Grid/List | Jobs List | Hiển thị danh sách JobCard (CTR-A-006) |
| 16 | CTR-A-016 | Empty State | Section | Jobs List | Hiển thị khi không có job nào khớp bộ lọc |
| 17 | CTR-A-017 | Loading Skeleton | Skeleton | Jobs List | Hiển thị khi đang fetch API |

### 3. Danh sách controls - Trang chi tiết `/jobs/[slug]`

| No | Control ID | Tên | Loại | Màn hình | Mô tả |
|---:|---|---|---|---|---|
| 18 | CTR-A-018 | Job Title Heading | Heading | Job Detail | Tiêu đề job |
| 19 | CTR-A-019 | Job Meta | Info Section | Job Detail | location, department, type, salary range, deadline |
| 20 | CTR-A-020 | Job Description | Rich Text | Job Detail | Nội dung mô tả công việc (HTML hoặc Markdown) |
| 21 | CTR-A-021 | Job Requirements | Rich Text | Job Detail | Yêu cầu ứng viên |
| 22 | CTR-A-022 | Job Benefits | Rich Text | Job Detail | Quyền lợi |
| 23 | CTR-A-023 | Required Skills Tags | Tag List | Job Detail | Danh sách skill yêu cầu |
| 24 | CTR-A-024 | Job Channels Links | Link List | Job Detail | Các kênh đăng tuyển ngoài (nếu có) |
| 25 | CTR-A-025 | Apply Now Button | Button | Job Detail | Mở modal apply (ẩn nếu đã nộp hoặc chưa đăng nhập) |
| 26 | CTR-A-026 | Applied Badge | Badge | Job Detail | Hiển thị nếu candidate đã nộp đơn |
| 27 | CTR-A-027 | Login to Apply Button | Button | Job Detail | Điều hướng `/login` khi chưa đăng nhập |
| 28 | CTR-A-028 | Apply Modal | Modal/Dialog | Job Detail | Chứa form nộp đơn |
| 29 | CTR-A-029 | Cover Letter Input | Textarea | Apply Modal | Nhập thư xin việc (tùy chọn) |
| 30 | CTR-A-030 | CV File Upload | Input[file] | Apply Modal | Upload file CV (.pdf, .doc, .docx), tối đa 5MB |
| 31 | CTR-A-031 | Submit Apply Button | Button[submit] | Apply Modal | Gửi đơn ứng tuyển |
| 32 | CTR-A-032 | Cancel Apply Button | Button | Apply Modal | Đóng modal |

---

<a id="sheet-05"></a>
## Sheet 05 - Giao diện màn hình

### 1. Danh sách màn hình

| No | Tên màn hình | Route | Loại | Khái quát | Trạng thái |
|---:|---|---|---|---|---|
| 1 | Trang chủ | `/` | Landing/Danh sách | Hero + Featured Jobs | [x] |
| 2 | Danh sách việc làm | `/jobs` | Danh sách | Tìm kiếm, lọc, duyệt job | [x] |
| 3 | Chi tiết việc làm | `/jobs/[slug]` | Chi tiết + Form | Xem chi tiết + Nộp đơn | [x] |
| 4 | Modal nộp đơn | `/jobs/[slug]` (modal) | Modal/Form | Form upload CV, cover letter | [x] |

---

### 2. Màn hình 1 - Trang chủ `/`

| Field | Nội dung |
|---|---|
| Route / URL | `/` |
| Tên màn hình | Landing Page - Trang chủ |
| Loại màn hình | Landing |
| Khái quát chức năng | Giới thiệu hệ thống ATS, hiển thị featured jobs, điều hướng đăng nhập/đăng ký |
| Tác vụ liên quan | Xem featured jobs, click vào job card, click CTA đăng nhập/đăng ký, xem tất cả việc làm |
| Điều kiện hiển thị | Luôn hiển thị (public); CTA thay đổi theo trạng thái đăng nhập |
| Điều kiện không có dữ liệu | Featured jobs rỗng → hiển thị "Chưa có việc làm nổi bật" |
| Điều hướng từ màn hình này | `/jobs`, `/login`, `/register`, `/jobs/[slug]` |
| Điều hướng đến màn hình này | Direct URL, redirect sau logout |
| Liên kết control | CTR-A-001 đến CTR-A-009 |
| Liên kết API | API No.1 (GET /api/jobs?limit=6) |
| Liên kết Request | Sheet Request, API No.1 |
| Liên kết Response | Sheet Response, API No.1 |
| Liên kết Message | MSG-A-003 (lỗi tải dữ liệu) |
| Ghi chú | Server Component; fetch featured jobs server-side để SEO |

### 3. Rule hiển thị màn hình 1

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Guest chưa đăng nhập | `session = null` | CTA "Đăng nhập" + "Đăng ký" | CTR-A-002, CTR-A-003 |
| 2 | Đã đăng nhập | `session != null` | UserNav + CTA "Xem việc làm" | CTR-A-004, CTR-A-008 |
| 3 | Có featured jobs | `jobs.length > 0` | Hiển thị lưới JobCard | CTR-A-005, CTR-A-006 |
| 4 | Không có featured jobs | `jobs.length = 0` | Section "Chưa có việc làm nổi bật" | CTR-A-016 |
| 5 | Đang tải | Loading state | Skeleton placeholder | CTR-A-017 |

### 4. Rule validation màn hình 1

Không có form validation (trang chỉ hiển thị).

---

### 5. Màn hình 2 - Danh sách việc làm `/jobs`

| Field | Nội dung |
|---|---|
| Route / URL | `/jobs` |
| Tên màn hình | Danh sách việc làm |
| Loại màn hình | Danh sách |
| Khái quát chức năng | Hiển thị toàn bộ job active, hỗ trợ tìm kiếm và lọc theo nhiều tiêu chí |
| Tác vụ liên quan | Tìm kiếm, lọc, click vào job card để xem chi tiết |
| Điều kiện hiển thị | Public; mọi user đều có thể truy cập |
| Điều kiện không có dữ liệu | Không có job nào khớp → Empty State (CTR-A-016) |
| Điều hướng từ màn hình này | `/jobs/[slug]` |
| Điều hướng đến màn hình này | Từ Landing, từ Header nav |
| Liên kết control | CTR-A-010 đến CTR-A-017 |
| Liên kết API | API No.1 (GET /api/jobs) |
| Liên kết Request | Sheet Request, API No.1 |
| Liên kết Response | Sheet Response, API No.1 |
| Liên kết Message | MSG-A-003 |
| Ghi chú | Client Component dùng React Query; filter cập nhật URL query string |

### 6. Rule hiển thị màn hình 2

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Có job | `jobs.length > 0` | Danh sách JobCard | CTR-A-015 |
| 2 | Không có job | `jobs.length = 0` | Empty State | CTR-A-016 |
| 3 | Đang tải | `isLoading = true` | Skeleton 6 cards | CTR-A-017 |
| 4 | Lỗi API | `isError = true` | Toast lỗi + retry button | MSG-A-003 |
| 5 | Có filter active | Bất kỳ filter nào được chọn | Badge "Đang lọc" + Nút Reset | CTR-A-014 |

### 7. Rule validation màn hình 2

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Keyword | Tối đa 200 ký tự | MSG-A-005 | Hiển thị lỗi dưới input, không submit |
| 2 | Employment Type | Phải thuộc: full_time / part_time / contract | - | Dropdown chỉ cho chọn giá trị hợp lệ |

---

### 8. Màn hình 3 - Chi tiết việc làm `/jobs/[slug]`

| Field | Nội dung |
|---|---|
| Route / URL | `/jobs/[slug]` |
| Tên màn hình | Chi tiết việc làm |
| Loại màn hình | Chi tiết |
| Khái quát chức năng | Hiển thị đầy đủ thông tin job; candidate có thể nộp đơn |
| Tác vụ liên quan | Xem mô tả, click "Ứng tuyển ngay", xem kênh đăng tuyển ngoài |
| Điều kiện hiển thị | Job phải tồn tại và `status = active` |
| Điều kiện không có dữ liệu | Job không tồn tại / không active → redirect 404 |
| Điều hướng từ màn hình này | Mở Modal Apply, `/login`, `/jobs` |
| Điều hướng đến màn hình này | Từ `/jobs`, từ Landing JobCard |
| Liên kết control | CTR-A-018 đến CTR-A-027 |
| Liên kết API | API No.2 (GET /api/jobs/[slug]) |
| Liên kết Request | Sheet Request, API No.2 |
| Liên kết Response | Sheet Response, API No.2 |
| Liên kết Message | MSG-A-002 (không tìm thấy) |
| Ghi chú | Client Component; kiểm tra hasApplied sau khi load job |

### 9. Rule hiển thị màn hình 3

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Guest xem | `session = null` | Nút "Đăng nhập để ứng tuyển" (CTR-A-027) | |
| 2 | Candidate chưa nộp | `session.role = candidate AND hasApplied = false` | Nút "Ứng tuyển ngay" (CTR-A-025) | |
| 3 | Candidate đã nộp | `hasApplied = true` | Badge "Đã ứng tuyển" (CTR-A-026), ẩn nút Apply | |
| 4 | HR/Admin xem | `role != candidate` | Chỉ xem, không có nút Apply | |
| 5 | Job hết hạn | `expires_at < now` | Badge "Hết hạn", ẩn nút Apply | |

### 10. Màn hình 4 - Modal nộp đơn

| Field | Nội dung |
|---|---|
| Route / URL | `/jobs/[slug]` (modal overlay) |
| Tên màn hình | Form nộp đơn ứng tuyển |
| Loại màn hình | Modal/Form |
| Khái quát chức năng | Form upload CV và nhập cover letter để nộp đơn ứng tuyển |
| Tác vụ liên quan | Upload file CV, nhập cover letter, submit form |
| Điều kiện hiển thị | Candidate đã đăng nhập, job active, chưa nộp đơn |
| Điều kiện không có dữ liệu | - |
| Điều hướng từ màn hình này | Đóng modal (CTR-A-032); sau submit thành công: cập nhật UI |
| Điều hướng đến màn hình này | Click "Ứng tuyển ngay" (CTR-A-025) |
| Liên kết control | CTR-A-028 đến CTR-A-032 |
| Liên kết API | API No.3 (POST /api/jobs/[slug]/apply) |
| Liên kết Request | Sheet Request, API No.3 |
| Liên kết Response | Sheet Response, API No.3 |
| Liên kết Message | MSG-A-001, MSG-A-004, MSG-A-006, MSG-A-007 |
| Ghi chú | Sử dụng React Hook Form + Zod validation; upload file async |

### 11. Rule validation màn hình 4 (Modal)

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | CV File | Bắt buộc | MSG-A-006 | Hiển thị lỗi, disable Submit |
| 2 | CV File - loại | Chỉ chấp nhận .pdf, .doc, .docx | MSG-A-006 | Hiển thị lỗi dưới field |
| 3 | CV File - kích thước | Tối đa 5MB | MSG-A-007 | Hiển thị lỗi dưới field |
| 4 | Cover Letter | Tùy chọn; tối đa 2000 ký tự | - | Hiển thị đếm ký tự |
| 5 | Duplicate apply | Đã nộp đơn trước đó | MSG-A-004 | Toast error, đóng modal |

---

<a id="sheet-06"></a>
## Sheet 06 - Thông báo

### Danh sách thông báo

| MessageCD | Loại | Nội dung | Khi nào hiển thị |
|---|---|---|---|
| MSG-A-001 | Success | "Nộp đơn thành công! Chúng tôi sẽ liên hệ với bạn sớm." | Sau khi POST /apply thành công |
| MSG-A-002 | Error | "Không tìm thấy việc làm này hoặc việc làm đã đóng." | Job không tồn tại / không active |
| MSG-A-003 | System Error | "Không thể tải danh sách việc làm. Vui lòng thử lại." | Lỗi khi gọi GET /api/jobs |
| MSG-A-004 | Warning | "Bạn đã nộp đơn cho vị trí này trước đó." | Trùng application (409) |
| MSG-A-005 | Validation | "Từ khóa tìm kiếm không được vượt quá 200 ký tự." | Keyword quá dài |
| MSG-A-006 | Validation | "Vui lòng tải lên file CV định dạng PDF, DOC hoặc DOCX." | File không đúng định dạng / thiếu file |
| MSG-A-007 | Validation | "File CV không được vượt quá 5MB." | File quá lớn |
| MSG-A-008 | Error | "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." | 401 khi submit apply |
| MSG-A-009 | Error | "Đã có lỗi xảy ra khi tải file. Vui lòng thử lại." | Upload Appwrite thất bại |
| MSG-A-010 | Empty Data | "Không có việc làm nào phù hợp với tiêu chí tìm kiếm." | Danh sách jobs rỗng sau filter |

---

<a id="sheet-07"></a>
## Sheet 07 - API

### 1. Danh sách API

| API No | Tên API | Method | Endpoint | Auth | Ghi chú |
|---:|---|---|---|---|---|
| 1 | Lấy danh sách việc làm | GET | `/api/jobs` | Public | Hỗ trợ filter |
| 2 | Lấy chi tiết việc làm | GET | `/api/jobs/[slug]` | Public | Trả về job + channels |
| 3 | Nộp đơn ứng tuyển | POST | `/api/jobs/[slug]/apply` | Cookie (candidate) | FormData |

---

### 2. API No.1 - GET /api/jobs

| Field | Nội dung |
|---|---|
| Tên API | Lấy danh sách việc làm |
| Method | GET |
| Endpoint | `/api/jobs` |
| Auth | Public |
| Mô tả | Trả về danh sách job có `status = active`. Hỗ trợ lọc theo keyword, location, type, department |

#### Biến trả về

| Field | Kiểu | Mô tả |
|---|---|---|
| `success` | Boolean | `true` khi thành công |
| `data` | Array | Danh sách job object |
| `data[].id` | String (UUID) | ID job |
| `data[].title` | String | Tên vị trí |
| `data[].slug` | String | Slug URL |
| `data[].location` | String | Địa điểm |
| `data[].department` | String | Phòng ban |
| `data[].employment_type` | Enum | full_time / part_time / contract |
| `data[].salary_min` | Int? | Lương tối thiểu |
| `data[].salary_max` | Int? | Lương tối đa |
| `data[].required_skills` | JSON | Danh sách kỹ năng yêu cầu |
| `data[].expires_at` | DateTime? | Ngày hết hạn |
| `data[].created_at` | DateTime | Ngày tạo |

#### Validation

| Tham số | Kiểu | Bắt buộc | Rule |
|---|---|---|---|
| `keyword` | String | Không | Tối đa 200 ký tự |
| `location` | String | Không | - |
| `type` | Enum | Không | full_time / part_time / contract |
| `department` | String | Không | - |

#### Xử lý thất bại

| Mã lỗi | HTTP Status | Mô tả |
|---|---|---|
| INVALID_FILTER | 400 | `type` không thuộc enum hợp lệ |
| SERVER_ERROR | 500 | Lỗi DB |

#### Xử lý thành công

- HTTP 200 + `{ success: true, data: Job[] }`

---

### 3. API No.2 - GET /api/jobs/[slug]

| Field | Nội dung |
|---|---|
| Tên API | Lấy chi tiết việc làm |
| Method | GET |
| Endpoint | `/api/jobs/[slug]` |
| Auth | Public |
| Mô tả | Trả về đầy đủ thông tin job theo slug, kèm danh sách job_channels |

#### Biến trả về

| Field | Kiểu | Mô tả |
|---|---|---|
| `success` | Boolean | `true` khi thành công |
| `data` | Object | Chi tiết job |
| `data.id` | String | ID job |
| `data.title` | String | Tiêu đề |
| `data.slug` | String | Slug |
| `data.description` | String | Mô tả công việc |
| `data.requirements` | String | Yêu cầu ứng viên |
| `data.benefits` | String | Quyền lợi |
| `data.location` | String | Địa điểm |
| `data.department` | String | Phòng ban |
| `data.salary_min` | Int? | Lương tối thiểu |
| `data.salary_max` | Int? | Lương tối đa |
| `data.employment_type` | Enum | Loại hợp đồng |
| `data.required_skills` | JSON | Skills yêu cầu |
| `data.headcount` | Int | Số lượng tuyển |
| `data.expires_at` | DateTime? | Ngày hết hạn |
| `data.job_channels` | Array | Danh sách kênh đăng tuyển |
| `data.job_channels[].channel` | String | Tên kênh |
| `data.job_channels[].external_url` | String? | URL bên ngoài |
| `data.job_channels[].status` | String | posted/expired |

#### Xử lý thất bại

| Mã lỗi | HTTP Status | Mô tả |
|---|---|---|
| NOT_FOUND | 404 | Job không tồn tại hoặc không active |
| SERVER_ERROR | 500 | Lỗi DB |

---

### 4. API No.3 - POST /api/jobs/[slug]/apply

| Field | Nội dung |
|---|---|
| Tên API | Nộp đơn ứng tuyển |
| Method | POST |
| Endpoint | `/api/jobs/[slug]/apply` |
| Auth | httpOnly Cookie JWT (role = candidate) |
| Content-Type | multipart/form-data |
| Mô tả | Tạo application mới, upload CV lên Appwrite Storage |

#### Tham số

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `cv_file` | File | [x] | File CV, .pdf/.doc/.docx, tối đa 5MB |
| `cover_letter` | String | - | Thư giới thiệu (tối đa 2000 ký tự) |

#### Biến trả về

| Field | Kiểu | Mô tả |
|---|---|---|
| `success` | Boolean | `true` khi thành công |
| `data.id` | String | ID application mới tạo |
| `data.status` | String | `applied` |
| `data.applied_at` | DateTime | Thời gian nộp |

#### Xử lý thất bại

| Mã lỗi | HTTP Status | Mô tả |
|---|---|---|
| UNAUTHORIZED | 401 | Chưa đăng nhập |
| FORBIDDEN | 403 | Không phải role candidate |
| NOT_FOUND | 404 | Job không tồn tại / không active |
| DUPLICATE_APPLICATION | 409 | Đã nộp đơn trước đó |
| UPLOAD_FAILED | 500 | Lỗi upload Appwrite |
| SERVER_ERROR | 500 | Lỗi DB |

---

<a id="sheet-08"></a>
## Sheet 08 - Request

### API No.1 - GET /api/jobs

#### Header

| Header | Giá trị | Ghi chú |
|---|---|---|
| `Content-Type` | `application/json` | - |

#### Query Params

| Param | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|---|
| `keyword` | String | Không | Từ khóa tìm kiếm | `keyword=frontend` |
| `location` | String | Không | Địa điểm | `location=Hà Nội` |
| `type` | String | Không | Loại hợp đồng | `type=full_time` |
| `department` | String | Không | Phòng ban | `department=Engineering` |

#### Ví dụ Request

```
GET /api/jobs?keyword=frontend&location=Hà Nội&type=full_time
```

---

### API No.2 - GET /api/jobs/[slug]

#### Header

| Header | Giá trị | Ghi chú |
|---|---|---|
| `Content-Type` | `application/json` | - |

#### Path Params

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `slug` | String | [x] | Slug định danh job |

#### Ví dụ Request

```
GET /api/jobs/frontend-developer-2026
```

---

### API No.3 - POST /api/jobs/[slug]/apply

#### Header

| Header | Giá trị | Ghi chú |
|---|---|---|
| `Cookie` | `session=<JWT>` | Tự động kèm theo trình duyệt |
| `Content-Type` | `multipart/form-data` | FormData |

#### Path Params

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `slug` | String | [x] | Slug job |

#### Body (FormData)

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `cv_file` | File | [x] | File CV (.pdf/.doc/.docx, ≤5MB) |
| `cover_letter` | String | - | Thư xin việc |

#### Ví dụ Request

```
POST /api/jobs/frontend-developer-2026
Content-Type: multipart/form-data

cv_file: [binary file data]
cover_letter: "Tôi rất quan tâm đến vị trí này..."
```

---

<a id="sheet-09"></a>
## Sheet 09 - Response

### API No.1 - GET /api/jobs

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234abcd",
      "title": "Frontend Developer",
      "slug": "frontend-developer-2026",
      "location": "Hà Nội",
      "department": "Engineering",
      "employment_type": "full_time",
      "salary_min": 20000000,
      "salary_max": 35000000,
      "required_skills": ["React", "TypeScript", "Tailwind CSS"],
      "expires_at": "2026-07-01T00:00:00.000Z",
      "created_at": "2026-05-01T08:00:00.000Z"
    }
  ]
}
```

#### Error Response (400)

```json
{
  "success": false,
  "error": "Loại hợp đồng không hợp lệ."
}
```

---

### API No.2 - GET /api/jobs/[slug]

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "clx1234abcd",
    "title": "Frontend Developer",
    "slug": "frontend-developer-2026",
    "description": "<p>Mô tả công việc...</p>",
    "requirements": "<p>Yêu cầu...</p>",
    "benefits": "<p>Quyền lợi...</p>",
    "location": "Hà Nội",
    "department": "Engineering",
    "employment_type": "full_time",
    "salary_min": 20000000,
    "salary_max": 35000000,
    "required_skills": ["React", "TypeScript"],
    "headcount": 2,
    "status": "active",
    "expires_at": "2026-07-01T00:00:00.000Z",
    "created_at": "2026-05-01T08:00:00.000Z",
    "job_channels": [
      {
        "id": "ch001",
        "channel": "LinkedIn",
        "external_url": "https://linkedin.com/jobs/xxx",
        "status": "posted",
        "posted_at": "2026-05-02T00:00:00.000Z"
      }
    ]
  }
}
```

#### Error Response (404)

```json
{
  "success": false,
  "error": "Không tìm thấy việc làm này hoặc việc làm đã đóng."
}
```

---

### API No.3 - POST /api/jobs/[slug]/apply

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": "app001xyz",
    "job_id": "clx1234abcd",
    "candidate_id": "user001",
    "status": "applied",
    "source_channel": "website",
    "applied_at": "2026-05-17T06:25:00.000Z"
  }
}
```

#### Error Response - Trùng đơn (409)

```json
{
  "success": false,
  "error": "Bạn đã nộp đơn cho vị trí này trước đó."
}
```

#### Error Response - Chưa đăng nhập (401)

```json
{
  "success": false,
  "error": "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
}
```

---

<a id="sheet-10"></a>
## Sheet 10 - SQL

### 1. Danh sách SQL

| SQL No | Tên SQL / Mục đích | Loại | API sử dụng | Ghi chú |
|---:|---|---|---|---|
| 1 | Lấy danh sách job active có filter | SELECT | API No.1 | Dynamic WHERE |
| 2 | Lấy chi tiết job theo slug | SELECT | API No.2 | JOIN job_channels |
| 3 | Kiểm tra trùng đơn ứng tuyển | SELECT | API No.3 | Trước khi insert |
| 4 | Tạo application mới | INSERT | API No.3 | Transaction |
| 5 | Lưu file record | INSERT | API No.3 | Transaction cùng SQL No.4 |

---

### 2. SQL No.1 - Lấy danh sách job active có filter

#### 2.1. Mục đích

Truy vấn danh sách job có `status = active`, hỗ trợ lọc động theo keyword, location, employment_type, department. Sắp xếp theo `created_at DESC`.

#### 2.2. API sử dụng

| API No | Tên API | Method | Ghi chú |
|---:|---|---|---|
| 1 | Lấy danh sách việc làm | GET | `/api/jobs` |

#### 2.3. Table sử dụng

| No | Table | Alias | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|---|
| 1 | `jobs` | j | - | [x] | - | - | Điều kiện status=active |

#### 2.4. Tham số đầu vào

| Tham số | Kiểu | Bắt buộc | Mô tả | Nguồn |
|---|---|---|---|---|
| `keyword` | String | - | Từ khóa tìm theo title/description | Request query |
| `location` | String | - | Địa điểm | Request query |
| `employment_type` | Enum | - | full_time/part_time/contract | Request query |
| `department` | String | - | Phòng ban | Request query |

#### 2.5. SQL

```sql
SELECT
  j.id, j.title, j.slug, j.location, j.department,
  j.employment_type, j.salary_min, j.salary_max,
  j.required_skills, j.headcount, j.expires_at, j.created_at
FROM jobs j
WHERE j.status = 'active'
  AND (? IS NULL OR j.title LIKE CONCAT('%', ?, '%') OR j.description LIKE CONCAT('%', ?, '%'))
  AND (? IS NULL OR j.location = ?)
  AND (? IS NULL OR j.employment_type = ?)
  AND (? IS NULL OR j.department = ?)
ORDER BY j.created_at DESC;
```

#### 2.6. Kết quả trả ra

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | String | ID job |
| `title` | String | Tiêu đề |
| `slug` | String | Slug URL |
| `location` | String | Địa điểm |
| `department` | String | Phòng ban |
| `employment_type` | Enum | Loại hợp đồng |
| `salary_min` | Int? | Lương tối thiểu |
| `salary_max` | Int? | Lương tối đa |
| `required_skills` | JSON | Skills yêu cầu |
| `expires_at` | DateTime? | Ngày hết hạn |
| `created_at` | DateTime | Ngày tạo |

#### 2.7. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Error handling | Trả 500 nếu DB lỗi |
| Index cần lưu ý | Index on `jobs(status, created_at)` |
| Performance note | Thêm LIMIT nếu số lượng job lớn |

---

### 3. SQL No.2 - Lấy chi tiết job theo slug

#### 3.1. Mục đích

Lấy toàn bộ thông tin của một job kèm danh sách job_channels theo slug.

#### 3.2. API sử dụng

| API No | Tên API | Method | Ghi chú |
|---:|---|---|---|
| 2 | Lấy chi tiết việc làm | GET | `/api/jobs/[slug]` |

#### 3.3. Table sử dụng

| No | Table | Alias | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|---|
| 1 | `jobs` | j | - | [x] | - | - | |
| 2 | `job_channels` | jc | - | [x] | - | - | LEFT JOIN |

#### 3.4. Tham số đầu vào

| Tham số | Kiểu | Bắt buộc | Mô tả | Nguồn |
|---|---|---|---|---|
| `slug` | String | [x] | Slug định danh job | Path param |

#### 3.5. SQL

```sql
SELECT
  j.id, j.title, j.slug, j.description, j.requirements, j.benefits,
  j.location, j.department, j.employment_type,
  j.salary_min, j.salary_max, j.required_skills, j.headcount,
  j.status, j.expires_at, j.created_at,
  jc.id AS channel_id, jc.channel, jc.external_url,
  jc.status AS channel_status, jc.posted_at, jc.expires_at AS channel_expires_at
FROM jobs j
LEFT JOIN job_channels jc ON jc.job_id = j.id
WHERE j.slug = ?
  AND j.status = 'active';
```

#### 3.6. Kết quả trả ra

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | String | ID job |
| `title` | String | Tiêu đề |
| `job_channels` | Array | Danh sách kênh đăng tuyển |

#### 3.7. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Error handling | Trả 404 nếu không tìm thấy hoặc status != active |
| Index cần lưu ý | Index on `jobs(slug)`, `job_channels(job_id)` |

---

### 4. SQL No.3 - Kiểm tra trùng đơn ứng tuyển

#### 4.1. Mục đích

Kiểm tra candidate đã nộp đơn cho job này chưa trước khi tạo application mới.

#### 4.2. API sử dụng

| API No | Tên API | Method | Ghi chú |
|---:|---|---|---|
| 3 | Nộp đơn ứng tuyển | POST | Chạy trước INSERT |

#### 4.3. Table sử dụng

| No | Table | Alias | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|---|
| 1 | `applications` | a | - | [x] | - | - | |

#### 4.4. Tham số đầu vào

| Tham số | Kiểu | Bắt buộc | Mô tả | Nguồn |
|---|---|---|---|---|
| `job_id` | String | [x] | ID job | Từ slug lookup |
| `candidate_id` | String | [x] | ID user | Session JWT |

#### 4.5. SQL

```sql
SELECT id FROM applications
WHERE job_id = ? AND candidate_id = ?
LIMIT 1;
```

#### 4.6. Kết quả trả ra

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | String? | ID application nếu tồn tại |

#### 4.7. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không (read-only check) |
| Error handling | Nếu có kết quả → trả 409 + MSG-A-004 |
| Index cần lưu ý | Unique index hoặc index on `applications(job_id, candidate_id)` |

---

### 5. SQL No.4 - Tạo application mới

#### 5.1. Mục đích

Chèn bản ghi application mới vào bảng `applications` sau khi upload CV thành công.

#### 5.2. API sử dụng

| API No | Tên API | Method | Ghi chú |
|---:|---|---|---|
| 3 | Nộp đơn ứng tuyển | POST | Trong transaction cùng SQL No.5 |

#### 5.3. Table sử dụng

| No | Table | Alias | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|---|
| 1 | `applications` | a | [x] | - | - | - | |

#### 5.4. Tham số đầu vào

| Tham số | Kiểu | Bắt buộc | Mô tả | Nguồn |
|---|---|---|---|---|
| `id` | String | [x] | UUID mới | Generated |
| `job_id` | String | [x] | ID job | DB lookup |
| `candidate_id` | String | [x] | ID candidate | Session |
| `cv_file_url` | String | [x] | URL file từ Appwrite | Upload result |
| `cv_filename` | String | [x] | Tên file gốc | Request |
| `cover_letter` | String | - | Thư xin việc | Request |
| `status` | Enum | [x] | `applied` | Cố định |
| `source_channel` | String | [x] | `website` | Cố định |

#### 5.5. SQL

```sql
INSERT INTO applications
  (id, job_id, candidate_id, cv_file_url, cv_filename, cover_letter, status, source_channel, applied_at, updated_at)
VALUES
  (?, ?, ?, ?, ?, ?, 'applied', 'website', NOW(), NOW());
```

#### 5.6. Kết quả trả ra

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | String | ID application mới |
| `applied_at` | DateTime | Thời điểm nộp |

#### 5.7. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | [x] Cùng transaction với SQL No.5 (INSERT files) |
| Commit | Khi cả 2 INSERT thành công |
| Rollback | Nếu một trong hai INSERT thất bại |
| Error handling | Trả 500 + MSG-A-009 nếu thất bại |

---

<a id="lich-su-thay-doi"></a>
## 11. Lịch sử thay đổi

| Ngày | Nội dung thay đổi | Người thực hiện | Ghi chú |
|---|---|---|---|
| 2026-05-17 | Khởi tạo tài liệu | System | Module A - Public & Landing |
