# DETAIL DESIGN DOCUMENT
# Module C - Khu vực của Ứng viên (Candidate)

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
| 1 | Dashboard ứng viên | Tổng quan đơn ứng tuyển, lịch phỏng vấn sắp tới, job gợi ý | Route: `/candidate` |
| 2 | Hồ sơ ứng viên | Xem, tạo và cập nhật hồ sơ chi tiết (skills, education, kinh nghiệm, links) | Route: `/candidate/profile` |
| 3 | Lịch sử ứng tuyển | Xem danh sách tất cả đơn ứng tuyển đã nộp kèm trạng thái | Route: `/candidate/applications` |
| 4 | Quản lý file CV | Upload, xem danh sách và xóa file CV trong hệ thống | API: `/api/candidate/files` |
| 5 | Xem lịch phỏng vấn | Danh sách lịch phỏng vấn được lên lịch | API: `/api/candidate/interviews` |

### 2. Danh sách table sử dụng

| No | Table | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | `users` | - | [x] | [x] | - | Đọc thông tin cơ bản user, cập nhật avatar |
| 2 | `candidate_profiles` | [x] | [x] | [x] | - | Tạo/cập nhật hồ sơ ứng viên |
| 3 | `applications` | - | [x] | - | - | Đọc danh sách đơn ứng tuyển của candidate |
| 4 | `jobs` | - | [x] | - | - | Đọc thông tin job liên quan đến đơn |
| 5 | `interviews` | - | [x] | - | - | Đọc lịch phỏng vấn của candidate |
| 6 | `files` | [x] | [x] | - | [x] | Upload và xóa file CV |
| 7 | `application_status_history` | - | [x] | - | - | Đọc lịch sử thay đổi trạng thái đơn |

### 3. Đối tượng / Bộ phận sử dụng

| Vai trò | Mô tả | Quyền |
|---|---|---|
| Candidate | Ứng viên đã đăng nhập với role = candidate | Toàn bộ chức năng Module C |
| Guest / HR / Admin / Interviewer | Người dùng khác | Không có quyền truy cập (403) |

> Toàn bộ route `/candidate/*` được bảo vệ bởi middleware: yêu cầu đăng nhập và `role = candidate`.

---

<a id="sheet-02"></a>
## Sheet 02 - IPO

### 1. Danh sách nhóm chức năng

| No | Nhóm chức năng | Mô tả |
|---:|---|---|
| A | Dashboard ứng viên | Hiển thị tổng quan thống kê và thông tin liên quan |
| B | Hồ sơ ứng viên | CRUD hồ sơ chi tiết: skills, education, kinh nghiệm |
| C | Lịch sử ứng tuyển | Xem danh sách đơn + trạng thái |
| D | Quản lý file CV | Upload, liệt kê, xóa file |
| E | Lịch phỏng vấn | Xem danh sách lịch phỏng vấn |

### 2. Nhóm A - Dashboard ứng viên

#### Chức năng cấu thành

| No | Chức năng | Mô tả |
|---:|---|---|
| A-1 | Thống kê đơn ứng tuyển | Đếm đơn theo từng trạng thái (applied, screening, interviewing, offered, hired, rejected) |
| A-2 | Lịch phỏng vấn sắp tới | Danh sách interview có `status = scheduled` và `scheduled_at > NOW()` |
| A-3 | Trạng thái hồ sơ | Kiểm tra candidate_profiles tồn tại, tỉ lệ hoàn thiện |
| A-4 | Job gợi ý | Job active phù hợp với skills trong candidate_profiles |

#### IPO

| | Input | Process | Output |
|---|---|---|---|
| A-1 | candidate_id | `GROUP BY status` trên bảng applications | Object thống kê theo status |
| A-2 | candidate_id | Query interviews JOIN applications WHERE candidate_id=? AND status='scheduled' | Danh sách interview sắp tới |
| A-3 | candidate_id | `SELECT id FROM candidate_profiles WHERE user_id=?` | Có/không hồ sơ + completion % |
| A-4 | skills từ candidate_profile | Match với `required_skills JSON` của jobs active | Danh sách job gợi ý |

### 3. Nhóm B - Hồ sơ ứng viên

#### Chức năng cấu thành

| No | Chức năng | Mô tả |
|---:|---|---|
| B-1 | Xem hồ sơ | Đọc thông tin từ candidate_profiles + users |
| B-2 | Tạo hồ sơ | Tạo mới candidate_profiles nếu chưa có |
| B-3 | Cập nhật hồ sơ | Cập nhật title, bio, location, years_experience, skills, education, links |
| B-4 | Upload avatar | Upload ảnh đại diện lên Appwrite, cập nhật users.avatar_url |

#### IPO

| | Input | Process | Output |
|---|---|---|---|
| B-1 | candidate_id | `findUnique({ where: { user_id } })` include user | Profile object |
| B-2 | Profile data + candidate_id | `candidate_profiles.create(...)` | Profile mới |
| B-3 | Profile data (partial) | `candidate_profiles.upsert(...)` | Profile đã cập nhật |
| B-4 | File ảnh | Upload Appwrite → `users.update({ avatar_url })` | URL avatar mới |

### 4. Nhóm C - Lịch sử ứng tuyển

#### IPO

| | Input | Process | Output |
|---|---|---|---|
| C-1 | candidate_id | `applications.findMany({ where: { candidate_id } })` JOIN jobs | Danh sách application |
| C-2 | application_id | `findUnique` include `application_status_history`, `interviews` | Chi tiết đơn với timeline |

### 5. Nhóm D - Quản lý file CV

#### IPO

| | Input | Process | Output |
|---|---|---|---|
| D-1 | candidate_id | `files.findMany({ where: { user_id } })` | Danh sách file |
| D-2 | File object | Upload Appwrite → `files.create(...)` | File record mới |
| D-3 | file_id + candidate_id | Kiểm tra ownership → Appwrite delete → `files.delete(...)` | Xóa thành công |

---

<a id="sheet-03"></a>
## Sheet 03 - IPO Chi tiết

### 1. GET /api/candidate/profile

#### Thông tin xử lý

| Field | Nội dung |
|---|---|
| Tên API | Lấy hồ sơ ứng viên |
| Method | GET |
| Endpoint | `/api/candidate/profile` |
| Auth | Cookie JWT, role = candidate |
| Mô tả | Trả về hồ sơ chi tiết của candidate đang đăng nhập |

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Auth check | Verify JWT cookie → lấy userId | Trả 401 nếu không hợp lệ |
| 2 | Role check | `role === 'candidate'` | Trả 403 nếu không phải |
| 3 | Search | `candidate_profiles.findUnique({ where: { user_id: userId } })` include user | |
| 4 | Output | Nếu có: trả profile object; nếu chưa: `data: null` | Client hiển thị UI "Tạo hồ sơ" |

### 2. POST /api/candidate/profile

#### Thông tin xử lý

| Field | Nội dung |
|---|---|
| Tên API | Tạo / cập nhật hồ sơ ứng viên |
| Method | POST |
| Endpoint | `/api/candidate/profile` |
| Auth | Cookie JWT, role = candidate |
| Mô tả | Upsert hồ sơ candidate (tạo mới nếu chưa có, cập nhật nếu đã có) |

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Auth check | Verify JWT | Trả 401 |
| 2 | Role check | `role === 'candidate'` | Trả 403 |
| 3 | Validate | Zod: title tối đa 200 ký tự, years_experience ≥ 0, linkedin_url/github_url format URL | Trả 400 + fieldErrors |
| 4 | Upsert | `candidate_profiles.upsert({ where: { user_id }, update: {...}, create: { user_id, ...} })` | |
| 5 | Output | `{ success: true, data: profile }` | |

### 3. GET /api/candidate/applications

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Auth check | Verify JWT → userId | Trả 401 |
| 2 | Role check | `role === 'candidate'` | Trả 403 |
| 3 | Search | `applications.findMany({ where: { candidate_id: userId }, include: { job: true } })` | |
| 4 | Sort | `ORDER BY applied_at DESC` | Mới nhất trước |
| 5 | Output | `{ success: true, data: applications[] }` | |

### 4. GET /api/candidate/interviews

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Auth check | Verify JWT → userId | Trả 401 |
| 2 | Role check | `role === 'candidate'` | Trả 403 |
| 3 | Search | Join `interviews → applications WHERE applications.candidate_id = userId` | |
| 4 | Sort | `ORDER BY scheduled_at ASC` | Sắp tới trước |
| 5 | Output | `{ success: true, data: interviews[] }` | |

### 5. GET /api/candidate/files

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Auth check | Verify JWT → userId | Trả 401 |
| 2 | Search | `files.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' } })` | |
| 3 | Output | `{ success: true, data: files[] }` | |

### 6. POST /api/candidate/files

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Auth check | Verify JWT → userId | Trả 401 |
| 2 | Parse FormData | Lấy `file` từ body | Trả 400 nếu không có file |
| 3 | Validate | .pdf/.doc/.docx, ≤5MB | Trả 400 + MSG-C-007 |
| 4 | Upload Appwrite | Gọi Appwrite Storage API | Trả 500 nếu lỗi |
| 5 | Save record | `files.create({ user_id, file_url, file_name, file_type, file_size, appwrite_file_id })` | |
| 6 | Output | `{ success: true, data: file }` | |

### 7. DELETE /api/candidate/files/[id]

#### Các bước xử lý

| No | Bước | Mô tả | Ghi chú |
|---:|---|---|---|
| 1 | Auth check | Verify JWT → userId | Trả 401 |
| 2 | Tìm file | `files.findUnique({ where: { id } })` | Trả 404 nếu không tìm thấy |
| 3 | Kiểm tra ownership | `file.user_id === userId` | Trả 403 nếu không phải chủ |
| 4 | Xóa Appwrite | Gọi Appwrite Storage delete API với `appwrite_file_id` | |
| 5 | Xóa DB | `files.delete({ where: { id } })` | |
| 6 | Output | `{ success: true }` | |

---

<a id="sheet-04"></a>
## Sheet 04 - Chi tiết điều khiển

### 1. Controls - Dashboard `/candidate`

| No | Control ID | Tên | Loại | Màn hình | Mô tả |
|---:|---|---|---|---|---|
| 1 | CTR-C-001 | Stat Card - Tổng đơn | Card/Stat | Dashboard | Tổng số đơn đã nộp |
| 2 | CTR-C-002 | Stat Card - Đang xử lý | Card/Stat | Dashboard | Đơn ở trạng thái screening/interviewing |
| 3 | CTR-C-003 | Stat Card - Đã nhận offer | Card/Stat | Dashboard | Đơn ở trạng thái offered/hired |
| 4 | CTR-C-004 | Stat Card - Bị từ chối | Card/Stat | Dashboard | Đơn ở trạng thái rejected |
| 5 | CTR-C-005 | Lịch phỏng vấn sắp tới | Section/List | Dashboard | Tối đa 3 interview sắp tới nhất |
| 6 | CTR-C-006 | Interview Card | Card | Dashboard | Hiển thị: job title, ngày giờ, type, status, meeting_link |
| 7 | CTR-C-007 | Hoàn thiện hồ sơ Banner | Alert/Banner | Dashboard | Hiển thị khi chưa tạo profile, link đến `/candidate/profile` |
| 8 | CTR-C-008 | Job gợi ý Section | Section | Dashboard | Tối đa 3 job phù hợp skills |
| 9 | CTR-C-009 | Nút "Xem tất cả đơn" | Button/Link | Dashboard | Điều hướng `/candidate/applications` |
| 10 | CTR-C-010 | Nút "Xem tất cả lịch PV" | Button/Link | Dashboard | Hiển thị tất cả interview |

### 2. Controls - Hồ sơ `/candidate/profile`

| No | Control ID | Tên | Loại | Màn hình | Mô tả |
|---:|---|---|---|---|---|
| 11 | CTR-C-011 | Avatar Upload | Input[file]/Avatar | Profile | Ảnh đại diện, click để upload mới |
| 12 | CTR-C-012 | Title Input | Input[text] | Profile | Chức danh/vị trí nghề nghiệp |
| 13 | CTR-C-013 | Bio Textarea | Textarea | Profile | Giới thiệu bản thân (tối đa 1000 ký tự) |
| 14 | CTR-C-014 | Location Input | Input[text] | Profile | Địa điểm làm việc mong muốn |
| 15 | CTR-C-015 | Years Experience Input | Input[number] | Profile | Số năm kinh nghiệm |
| 16 | CTR-C-016 | Skills Tag Input | TagInput | Profile | Nhập và quản lý danh sách kỹ năng |
| 17 | CTR-C-017 | Education Section | Section/Form | Profile | Danh sách học vấn (thêm/sửa/xóa) |
| 18 | CTR-C-018 | Education Item | Form Row | Profile | school, degree, field, start_year, end_year |
| 19 | CTR-C-019 | Nút Thêm học vấn | Button | Profile | Thêm entry mới vào education list |
| 20 | CTR-C-020 | LinkedIn URL Input | Input[url] | Profile | URL hồ sơ LinkedIn |
| 21 | CTR-C-021 | GitHub URL Input | Input[url] | Profile | URL hồ sơ GitHub |
| 22 | CTR-C-022 | Nút Lưu hồ sơ | Button[submit] | Profile | Submit form cập nhật hồ sơ |
| 23 | CTR-C-023 | Profile Completion Badge | Badge/Progress | Profile | % hoàn thiện hồ sơ |

### 3. Controls - File CV Section (trong Profile)

| No | Control ID | Tên | Loại | Màn hình | Mô tả |
|---:|---|---|---|---|---|
| 24 | CTR-C-024 | Danh sách file CV | Table/List | Profile | Hiển thị file đã upload: tên, loại, size, ngày upload |
| 25 | CTR-C-025 | Nút Upload CV | Button | Profile | Mở dialog chọn file để upload |
| 26 | CTR-C-026 | File Input (ẩn) | Input[file] | Profile | Input thực tế trigger bởi CTR-C-025 |
| 27 | CTR-C-027 | Nút Xóa file | Button/Icon | Profile | Xóa file CV, có confirm dialog |
| 28 | CTR-C-028 | Confirm Delete Dialog | Dialog | Profile | Xác nhận trước khi xóa file |
| 29 | CTR-C-029 | File Preview Link | Link | Profile | Mở/tải file CV đã upload |

### 4. Controls - Lịch sử ứng tuyển `/candidate/applications`

| No | Control ID | Tên | Loại | Màn hình | Mô tả |
|---:|---|---|---|---|---|
| 30 | CTR-C-030 | Applications Table | Table | Applications | Danh sách đơn: job title, company, ngày nộp, trạng thái |
| 31 | CTR-C-031 | Status Badge | Badge | Applications | Màu sắc theo status: applied(xanh dương), screening(vàng), interviewing(cam), offered(tím), hired(xanh lá), rejected(đỏ) |
| 32 | CTR-C-032 | Filter by Status | Select | Applications | Lọc theo trạng thái đơn |
| 33 | CTR-C-033 | Search by Job Title | Input[text] | Applications | Tìm kiếm theo tên job |
| 34 | CTR-C-034 | Application Detail Link | Link/Button | Applications | Xem chi tiết đơn |
| 35 | CTR-C-035 | Empty State | Section | Applications | Hiển thị khi chưa có đơn nào |
| 36 | CTR-C-036 | Pagination | Pagination | Applications | Phân trang danh sách |

---

<a id="sheet-05"></a>
## Sheet 05 - Giao diện màn hình

### 1. Danh sách màn hình

| No | Tên màn hình | Route | Loại | Khái quát | Trạng thái |
|---:|---|---|---|---|---|
| 1 | Dashboard ứng viên | `/candidate` | Dashboard | Tổng quan stats, lịch PV, gợi ý | [x] |
| 2 | Hồ sơ ứng viên | `/candidate/profile` | Form/Chi tiết | Xem và chỉnh sửa hồ sơ | [x] |
| 3 | Lịch sử ứng tuyển | `/candidate/applications` | Danh sách | Danh sách đơn đã nộp | [x] |

---

### 2. Màn hình 1 - Dashboard `/candidate`

| Field | Nội dung |
|---|---|
| Route / URL | `/candidate` |
| Tên màn hình | Dashboard ứng viên |
| Loại màn hình | Dashboard |
| Khái quát chức năng | Trang tổng quan: thống kê đơn ứng tuyển, lịch phỏng vấn sắp tới, nhắc nhở hoàn thiện hồ sơ |
| Tác vụ liên quan | Xem stats, click vào interview card, click link profile, điều hướng đến ứng tuyển |
| Điều kiện hiển thị | Đăng nhập, role = candidate |
| Điều kiện không có dữ liệu | Chưa có đơn nào → hiển thị CTA "Tìm việc ngay" |
| Điều hướng từ màn hình này | `/candidate/profile`, `/candidate/applications`, `/jobs` |
| Điều hướng đến màn hình này | Sau đăng nhập thành công (role=candidate), header nav |
| Liên kết control | CTR-C-001 đến CTR-C-010 |
| Liên kết API | API No.3 (GET /api/candidate/applications), API No.4 (GET /api/candidate/interviews), API No.1 (GET /api/candidate/profile) |
| Liên kết Request | Sheet Request, API No.1, No.3, No.4 |
| Liên kết Response | Sheet Response, API No.1, No.3, No.4 |
| Liên kết Message | MSG-C-003 (lỗi tải data) |
| Ghi chú | Server Component + Client Component; load nhiều API song song bằng React Query |

### 3. Rule hiển thị màn hình 1

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Chưa có hồ sơ | `profile = null` | Banner nhắc tạo hồ sơ | CTR-C-007 |
| 2 | Có hồ sơ chưa đầy đủ | `completionPct < 80%` | Progress bar + gợi ý hoàn thiện | CTR-C-023 |
| 3 | Có lịch PV sắp tới | `upcomingInterviews.length > 0` | Danh sách interview cards | CTR-C-005, CTR-C-006 |
| 4 | Không có lịch PV | `upcomingInterviews.length = 0` | Section "Không có lịch phỏng vấn" | |
| 5 | Có đơn ứng tuyển | `applications.length > 0` | Stat cards với số liệu | CTR-C-001 đến CTR-C-004 |
| 6 | Chưa có đơn nào | `applications.length = 0` | CTA "Tìm việc ngay" link đến `/jobs` | |

---

### 4. Màn hình 2 - Hồ sơ `/candidate/profile`

| Field | Nội dung |
|---|---|
| Route / URL | `/candidate/profile` |
| Tên màn hình | Hồ sơ ứng viên |
| Loại màn hình | Form/Chi tiết |
| Khái quát chức năng | Xem và chỉnh sửa hồ sơ cá nhân chi tiết; quản lý file CV |
| Tác vụ liên quan | Cập nhật thông tin, upload avatar, thêm skills/education, upload/xóa CV |
| Điều kiện hiển thị | Đăng nhập, role = candidate |
| Điều kiện không có dữ liệu | Hồ sơ chưa tạo → form trống, nút "Tạo hồ sơ" |
| Điều hướng từ màn hình này | Không điều hướng ra ngoài (self-contained) |
| Điều hướng đến màn hình này | Từ Dashboard, từ Header nav, từ Banner hồ sơ |
| Liên kết control | CTR-C-011 đến CTR-C-029 |
| Liên kết API | API No.1 (GET), API No.2 (POST), API No.5 (GET files), API No.6 (POST file), API No.7 (DELETE file) |
| Liên kết Request | Sheet Request, API No.1, No.2, No.5, No.6, No.7 |
| Liên kết Response | Sheet Response, API No.1, No.2, No.5, No.6, No.7 |
| Liên kết Message | MSG-C-001, MSG-C-002, MSG-C-004, MSG-C-005, MSG-C-006, MSG-C-007 |
| Ghi chú | React Hook Form; skills dùng TagInput; education dùng dynamic field array |

### 5. Rule hiển thị màn hình 2

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Hồ sơ chưa tạo | `profile = null` | Form trống với placeholder | Nút là "Tạo hồ sơ" |
| 2 | Hồ sơ đã có | `profile != null` | Form điền sẵn dữ liệu | Nút là "Cập nhật hồ sơ" |
| 3 | Đang lưu | `isSaving = true` | Nút submit disabled + spinner | CTR-C-022 |
| 4 | Lưu thành công | API 200 | Toast success | MSG-C-001 |
| 5 | Lưu thất bại | API lỗi | Toast error | MSG-C-002 |
| 6 | File đang upload | `isUploading = true` | Progress indicator | CTR-C-025 |

### 6. Rule validation màn hình 2

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Title | Tùy chọn; tối đa 200 ký tự | MSG-C-008 | Hiển thị lỗi dưới field |
| 2 | Bio | Tùy chọn; tối đa 1000 ký tự | - | Đếm ký tự realtime |
| 3 | Years Experience | Phải là số, ≥ 0, ≤ 50 | MSG-C-009 | Hiển thị lỗi dưới field |
| 4 | LinkedIn URL | Nếu có: phải là URL hợp lệ bắt đầu `https://linkedin.com/` | MSG-C-010 | Hiển thị lỗi dưới field |
| 5 | GitHub URL | Nếu có: phải là URL hợp lệ bắt đầu `https://github.com/` | MSG-C-010 | Hiển thị lỗi dưới field |
| 6 | File CV | .pdf/.doc/.docx; ≤ 5MB | MSG-C-007 | Toast error, không upload |
| 7 | Education - school | Bắt buộc nếu có entry | - | Inline error |
| 8 | Education - start_year | Năm hợp lệ (4 chữ số, ≤ năm hiện tại) | - | Inline error |

---

### 7. Màn hình 3 - Lịch sử ứng tuyển `/candidate/applications`

| Field | Nội dung |
|---|---|
| Route / URL | `/candidate/applications` |
| Tên màn hình | Lịch sử ứng tuyển |
| Loại màn hình | Danh sách |
| Khái quát chức năng | Hiển thị toàn bộ đơn ứng tuyển của candidate, hỗ trợ lọc và tìm kiếm |
| Tác vụ liên quan | Xem danh sách, lọc theo status, tìm kiếm theo job title |
| Điều kiện hiển thị | Đăng nhập, role = candidate |
| Điều kiện không có dữ liệu | Chưa có đơn → Empty State + link đến `/jobs` |
| Điều hướng từ màn hình này | `/jobs/[slug]` (xem lại job) |
| Điều hướng đến màn hình này | Từ Dashboard, từ Header nav |
| Liên kết control | CTR-C-030 đến CTR-C-036 |
| Liên kết API | API No.3 (GET /api/candidate/applications) |
| Liên kết Request | Sheet Request, API No.3 |
| Liên kết Response | Sheet Response, API No.3 |
| Liên kết Message | MSG-C-003, MSG-C-011 |
| Ghi chú | Client Component; filter client-side trên dữ liệu đã fetch |

### 8. Rule hiển thị màn hình 3

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Có đơn | `applications.length > 0` | Bảng danh sách | CTR-C-030 |
| 2 | Không có đơn nào | `applications.length = 0` | Empty State + CTA "Tìm việc" | CTR-C-035 |
| 3 | Đang tải | `isLoading = true` | Skeleton table | |
| 4 | Lỗi API | `isError = true` | Toast error + retry | MSG-C-003 |
| 5 | Filter active | Status filter được chọn | Danh sách lọc theo status | CTR-C-032 |

### 9. Rule validation màn hình 3

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Search keyword | Client-side only; tối đa 200 ký tự | - | Không submit, filter realtime |
| 2 | Status filter | Phải thuộc enum applications_status | - | Dropdown giới hạn giá trị |

---

<a id="sheet-06"></a>
## Sheet 06 - Thông báo

### Danh sách thông báo

| MessageCD | Loại | Nội dung | Khi nào hiển thị |
|---|---|---|---|
| MSG-C-001 | Success | "Hồ sơ của bạn đã được lưu thành công." | Sau POST /api/candidate/profile thành công |
| MSG-C-002 | Error | "Không thể lưu hồ sơ. Vui lòng thử lại." | POST /api/candidate/profile thất bại |
| MSG-C-003 | System Error | "Không thể tải dữ liệu. Vui lòng tải lại trang." | Lỗi khi gọi các GET API |
| MSG-C-004 | Success | "File CV đã được tải lên thành công." | Upload file thành công |
| MSG-C-005 | Error | "Không thể tải file lên. Vui lòng thử lại." | Upload file thất bại |
| MSG-C-006 | Success | "File CV đã được xóa." | DELETE /api/candidate/files/[id] thành công |
| MSG-C-007 | Validation | "Chỉ chấp nhận file PDF, DOC, DOCX và dung lượng tối đa 5MB." | File không đúng loại hoặc quá lớn |
| MSG-C-008 | Validation | "Chức danh không được vượt quá 200 ký tự." | Title quá dài |
| MSG-C-009 | Validation | "Số năm kinh nghiệm phải từ 0 đến 50." | years_experience không hợp lệ |
| MSG-C-010 | Validation | "Vui lòng nhập URL hợp lệ (bắt đầu bằng https://)." | URL không đúng định dạng |
| MSG-C-011 | Empty Data | "Bạn chưa có đơn ứng tuyển nào. Hãy bắt đầu tìm việc!" | Danh sách applications rỗng |
| MSG-C-012 | Warning | "Bạn chưa xác minh email. Một số tính năng có thể bị hạn chế." | `email_verified = false` |
| MSG-C-013 | Success | "Avatar đã được cập nhật thành công." | Upload avatar thành công |
| MSG-C-014 | Warning | "Bạn có chắc muốn xóa file CV này? Hành động này không thể hoàn tác." | Confirm dialog xóa file |

---

<a id="sheet-07"></a>
## Sheet 07 - API

### 1. Danh sách API

| API No | Tên API | Method | Endpoint | Auth | Ghi chú |
|---:|---|---|---|---|---|
| 1 | Lấy hồ sơ ứng viên | GET | `/api/candidate/profile` | Cookie (candidate) | Trả null nếu chưa tạo |
| 2 | Tạo / cập nhật hồ sơ | POST | `/api/candidate/profile` | Cookie (candidate) | Upsert |
| 3 | Danh sách đơn ứng tuyển | GET | `/api/candidate/applications` | Cookie (candidate) | Join jobs |
| 4 | Danh sách lịch phỏng vấn | GET | `/api/candidate/interviews` | Cookie (candidate) | Join applications, jobs |
| 5 | Danh sách file CV | GET | `/api/candidate/files` | Cookie (candidate) | |
| 6 | Upload file CV | POST | `/api/candidate/files` | Cookie (candidate) | multipart/form-data |
| 7 | Xóa file CV | DELETE | `/api/candidate/files/[id]` | Cookie (candidate) | Kiểm tra ownership |

---

### 2. API No.1 - GET /api/candidate/profile

| Field | Nội dung |
|---|---|
| Tên API | Lấy hồ sơ ứng viên |
| Method | GET |
| Endpoint | `/api/candidate/profile` |
| Auth | httpOnly Cookie JWT, role = candidate |

#### Biến trả về (khi có hồ sơ)

| Field | Kiểu | Mô tả |
|---|---|---|
| `success` | Boolean | `true` |
| `data` | Object? | Profile object hoặc `null` |
| `data.id` | String | Profile ID |
| `data.userId` | String | User ID |
| `data.title` | String? | Chức danh |
| `data.bio` | String? | Giới thiệu bản thân |
| `data.location` | String? | Địa điểm |
| `data.yearsExperience` | Int? | Năm kinh nghiệm |
| `data.skills` | JSON | Danh sách kỹ năng |
| `data.education` | JSON | Danh sách học vấn |
| `data.linkedinUrl` | String? | LinkedIn URL |
| `data.githubUrl` | String? | GitHub URL |
| `data.user.fullName` | String | Họ tên |
| `data.user.email` | String | Email |
| `data.user.avatarUrl` | String? | URL avatar |

---

### 3. API No.2 - POST /api/candidate/profile

#### Tham số

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `title` | String | - | Chức danh (≤200 ký tự) |
| `bio` | String | - | Giới thiệu (≤1000 ký tự) |
| `location` | String | - | Địa điểm |
| `yearsExperience` | Int | - | Năm kinh nghiệm (0-50) |
| `skills` | Array[String] | - | Danh sách kỹ năng |
| `education` | Array[Object] | - | `[{ school, degree, field, startYear, endYear }]` |
| `linkedinUrl` | String | - | URL LinkedIn |
| `githubUrl` | String | - | URL GitHub |

#### Xử lý thất bại

| Mã lỗi | HTTP Status | Mô tả |
|---|---|---|
| VALIDATION_ERROR | 400 | Dữ liệu không hợp lệ |
| UNAUTHORIZED | 401 | Chưa đăng nhập |
| FORBIDDEN | 403 | Không phải candidate |
| SERVER_ERROR | 500 | Lỗi DB |

---

### 4. API No.3 - GET /api/candidate/applications

#### Biến trả về

| Field | Kiểu | Mô tả |
|---|---|---|
| `success` | Boolean | `true` |
| `data` | Array | Danh sách application |
| `data[].id` | String | Application ID |
| `data[].status` | Enum | applied/screening/interviewing/offered/hired/rejected |
| `data[].appliedAt` | DateTime | Ngày nộp |
| `data[].updatedAt` | DateTime | Ngày cập nhật gần nhất |
| `data[].sourceChannel` | String | Kênh nộp |
| `data[].job.id` | String | Job ID |
| `data[].job.title` | String | Tên vị trí |
| `data[].job.slug` | String | Slug job |
| `data[].job.location` | String | Địa điểm |
| `data[].job.department` | String | Phòng ban |
| `data[].job.employmentType` | Enum | Loại hợp đồng |

---

### 5. API No.4 - GET /api/candidate/interviews

#### Biến trả về

| Field | Kiểu | Mô tả |
|---|---|---|
| `success` | Boolean | `true` |
| `data` | Array | Danh sách interview |
| `data[].id` | String | Interview ID |
| `data[].scheduledAt` | DateTime | Thời gian phỏng vấn |
| `data[].durationMinutes` | Int | Thời lượng (phút) |
| `data[].type` | Enum | phone/video/onsite/technical |
| `data[].status` | Enum | scheduled/completed/cancelled/rescheduled |
| `data[].meetingLink` | String? | Link online |
| `data[].location` | String? | Địa điểm (onsite) |
| `data[].notes` | String? | Ghi chú |
| `data[].application.job.title` | String | Tên job phỏng vấn |
| `data[].application.job.slug` | String | Slug job |
| `data[].interviewer.fullName` | String | Tên người phỏng vấn |

---

### 6. API No.6 - POST /api/candidate/files

| Field | Nội dung |
|---|---|
| Tên API | Upload file CV |
| Method | POST |
| Endpoint | `/api/candidate/files` |
| Auth | Cookie (candidate) |
| Content-Type | multipart/form-data |

#### Tham số

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `file` | File | [x] | File CV (.pdf/.doc/.docx, ≤5MB) |

#### Biến trả về

| Field | Kiểu | Mô tả |
|---|---|---|
| `success` | Boolean | `true` |
| `data.id` | String | File record ID |
| `data.fileUrl` | String | URL truy cập file |
| `data.fileName` | String | Tên file gốc |
| `data.fileType` | String | MIME type |
| `data.fileSize` | Int | Kích thước (bytes) |
| `data.createdAt` | DateTime | Ngày upload |

---

<a id="sheet-08"></a>
## Sheet 08 - Request

### API No.1 - GET /api/candidate/profile

#### Header

| Header | Giá trị | Ghi chú |
|---|---|---|
| `Cookie` | `session=<JWT>` | Tự động kèm theo |

```
GET /api/candidate/profile
Cookie: session=eyJhbGci...
```

---

### API No.2 - POST /api/candidate/profile

#### Header

| Header | Giá trị | Ghi chú |
|---|---|---|
| `Cookie` | `session=<JWT>` | Tự động kèm theo |
| `Content-Type` | `application/json` | |

#### Body (JSON)

```json
{
  "title": "Frontend Developer",
  "bio": "Lập trình viên với 3 năm kinh nghiệm React và TypeScript.",
  "location": "Hà Nội",
  "yearsExperience": 3,
  "skills": ["React", "TypeScript", "Next.js", "Tailwind CSS"],
  "education": [
    {
      "school": "Đại học Bách Khoa Hà Nội",
      "degree": "Cử nhân",
      "field": "Công nghệ Thông tin",
      "startYear": 2018,
      "endYear": 2022
    }
  ],
  "linkedinUrl": "https://linkedin.com/in/nguyenvana",
  "githubUrl": "https://github.com/nguyenvana"
}
```

---

### API No.3 - GET /api/candidate/applications

#### Header

| Header | Giá trị | Ghi chú |
|---|---|---|
| `Cookie` | `session=<JWT>` | Tự động kèm theo |

```
GET /api/candidate/applications
Cookie: session=eyJhbGci...
```

---

### API No.6 - POST /api/candidate/files

#### Header

| Header | Giá trị | Ghi chú |
|---|---|---|
| `Cookie` | `session=<JWT>` | Tự động kèm theo |
| `Content-Type` | `multipart/form-data` | |

#### Body (FormData)

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `file` | File | [x] | File CV |

---

### API No.7 - DELETE /api/candidate/files/[id]

#### Header

| Header | Giá trị | Ghi chú |
|---|---|---|
| `Cookie` | `session=<JWT>` | Tự động kèm theo |

#### Path Params

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | String | [x] | ID file cần xóa |

```
DELETE /api/candidate/files/file_cuid_001
Cookie: session=eyJhbGci...
```

---

<a id="sheet-09"></a>
## Sheet 09 - Response

### API No.1 - GET /api/candidate/profile

#### Success - Có hồ sơ (200)

```json
{
  "success": true,
  "data": {
    "id": "prof_cuid_001",
    "userId": "user_cuid_001",
    "title": "Frontend Developer",
    "bio": "Lập trình viên với 3 năm kinh nghiệm React.",
    "location": "Hà Nội",
    "yearsExperience": 3,
    "skills": ["React", "TypeScript", "Next.js"],
    "education": [
      {
        "school": "ĐH Bách Khoa HN",
        "degree": "Cử nhân",
        "field": "CNTT",
        "startYear": 2018,
        "endYear": 2022
      }
    ],
    "linkedinUrl": "https://linkedin.com/in/nguyenvana",
    "githubUrl": "https://github.com/nguyenvana",
    "user": {
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "avatarUrl": null
    }
  }
}
```

#### Success - Chưa có hồ sơ (200)

```json
{
  "success": true,
  "data": null
}
```

---

### API No.3 - GET /api/candidate/applications

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "app_cuid_001",
      "status": "screening",
      "appliedAt": "2026-05-10T08:00:00.000Z",
      "updatedAt": "2026-05-12T10:30:00.000Z",
      "sourceChannel": "website",
      "job": {
        "id": "job_cuid_001",
        "title": "Frontend Developer",
        "slug": "frontend-developer-2026",
        "location": "Hà Nội",
        "department": "Engineering",
        "employmentType": "full_time"
      }
    },
    {
      "id": "app_cuid_002",
      "status": "applied",
      "appliedAt": "2026-05-15T09:00:00.000Z",
      "updatedAt": "2026-05-15T09:00:00.000Z",
      "sourceChannel": "website",
      "job": {
        "id": "job_cuid_002",
        "title": "React Developer",
        "slug": "react-developer-2026",
        "location": "TP.HCM",
        "department": "Product",
        "employmentType": "full_time"
      }
    }
  ]
}
```

---

### API No.4 - GET /api/candidate/interviews

#### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "iv_cuid_001",
      "scheduledAt": "2026-05-20T09:00:00.000Z",
      "durationMinutes": 60,
      "type": "video",
      "status": "scheduled",
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "location": null,
      "notes": "Phỏng vấn kỹ thuật vòng 1",
      "application": {
        "job": {
          "title": "Frontend Developer",
          "slug": "frontend-developer-2026"
        }
      },
      "interviewer": {
        "fullName": "Trần Thị B"
      }
    }
  ]
}
```

---

### API No.6 - POST /api/candidate/files

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": "file_cuid_001",
    "fileUrl": "https://appwrite.io/v1/storage/buckets/cvs/files/abc123/view",
    "fileName": "CV_NguyenVanA_2026.pdf",
    "fileType": "application/pdf",
    "fileSize": 524288,
    "appwriteFileId": "abc123xyz",
    "createdAt": "2026-05-17T06:00:00.000Z"
  }
}
```

#### Error Response - File quá lớn (400)

```json
{
  "success": false,
  "error": "Chỉ chấp nhận file PDF, DOC, DOCX và dung lượng tối đa 5MB."
}
```

---

### API No.7 - DELETE /api/candidate/files/[id]

#### Success Response (200)

```json
{
  "success": true
}
```

#### Error Response - Không tìm thấy (404)

```json
{
  "success": false,
  "error": "Không tìm thấy file hoặc bạn không có quyền xóa."
}
```

---

<a id="sheet-10"></a>
## Sheet 10 - SQL

### 1. Danh sách SQL

| SQL No | Tên SQL / Mục đích | Loại | API sử dụng | Ghi chú |
|---:|---|---|---|---|
| 1 | Lấy hồ sơ ứng viên theo user_id | SELECT | API No.1 | JOIN users |
| 2 | Upsert hồ sơ ứng viên | INSERT/UPDATE | API No.2 | ON DUPLICATE KEY UPDATE |
| 3 | Lấy danh sách đơn ứng tuyển của candidate | SELECT | API No.3 | JOIN jobs |
| 4 | Lấy danh sách lịch phỏng vấn của candidate | SELECT | API No.4 | JOIN applications, jobs, users |
| 5 | Lấy danh sách file CV của candidate | SELECT | API No.5 | Filter by user_id |
| 6 | Tạo file record | INSERT | API No.6 | Sau upload Appwrite |
| 7 | Xóa file record | DELETE | API No.7 | Sau delete Appwrite |
| 8 | Thống kê đơn theo status | SELECT (aggregate) | Dashboard | GROUP BY status |

---

### 2. SQL No.1 - Lấy hồ sơ ứng viên

#### 2.1. Mục đích

Lấy toàn bộ thông tin hồ sơ của candidate theo `user_id`, kèm thông tin cơ bản từ bảng `users`.

#### 2.2. API sử dụng

| API No | Tên API | Method | Ghi chú |
|---:|---|---|---|
| 1 | Lấy hồ sơ ứng viên | GET | |

#### 2.3. Table sử dụng

| No | Table | Alias | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|---|
| 1 | `candidate_profiles` | cp | - | [x] | - | - | |
| 2 | `users` | u | - | [x] | - | - | JOIN lấy thông tin cơ bản |

#### 2.4. Tham số đầu vào

| Tham số | Kiểu | Bắt buộc | Mô tả | Nguồn |
|---|---|---|---|---|
| `user_id` | String | [x] | ID user candidate | Session JWT |

#### 2.5. SQL

```sql
SELECT
  cp.id, cp.user_id, cp.title, cp.bio, cp.location,
  cp.years_experience, cp.skills, cp.education,
  cp.linkedin_url, cp.github_url,
  u.full_name, u.email, u.avatar_url
FROM candidate_profiles cp
INNER JOIN users u ON u.id = cp.user_id
WHERE cp.user_id = ?
LIMIT 1;
```

#### 2.6. Kết quả trả ra

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | String | Profile ID |
| `skills` | JSON | Array kỹ năng |
| `education` | JSON | Array học vấn |
| `full_name` | String | Tên từ bảng users |

#### 2.7. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Error handling | Không có row → trả `data: null` |
| Index cần lưu ý | Unique index on `candidate_profiles(user_id)` |

---

### 3. SQL No.2 - Upsert hồ sơ ứng viên

#### 3.1. Mục đích

Tạo mới hồ sơ nếu chưa có, hoặc cập nhật nếu đã tồn tại (dựa trên `user_id`).

#### 3.2. API sử dụng

| API No | Tên API | Method | Ghi chú |
|---:|---|---|---|
| 2 | Tạo/cập nhật hồ sơ | POST | |

#### 3.3. Table sử dụng

| No | Table | Alias | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|---|
| 1 | `candidate_profiles` | cp | [x] | - | [x] | - | |

#### 3.4. SQL

```sql
INSERT INTO candidate_profiles
  (id, user_id, title, bio, location, years_experience, skills, education, linkedin_url, github_url)
VALUES
  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  bio = VALUES(bio),
  location = VALUES(location),
  years_experience = VALUES(years_experience),
  skills = VALUES(skills),
  education = VALUES(education),
  linkedin_url = VALUES(linkedin_url),
  github_url = VALUES(github_url);
```

#### 3.5. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không (single statement) |
| Index cần lưu ý | Unique constraint on `candidate_profiles(user_id)` |
| Performance note | `skills` và `education` lưu dạng JSON string |

---

### 4. SQL No.3 - Lấy danh sách đơn ứng tuyển của candidate

#### 4.1. Mục đích

Lấy tất cả đơn ứng tuyển của candidate kèm thông tin job liên quan, sắp xếp theo ngày nộp mới nhất.

#### 4.2. API sử dụng

| API No | Tên API | Method | Ghi chú |
|---:|---|---|---|
| 3 | Danh sách đơn ứng tuyển | GET | |

#### 4.3. Table sử dụng

| No | Table | Alias | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|---|
| 1 | `applications` | a | - | [x] | - | - | |
| 2 | `jobs` | j | - | [x] | - | - | INNER JOIN |

#### 4.4. Tham số đầu vào

| Tham số | Kiểu | Bắt buộc | Mô tả | Nguồn |
|---|---|---|---|---|
| `candidate_id` | String | [x] | ID candidate | Session JWT |

#### 4.5. SQL

```sql
SELECT
  a.id, a.status, a.applied_at, a.updated_at, a.source_channel,
  a.cv_file_url, a.cv_filename,
  j.id AS job_id, j.title AS job_title, j.slug AS job_slug,
  j.location AS job_location, j.department AS job_department,
  j.employment_type AS job_employment_type
FROM applications a
INNER JOIN jobs j ON j.id = a.job_id
WHERE a.candidate_id = ?
ORDER BY a.applied_at DESC;
```

#### 4.6. Kết quả trả ra

| Field | Kiểu | Mô tả |
|---|---|---|
| `id` | String | Application ID |
| `status` | Enum | Trạng thái hiện tại |
| `applied_at` | DateTime | Ngày nộp |
| `job_title` | String | Tên job |
| `job_slug` | String | Slug để tạo link |

#### 4.7. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Index cần lưu ý | Index on `applications(candidate_id, applied_at)` |

---

### 5. SQL No.4 - Lấy danh sách lịch phỏng vấn của candidate

#### 5.1. Mục đích

Lấy tất cả lịch phỏng vấn của candidate qua join: `interviews → applications → jobs`, kèm thông tin interviewer.

#### 5.2. SQL

```sql
SELECT
  iv.id, iv.scheduled_at, iv.duration_minutes, iv.type, iv.status,
  iv.meeting_link, iv.location AS interview_location, iv.notes,
  j.title AS job_title, j.slug AS job_slug,
  u.full_name AS interviewer_name
FROM interviews iv
INNER JOIN applications a ON a.id = iv.application_id
INNER JOIN jobs j ON j.id = a.job_id
LEFT JOIN users u ON u.id = iv.interviewer_id
WHERE a.candidate_id = ?
ORDER BY iv.scheduled_at ASC;
```

#### 5.3. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Index cần lưu ý | Index on `applications(candidate_id)`, `interviews(application_id)` |

---

### 6. SQL No.5 - Lấy danh sách file CV

#### 6.1. SQL

```sql
SELECT
  id, file_url, file_name, file_type, file_size,
  appwrite_file_id, created_at
FROM files
WHERE user_id = ?
ORDER BY created_at DESC;
```

---

### 7. SQL No.6 - Tạo file record

#### 7.1. SQL

```sql
INSERT INTO files
  (id, user_id, file_url, file_name, file_type, file_size, appwrite_file_id, created_at)
VALUES
  (?, ?, ?, ?, ?, ?, ?, NOW());
```

#### 7.2. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không (Appwrite đã upload trước đó) |
| Error handling | Nếu INSERT thất bại → cần rollback file trên Appwrite thủ công hoặc job cleanup |

---

### 8. SQL No.7 - Xóa file record

#### 8.1. SQL

```sql
-- Bước 1: Kiểm tra ownership
SELECT id, appwrite_file_id, user_id FROM files WHERE id = ? LIMIT 1;

-- Bước 2: Xóa sau khi verify ownership và delete Appwrite thành công
DELETE FROM files WHERE id = ? AND user_id = ?;
```

#### 8.2. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không (Appwrite delete là external call, thực hiện trước) |
| Error handling | Nếu Appwrite delete thất bại → không xóa DB |

---

### 9. SQL No.8 - Thống kê đơn theo status (Dashboard)

#### 9.1. Mục đích

Tổng hợp số lượng đơn ứng tuyển của candidate theo từng trạng thái để hiển thị stat cards trên Dashboard.

#### 9.2. SQL

```sql
SELECT
  status,
  COUNT(*) AS count
FROM applications
WHERE candidate_id = ?
GROUP BY status;
```

#### 9.3. Kết quả trả ra

| Field | Kiểu | Mô tả |
|---|---|---|
| `status` | Enum | Tên trạng thái |
| `count` | Int | Số lượng đơn |

#### 9.4. Ghi chú xử lý

| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Index cần lưu ý | Index on `applications(candidate_id, status)` |
| Performance note | Có thể cache phía client với React Query; staleTime = 2 phút |

---

<a id="lich-su-thay-doi"></a>
## 11. Lịch sử thay đổi

| Ngày | Nội dung thay đổi | Người thực hiện | Ghi chú |
|---|---|---|---|
| 2026-05-17 | Khởi tạo tài liệu | System | Module C - Candidate |
