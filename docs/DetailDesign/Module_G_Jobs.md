# DETAIL DESIGN DOCUMENT
# Module G - Jobs

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

| No | Nội dung |
|---:|---|
| 1 | Hiển thị danh sách tin tuyển dụng với bộ lọc theo trạng thái (draft/active/closed/archived). |
| 2 | Tạo mới tin tuyển dụng: tiêu đề, mô tả, yêu cầu, lợi ích, địa điểm, phòng ban, lương, loại hợp đồng, kỹ năng yêu cầu, số lượng tuyển. |
| 3 | Chỉnh sửa tin tuyển dụng: cập nhật mọi trường thông tin; thay đổi trạng thái (draft → active → closed). |
| 4 | Quản lý kênh đăng tin: liên kết job với các kênh tuyển dụng (website, LinkedIn, TopCV...), theo dõi trạng thái đăng. |
| 5 | Tự động tạo slug từ tiêu đề tin tuyển dụng để dùng cho URL công khai. |

### 2. Danh sách table sử dụng

| No | Table | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | jobs | x | x | x | - | CRUD chính |
| 2 | job_channels | x | x | x | - | Quản lý kênh đăng |
| 3 | users | - | x | - | - | Thông tin người tạo job |
| 4 | applications | - | x | - | - | Đếm số ứng viên của job |

### 3. Đối tượng / Bộ phận sử dụng

| Đối tượng | Xem danh sách | Tạo mới | Chỉnh sửa | Quản lý kênh |
|---|---|---|---|---|
| Guest | - | - | - | - |
| Candidate | - | - | - | - |
| HR | x | x | x | x |
| Admin | x | x | x | x |
| Interviewer | - | - | - | - |

---

<a id="sheet-02"></a>
## Sheet 02 - IPO

### 1. Danh sách nhóm chức năng

| No | Nhóm chức năng | Mô tả |
|---:|---|---|
| 1 | Xem danh sách tin tuyển dụng | Filter theo status; hiển thị số lượng ứng viên |
| 2 | Tạo tin tuyển dụng mới | Nhập thông tin đầy đủ; auto-generate slug |
| 3 | Chỉnh sửa tin tuyển dụng | Cập nhật thông tin; đổi trạng thái |
| 4 | Quản lý kênh đăng tin | Thêm kênh; cập nhật trạng thái kênh; xem danh sách kênh |
| 5 | Xem chi tiết tin tuyển dụng | Chi tiết job kèm thống kê ứng viên |

### 2. Nhóm 1 - Xem danh sách tin tuyển dụng

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session (hr/admin); query: `status`, `page`, `limit` |
| **Process** | WHERE status nếu có; JOIN users (created_by); đếm applications theo job_id; ORDER BY created_at DESC; phân trang |
| **Output** | `{ items: [...], total, page, limit }` mỗi item có số ứng viên (_count.applications) |

### 3. Nhóm 2 - Tạo tin tuyển dụng mới

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; body: `{ title, description, requirements, benefits, location, department, salary_min, salary_max, employment_type, required_skills, headcount, status, expires_at }` |
| **Process** | Validate các trường bắt buộc; auto-generate slug = slugify(title) + UUID suffix nếu trùng; SET created_by = currentUser.id; INSERT jobs |
| **Output** | Job record mới với id và slug |

### 4. Nhóm 3 - Chỉnh sửa tin tuyển dụng

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; path param `id`; body: các trường cần cập nhật |
| **Process** | Validate job tồn tại; validate trường hợp lệ; UPDATE jobs SET ... WHERE id |
| **Output** | Job record đã cập nhật |

### 5. Nhóm 4 - Quản lý kênh đăng tin

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; path param `job_id`; body (POST): `{ channel, external_url, expires_at }` |
| **Process** | GET: lấy tất cả channels theo job_id; POST: INSERT job_channels; PATCH: cập nhật status kênh |
| **Output** | Danh sách channels hoặc channel record |

### 6. Nhóm 5 - Xem chi tiết tin tuyển dụng

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; path param `id` |
| **Process** | findUnique job JOIN users (creator) + đếm applications; lấy kênh đăng |
| **Output** | Job object đầy đủ kèm _count và channels |

---

<a id="sheet-03"></a>
## Sheet 03 - IPO Chi tiết

### Danh sách method

| No | Method | API | Mô tả |
|---:|---|---|---|
| 1 | List Jobs | GET /api/dashboard/jobs | Danh sách tin có filter |
| 2 | Create Job | POST /api/dashboard/jobs | Tạo tin mới |
| 3 | Get Job Detail | GET /api/dashboard/jobs/[id] | Chi tiết tin |
| 4 | Update Job | PATCH /api/dashboard/jobs/[id] | Cập nhật tin |
| 5 | List Channels | GET /api/dashboard/jobs/[id]/channels | Danh sách kênh |
| 6 | Add Channel | POST /api/dashboard/jobs/[id]/channels | Thêm kênh đăng |

### Method 1 - GET /api/dashboard/jobs

**Init:**
- Xác thực JWT; role ∈ [hr, admin]

**Search:**
- `status` ∈ ['draft','active','closed','archived'] nếu có
- `page` ≥ 1, `limit` default 20

**Process:**
```
where = {}
if status → where.status = status
jobs = prisma.job.findMany({
  where,
  include: { createdBy: { select: { full_name: true } }, _count: { select: { applications: true } } },
  orderBy: { created_at: 'desc' },
  skip, take
})
total = prisma.job.count({ where })
```

**Output:** `{ success: true, data: { items, total, page, limit } }`

### Method 2 - POST /api/dashboard/jobs

**Init:**
- Xác thực JWT; role ∈ [hr, admin]

**Validate:**
- `title` bắt buộc, max 200 ký tự
- `description` bắt buộc, max 10000 ký tự
- `employment_type` ∈ ['full_time','part_time','contract']
- `status` ∈ ['draft','active'] khi tạo mới (không tạo thẳng vào closed/archived)
- `salary_min` ≤ `salary_max` nếu cả hai có
- `headcount` > 0 nếu có
- `required_skills` là JSON array of strings nếu có

**Process:**
```
slug = generateSlug(title)  // Kiểm tra trùng, thêm suffix nếu cần
prisma.job.create({
  data: { title, slug, description, requirements, benefits, location, department, salary_min, salary_max, employment_type, required_skills: JSON.stringify(skills), headcount, status, expires_at, created_by: currentUser.id }
})
```

**Output:** `{ success: true, data: jobRecord }` (201)

### Method 3 - GET /api/dashboard/jobs/[id]

**Process:**
```
job = prisma.job.findUnique({
  where: { id },
  include: {
    createdBy: { select: { id, full_name, email } },
    channels: true,
    _count: { select: { applications: true } }
  }
})
if !job → 404
```

### Method 4 - PATCH /api/dashboard/jobs/[id]

**Validate:**
- Không thể set status = 'archived' nếu còn applications đang active (status ≠ hired/rejected)
- `employment_type` ∈ enum nếu có
- `status` ∈ enum nếu có

**Process:**
```
prisma.job.update({ where: { id }, data: { ...validatedFields } })
```

### Method 5 - GET /api/dashboard/jobs/[id]/channels

**Process:**
```
prisma.jobChannel.findMany({ where: { job_id: id }, orderBy: { created_at: 'desc' } })
```

### Method 6 - POST /api/dashboard/jobs/[id]/channels

**Validate:**
- `channel` bắt buộc, max 100 ký tự
- `external_url` URL hợp lệ nếu có
- Không được thêm trùng channel cùng tên cho một job

**Process:**
```
// Kiểm tra trùng:
existing = prisma.jobChannel.findFirst({ where: { job_id: id, channel } })
if existing → 409 Conflict
prisma.jobChannel.create({ data: { job_id: id, channel, external_url, status: 'pending', expires_at } })
```

---

<a id="sheet-04"></a>
## Sheet 04 - Chi tiết điều khiển

### Màn hình /dashboard/jobs - Danh sách

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Bộ lọc Trạng thái | DROPDOWN | I | draft/active/closed/archived | Tất cả | Filter status |
| 2 | Nút Áp dụng lọc | BUTTON | I | - | - | Trigger search |
| 3 | Nút Tạo tin mới | BUTTON | I | - | - | Điều hướng /dashboard/jobs/new |
| 4 | Bảng danh sách job | TABLE | O | - | - | Cols: Tiêu đề, Phòng ban, Trạng thái, Số ứng viên, Người tạo, Ngày tạo |
| 5 | Badge trạng thái | TEXT | O | - | - | draft=gray, active=green, closed=yellow, archived=red |
| 6 | Phân trang | SECTION | I/O | - | Page 1, 20/trang | - |
| 7 | Link Chỉnh sửa | BUTTON | I | - | - | → /dashboard/jobs/[id]/edit |
| 8 | Link Kênh đăng | BUTTON | I | - | - | → /dashboard/jobs/[id]/channels |

### Màn hình /dashboard/jobs/new - Tạo mới

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Tiêu đề tin | TEXTBOX | I | Bắt buộc; max 200 ký tự | - | Input text |
| 2 | Mô tả công việc | TEXTBOX | I | Bắt buộc; max 10000 ký tự | - | Rich text / Textarea |
| 3 | Yêu cầu | TEXTBOX | I | Tùy chọn; max 5000 ký tự | - | Textarea |
| 4 | Lợi ích | TEXTBOX | I | Tùy chọn; max 5000 ký tự | - | Textarea |
| 5 | Địa điểm | TEXTBOX | I | Tùy chọn; max 200 ký tự | - | - |
| 6 | Phòng ban | TEXTBOX | I | Tùy chọn; max 100 ký tự | - | - |
| 7 | Mức lương tối thiểu | TEXTBOX | I | Số dương nếu có | - | Nullable |
| 8 | Mức lương tối đa | TEXTBOX | I | ≥ lương tối thiểu nếu có | - | Nullable |
| 9 | Loại hợp đồng | DROPDOWN | I | Bắt buộc; full_time/part_time/contract | full_time | - |
| 10 | Kỹ năng yêu cầu | TEXTBOX | I | Tùy chọn; comma-separated hoặc tag input | - | Lưu dạng JSON array |
| 11 | Số lượng tuyển | TEXTBOX | I | Số nguyên dương; default 1 | 1 | - |
| 12 | Trạng thái | DROPDOWN | I | draft hoặc active | draft | - |
| 13 | Hạn đăng tuyển | TEXTBOX | I | Date trong tương lai nếu có | - | Date picker |
| 14 | Nút Lưu | BUTTON | I | Form hợp lệ | - | Submit tạo |
| 15 | Nút Hủy | BUTTON | I | - | - | Về /dashboard/jobs |

### Màn hình /dashboard/jobs/[id]/edit - Chỉnh sửa

Sử dụng cùng cấu trúc control với form tạo mới, thêm:

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 16 | Nút Lưu thay đổi | BUTTON | I | Form hợp lệ | - | Submit PATCH |
| 17 | Dropdown Trạng thái (mở rộng) | DROPDOWN | I | Bao gồm closed/archived | Trạng thái hiện tại | Disabled nếu có ứng viên active (archived) |

### Màn hình /dashboard/jobs/[id]/channels - Kênh đăng

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Bảng danh sách kênh | TABLE | O | - | - | Cols: Kênh, URL, Trạng thái, Ngày đăng, Hết hạn |
| 2 | Nút Thêm kênh | BUTTON | I | - | - | Mở modal thêm kênh |
| 3 | Modal thêm kênh | MODAL | I/O | - | - | Form: channel name, external_url, expires_at |
| 4 | Input Tên kênh | TEXTBOX | I | Bắt buộc; max 100 ký tự | - | Ví dụ: LinkedIn, TopCV |
| 5 | Input URL bài đăng | TEXTBOX | I | URL hợp lệ nếu có | - | - |
| 6 | Input Hạn đăng kênh | TEXTBOX | I | Date tương lai nếu có | - | Date picker |
| 7 | Nút Lưu kênh | BUTTON | I | Form hợp lệ | - | Submit POST channel |
| 8 | Badge trạng thái kênh | TEXT | O | - | - | pending=yellow, posted=green, failed=red, expired=gray |

---

<a id="sheet-05"></a>
## Sheet 05 - Giao diện màn hình

### 2. Danh sách màn hình

| No | Tên màn hình | Route / URL | Loại màn hình | Khái quát | Trạng thái |
|---:|---|---|---|---|---|
| 1 | Danh sách tin tuyển dụng | /dashboard/jobs | Danh sách | Tất cả jobs có filter | x |
| 2 | Tạo tin mới | /dashboard/jobs/new | Form | Form tạo tin tuyển dụng | x |
| 3 | Chỉnh sửa tin | /dashboard/jobs/[id]/edit | Form | Form sửa tin tuyển dụng | x |
| 4 | Quản lý kênh đăng | /dashboard/jobs/[id]/channels | Chi tiết + Form | Danh sách và quản lý kênh | x |

### 3. Màn hình 1 - /dashboard/jobs

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/jobs |
| Tên màn hình | Danh sách tin tuyển dụng |
| Loại màn hình | Danh sách |
| Khái quát chức năng | Hiển thị tất cả job có filter theo status; mỗi job hiển thị số ứng viên; truy cập nhanh vào edit/channels |
| Tác vụ liên quan | Lọc theo status; phân trang; tạo mới; chỉnh sửa; quản lý kênh |
| Điều kiện hiển thị | User đăng nhập role hr hoặc admin |
| Điều kiện không có dữ liệu | "Chưa có tin tuyển dụng nào. Bấm 'Tạo tin mới' để bắt đầu." |
| Điều hướng từ màn hình này | /dashboard/jobs/new; /dashboard/jobs/[id]/edit; /dashboard/jobs/[id]/channels |
| Điều hướng đến màn hình này | Sidebar menu "Tin tuyển dụng"; KPI card từ Dashboard |
| Liên kết control | Sheet Chi tiết điều khiển, No.1-8 (jobs list) |
| Liên kết API | Sheet API, API No.G-01 |
| Liên kết Message | Sheet Thông báo, G-ERR-001 |
| Ghi chú | Client Component; React Query; URL sync với filter |

### 4. Rule hiển thị màn hình 1

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Bình thường | Có jobs | Bảng danh sách với badge, số ứng viên | - |
| 2 | Không có dữ liệu | total = 0 | Empty state + nút tạo mới | - |
| 3 | Filter không có kết quả | Filter active nhưng 0 kết quả | "Không tìm thấy tin phù hợp" + nút xóa filter | - |
| 4 | Lỗi | API lỗi | Alert lỗi + nút thử lại | - |
| 5 | Loading | Fetching | Skeleton rows | - |

### 5. Rule validation màn hình 1

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Filter status trong URL | Phải ∈ enum nếu có | - | Bỏ qua |

### 6. Màn hình 2 - /dashboard/jobs/new

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/jobs/new |
| Tên màn hình | Tạo tin tuyển dụng mới |
| Loại màn hình | Form |
| Khái quát chức năng | Form nhiều bước hoặc single page để tạo tin tuyển dụng mới |
| Điều kiện hiển thị | role hr hoặc admin |
| Điều hướng từ màn hình này | Sau submit thành công → /dashboard/jobs; Hủy → /dashboard/jobs |
| Liên kết API | Sheet API, API No.G-02 |
| Liên kết Message | Sheet Thông báo, G-SUC-001, G-ERR-002 |
| Ghi chú | Client Component; React Hook Form + Zod |

### 7. Rule validation màn hình 2

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Tiêu đề | Bắt buộc; max 200 ký tự | G-VAL-001 | Hiển thị lỗi; disable submit |
| 2 | Mô tả | Bắt buộc; max 10000 ký tự | G-VAL-002 | Hiển thị lỗi |
| 3 | Loại hợp đồng | Bắt buộc | G-VAL-003 | Hiển thị lỗi |
| 4 | Mức lương | salary_min ≤ salary_max nếu cả hai có | G-VAL-004 | Hiển thị lỗi ở salary_max |
| 5 | Số lượng tuyển | Số nguyên dương nếu có | G-VAL-005 | Hiển thị lỗi |
| 6 | Hạn đăng tuyển | Ngày trong tương lai nếu có | G-VAL-006 | Hiển thị lỗi |

### 8. Màn hình 3 - /dashboard/jobs/[id]/edit

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/jobs/[id]/edit |
| Tên màn hình | Chỉnh sửa tin tuyển dụng |
| Loại màn hình | Form |
| Khái quát chức năng | Load dữ liệu job hiện tại vào form; cho phép chỉnh sửa tất cả trường; thay đổi trạng thái |
| Điều kiện hiển thị | role hr/admin; job tồn tại |
| Điều hướng từ màn hình này | Sau lưu → /dashboard/jobs; Hủy → /dashboard/jobs |
| Liên kết API | Sheet API, API No.G-03, G-04 |
| Liên kết Message | Sheet Thông báo, G-SUC-002, G-ERR-003 |
| Ghi chú | Pre-fill form với data hiện tại; React Hook Form defaultValues |

### 9. Màn hình 4 - /dashboard/jobs/[id]/channels

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/jobs/[id]/channels |
| Tên màn hình | Quản lý kênh đăng tin |
| Loại màn hình | Chi tiết + Form |
| Khái quát chức năng | Xem và quản lý các kênh đăng tin tuyển dụng; thêm kênh mới qua modal |
| Điều kiện hiển thị | role hr/admin; job tồn tại |
| Điều hướng từ màn hình này | Nút Back → /dashboard/jobs |
| Liên kết API | Sheet API, API No.G-05, G-06 |
| Liên kết Message | Sheet Thông báo, G-SUC-003, G-ERR-004 |
| Ghi chú | React Query để refresh sau khi thêm kênh |

### 10. Rule validation màn hình 4 (Modal thêm kênh)

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Tên kênh | Bắt buộc; max 100 ký tự | G-VAL-007 | Hiển thị lỗi |
| 2 | URL bài đăng | URL hợp lệ nếu có (https://...) | G-VAL-008 | Hiển thị lỗi |
| 3 | Kênh trùng lặp | Không thêm kênh cùng tên đã tồn tại | G-ERR-005 | Toast error |

---

<a id="sheet-06"></a>
## Sheet 06 - Thông báo

| MessageCD | Loại | Nội dung (tiếng Việt) | Ghi chú |
|---|---|---|---|
| G-SUC-001 | Success | Tin tuyển dụng đã được tạo thành công. | Sau POST job |
| G-SUC-002 | Success | Tin tuyển dụng đã được cập nhật. | Sau PATCH job |
| G-SUC-003 | Success | Kênh đăng tin đã được thêm thành công. | Sau POST channel |
| G-ERR-001 | Error | Không thể tải danh sách tin tuyển dụng. Vui lòng thử lại. | API fetch lỗi |
| G-ERR-002 | Error | Không thể tạo tin tuyển dụng. Vui lòng kiểm tra lại thông tin. | POST lỗi |
| G-ERR-003 | Error | Không thể cập nhật tin tuyển dụng. Vui lòng thử lại. | PATCH lỗi |
| G-ERR-004 | Error | Không thể tải danh sách kênh đăng. Vui lòng thử lại. | GET channels lỗi |
| G-ERR-005 | Error | Kênh đăng này đã tồn tại cho tin tuyển dụng. | 409 Conflict |
| G-ERR-006 | Error | Tin tuyển dụng không tồn tại. | 404 |
| G-VAL-001 | Validation | Tiêu đề tin tuyển dụng không được để trống. | title trống |
| G-VAL-002 | Validation | Mô tả công việc không được để trống. | description trống |
| G-VAL-003 | Validation | Vui lòng chọn loại hợp đồng. | employment_type trống |
| G-VAL-004 | Validation | Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu. | salary_min > salary_max |
| G-VAL-005 | Validation | Số lượng tuyển phải là số nguyên dương. | headcount không hợp lệ |
| G-VAL-006 | Validation | Hạn đăng tuyển phải là ngày trong tương lai. | expires_at đã qua |
| G-VAL-007 | Validation | Tên kênh đăng không được để trống. | channel name trống |
| G-VAL-008 | Validation | URL bài đăng không đúng định dạng. | URL không hợp lệ |

---

<a id="sheet-07"></a>
## Sheet 07 - API

### 1. Danh sách API

| API No | Method | Endpoint | Auth | Mô tả |
|---|---|---|---|---|
| G-01 | GET | /api/dashboard/jobs | hr, admin | Danh sách tin tuyển dụng có filter |
| G-02 | POST | /api/dashboard/jobs | hr, admin | Tạo tin tuyển dụng mới |
| G-03 | GET | /api/dashboard/jobs/[id] | hr, admin | Chi tiết tin tuyển dụng |
| G-04 | PATCH | /api/dashboard/jobs/[id] | hr, admin | Cập nhật tin tuyển dụng |
| G-05 | GET | /api/dashboard/jobs/[id]/channels | hr, admin | Danh sách kênh đăng |
| G-06 | POST | /api/dashboard/jobs/[id]/channels | hr, admin | Thêm kênh đăng |

### 2. API G-01 - GET /api/dashboard/jobs

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/jobs |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Danh sách tin tuyển dụng; lọc theo status; mỗi item có số lượng ứng viên đã nộp |
| Query Params | `status`: draft \| active \| closed \| archived; `page` default 1; `limit` default 20 |
| Biến trả về | `items[]` (kèm `_count.applications`), `total`, `page`, `limit` |
| Xử lý lỗi | 401, 403, 500 |
| Xử lý thành công | 200 |

### 3. API G-02 - POST /api/dashboard/jobs

| Field | Nội dung |
|---|---|
| Method | POST |
| Endpoint | /api/dashboard/jobs |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Tạo tin tuyển dụng mới; auto-generate slug từ title; SET created_by = currentUser.id |
| Body | `{ title, description, requirements?, benefits?, location?, department?, salary_min?, salary_max?, employment_type, required_skills?, headcount?, status, expires_at? }` |
| Validation | title bắt buộc; description bắt buộc; employment_type ∈ enum; status ∈ ['draft','active']; salary_min ≤ salary_max nếu cả hai có |
| Xử lý lỗi | 400 (validation), 401, 403, 500 |
| Xử lý thành công | 201 + job record |

### 4. API G-03 - GET /api/dashboard/jobs/[id]

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/jobs/[id] |
| Auth | JWT Cookie; role: hr, admin |
| Mô tả | Chi tiết 1 tin tuyển dụng kèm thông tin người tạo, danh sách kênh và số lượng ứng viên |
| Path Params | `id`: UUID của job |
| Biến trả về | job object đầy đủ + createdBy + channels + _count |
| Xử lý lỗi | 401, 403, 404, 500 |
| Xử lý thành công | 200 |

### 5. API G-04 - PATCH /api/dashboard/jobs/[id]

| Field | Nội dung |
|---|---|
| Method | PATCH |
| Endpoint | /api/dashboard/jobs/[id] |
| Auth | JWT Cookie; role: hr, admin |
| Mô tả | Cập nhật một phần thông tin tin tuyển dụng; kiểm tra ràng buộc khi đổi status sang archived |
| Body | Bất kỳ field nào trong schema jobs (partial update) |
| Validation | Xem Method 4 trong Sheet 03 |
| Xử lý lỗi | 400, 401, 403, 404, 409 (có ứng viên active khi archive), 500 |
| Xử lý thành công | 200 + job đã cập nhật |

### 6. API G-05 - GET /api/dashboard/jobs/[id]/channels

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/jobs/[id]/channels |
| Auth | JWT Cookie; role: hr, admin |
| Mô tả | Lấy danh sách kênh đăng tin của 1 job cụ thể |
| Biến trả về | Array job_channels records |
| Xử lý thành công | 200 + array channels |

### 7. API G-06 - POST /api/dashboard/jobs/[id]/channels

| Field | Nội dung |
|---|---|
| Method | POST |
| Endpoint | /api/dashboard/jobs/[id]/channels |
| Auth | JWT Cookie; role: hr, admin |
| Mô tả | Thêm kênh đăng tin mới cho job; kiểm tra trùng lặp |
| Body | `{ channel: string, external_url?: string, expires_at?: datetime }` |
| Validation | channel bắt buộc; không được trùng với kênh đã có cho job này; external_url là URL hợp lệ nếu có |
| Xử lý lỗi | 400, 401, 403, 404 (job không tồn tại), 409 (channel trùng), 500 |
| Xử lý thành công | 201 + channel record mới |

---

<a id="sheet-08"></a>
## Sheet 08 - Request

### API G-01 - GET /api/dashboard/jobs

**Header:**
```
Cookie: session=<JWT_TOKEN>
```

**Query Params:**
| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| status | string | Không | draft \| active \| closed \| archived |
| page | number | Không | Default 1 |
| limit | number | Không | Default 20 |

**Ví dụ:**
```
GET /api/dashboard/jobs?status=active&page=1&limit=20
```

---

### API G-02 - POST /api/dashboard/jobs

**Body:**
```json
{
  "title": "Frontend Developer - Senior",
  "description": "<p>Chúng tôi đang tìm kiếm Senior Frontend Developer...</p>",
  "requirements": "- Ít nhất 3 năm kinh nghiệm React\n- Thành thạo TypeScript",
  "benefits": "- Lương cạnh tranh\n- Remote friendly\n- 15 ngày phép năm",
  "location": "Hà Nội",
  "department": "Engineering",
  "salary_min": 25000000,
  "salary_max": 45000000,
  "employment_type": "full_time",
  "required_skills": ["React", "TypeScript", "Next.js", "TailwindCSS"],
  "headcount": 2,
  "status": "active",
  "expires_at": "2026-07-31T23:59:59Z"
}
```

---

### API G-04 - PATCH /api/dashboard/jobs/[id]

**Body:**
```json
{
  "status": "closed",
  "salary_max": 50000000
}
```

---

### API G-06 - POST /api/dashboard/jobs/[id]/channels

**Body:**
```json
{
  "channel": "LinkedIn",
  "external_url": "https://www.linkedin.com/jobs/view/123456789",
  "expires_at": "2026-07-31T23:59:59Z"
}
```

---

<a id="sheet-09"></a>
## Sheet 09 - Response

### API G-01 - GET /api/dashboard/jobs

**Success (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-job-001",
        "title": "Frontend Developer - Senior",
        "slug": "frontend-developer-senior",
        "department": "Engineering",
        "location": "Hà Nội",
        "employment_type": "full_time",
        "salary_min": 25000000,
        "salary_max": 45000000,
        "status": "active",
        "headcount": 2,
        "expires_at": "2026-07-31T23:59:59Z",
        "created_at": "2026-05-01T08:00:00Z",
        "createdBy": { "full_name": "Nguyễn Thị HR" },
        "_count": { "applications": 15 }
      }
    ],
    "total": 8,
    "page": 1,
    "limit": 20
  }
}
```

---

### API G-02 - POST /api/dashboard/jobs

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-job-002",
    "title": "Frontend Developer - Senior",
    "slug": "frontend-developer-senior",
    "status": "active",
    "created_at": "2026-05-17T10:00:00Z",
    "created_by": "uuid-user-hr-1"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Dữ liệu không hợp lệ.",
  "fieldErrors": {
    "title": "Tiêu đề không được để trống.",
    "salary_max": "Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu."
  }
}
```

---

### API G-06 - POST .../channels

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-channel-1",
    "job_id": "uuid-job-001",
    "channel": "LinkedIn",
    "external_url": "https://www.linkedin.com/jobs/view/123456789",
    "status": "pending",
    "posted_at": null,
    "expires_at": "2026-07-31T23:59:59Z"
  }
}
```

**Error (409):**
```json
{ "success": false, "error": "Kênh đăng LinkedIn đã tồn tại cho tin tuyển dụng này." }
```

---

<a id="sheet-10"></a>
## Sheet 10 - SQL

### 1. Danh sách SQL

| SQL No | Tên SQL / Mục đích | Loại | API sử dụng | Ghi chú |
|---:|---|---|---|---|
| G-01 | Lấy danh sách jobs có filter | SELECT | G-01 | JOIN users, COUNT applications |
| G-02 | Kiểm tra trùng slug | SELECT | G-02 | Trước khi INSERT |
| G-03 | Tạo job mới | INSERT | G-02 | INSERT jobs |
| G-04 | Lấy chi tiết job | SELECT | G-03 | JOIN + channels + count |
| G-05 | Cập nhật job | UPDATE | G-04 | Partial update |
| G-06 | Lấy danh sách channels | SELECT | G-05 | WHERE job_id |
| G-07 | Kiểm tra trùng channel | SELECT | G-06 | Trước khi INSERT |
| G-08 | Thêm kênh đăng | INSERT | G-06 | INSERT job_channels |

### 2. SQL No. G-01 - Lấy danh sách jobs có filter

#### 2.3. Table sử dụng
| No | Table name | Alias | Create | Read | Update | Delete |
|---:|---|---|---|---|---|---|
| 1 | jobs | j | - | x | - | - |
| 2 | users | u | - | x | - | - |
| 3 | applications | a | - | x | - | - |

#### 2.5. SQL
```sql
-- Prisma ORM tương đương:
-- prisma.job.findMany({
--   where: { status },
--   include: { createdBy: { select: { full_name: true } }, _count: { select: { applications: true } } },
--   orderBy: { created_at: 'desc' },
--   skip, take
-- })

SELECT j.id, j.title, j.slug, j.department, j.location, j.employment_type,
       j.salary_min, j.salary_max, j.status, j.headcount, j.expires_at, j.created_at,
       u.full_name AS created_by_name,
       COUNT(a.id) AS application_count
FROM jobs j
LEFT JOIN users u ON j.created_by = u.id
LEFT JOIN applications a ON j.id = a.job_id
WHERE (j.status = :status OR :status IS NULL)
GROUP BY j.id, u.full_name
ORDER BY j.created_at DESC
LIMIT :limit OFFSET :offset;
```

#### 2.7. Ghi chú xử lý
| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Performance note | Index trên `status`, `created_at` trong jobs; index `job_id` trong applications |

---

### 3. SQL No. G-02 - Kiểm tra trùng slug

#### 2.5. SQL
```sql
-- Trước khi INSERT, kiểm tra slug đã tồn tại chưa
SELECT id FROM jobs WHERE slug = :slug LIMIT 1;
-- Nếu có → thêm suffix: slug = slug + '-' + randomStr(4)
```

---

### 4. SQL No. G-03 - Tạo job mới

#### 2.5. SQL
```sql
-- prisma.job.create({ data: { ... } })

INSERT INTO jobs (id, title, slug, description, requirements, benefits, location, department,
                  salary_min, salary_max, employment_type, required_skills, headcount,
                  status, expires_at, created_by)
VALUES (UUID(), :title, :slug, :description, :requirements, :benefits, :location, :department,
        :salaryMin, :salaryMax, :employmentType, :requiredSkillsJson, :headcount,
        :status, :expiresAt, :createdBy);
```

---

### 5. SQL No. G-04 - Lấy chi tiết job

#### 2.5. SQL
```sql
SELECT j.*,
       u.id AS creator_id, u.full_name AS creator_name, u.email AS creator_email,
       COUNT(a.id) AS application_count
FROM jobs j
LEFT JOIN users u ON j.created_by = u.id
LEFT JOIN applications a ON j.id = a.job_id
WHERE j.id = :id
GROUP BY j.id, u.id;

-- Lấy channels riêng:
SELECT * FROM job_channels WHERE job_id = :id ORDER BY created_at DESC;
```

---

### 6. SQL No. G-05 - Cập nhật job

#### 2.5. SQL
```sql
-- prisma.job.update({ where: { id }, data: { ...fields } })
-- Ví dụ cập nhật status và salary_max:

UPDATE jobs
SET status = :status,
    salary_max = :salaryMax
WHERE id = :id;

-- Cập nhật required_skills (JSON):
UPDATE jobs SET required_skills = :skillsJson WHERE id = :id;
```

---

### 7. SQL No. G-07 - Kiểm tra trùng channel

#### 2.5. SQL
```sql
SELECT id FROM job_channels WHERE job_id = :jobId AND channel = :channel LIMIT 1;
```

---

### 8. SQL No. G-08 - Thêm kênh đăng

#### 2.5. SQL
```sql
-- prisma.jobChannel.create({ data: { ... } })

INSERT INTO job_channels (id, job_id, channel, external_url, status, expires_at)
VALUES (UUID(), :jobId, :channel, :externalUrl, 'pending', :expiresAt);
```

#### 2.7. Ghi chú xử lý
| Nội dung | Ghi chú |
|---|---|
| Transaction | Không (standalone insert) |
| Index cần lưu ý | Unique constraint trên (job_id, channel) để tránh trùng ở tầng DB |

---

<a id="lich-su-thay-doi"></a>
## 11. Lịch sử thay đổi

| Ngày | Nội dung thay đổi | Ghi chú |
|---|---|---|
| 2026-05-17 | Khởi tạo tài liệu | Tạo mới toàn bộ 10 sheet cho Module G - Jobs |
