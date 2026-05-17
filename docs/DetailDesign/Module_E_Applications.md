# DETAIL DESIGN DOCUMENT
# Module E - Applications

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
| 1 | Hiển thị danh sách hồ sơ ứng tuyển dạng pipeline với bộ lọc theo job, trạng thái, nguồn ứng tuyển. |
| 2 | Xem hồ sơ ứng viên: thông tin cá nhân, CV, cover letter, lịch sử trạng thái, lịch phỏng vấn, nhật ký email. |
| 3 | Thay đổi trạng thái hồ sơ (applied → screening → interviewing → offered → hired/rejected) kèm ghi chú. |
| 4 | Gửi email thông báo cho ứng viên (mời PV, kết quả, từ chối...) trực tiếp từ màn hình chi tiết. |
| 5 | Tạo lịch phỏng vấn cho ứng viên từ màn hình chi tiết hồ sơ. |
| 6 | Xem lịch sử toàn bộ thay đổi trạng thái của hồ sơ. |

### 2. Danh sách table sử dụng

| No | Table | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | applications | - | x | x | - | Xem, cập nhật trạng thái |
| 2 | application_status_history | x | x | - | - | Ghi log thay đổi trạng thái |
| 3 | users | - | x | - | - | Thông tin ứng viên |
| 4 | jobs | - | x | - | - | Thông tin tin tuyển dụng |
| 5 | interviews | x | x | - | - | Tạo và xem lịch PV từ hồ sơ |
| 6 | email_logs | x | x | - | - | Gửi và xem nhật ký email |

### 3. Đối tượng / Bộ phận sử dụng

| Đối tượng | Xem danh sách | Xem chi tiết đơn ứng tuyển | Đổi trạng thái | Gửi email | Tạo PV |
|---|---|---|---|---|---|
| Guest | - | - | - | - | - |
| Candidate | - | - | - | - | - |
| HR | x | x | x | x | x |
| Admin | x | x | x | x | x |
| Interviewer | - | - | - | - | - |

---

<a id="sheet-02"></a>
## Sheet 02 - IPO

### 1. Danh sách nhóm chức năng

| No | Nhóm chức năng | Mô tả |
|---:|---|---|
| 1 | Xem danh sách hồ sơ | Lọc, phân trang, hiển thị pipeline |
| 2 | Xem chi tiết hồ sơ | Thông tin đầy đủ ứng viên + 3 tab |
| 3 | Đổi trạng thái hồ sơ | Cập nhật status + ghi log |
| 4 | Gửi email cho ứng viên | Soạn và gửi email qua Resend |
| 5 | Tạo lịch phỏng vấn từ hồ sơ | Tạo interview record liên kết application |
| 6 | Xem nhật ký email của hồ sơ | Lịch sử các email đã gửi cho ứng viên |

### 2. Nhóm 1 - Xem danh sách hồ sơ

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; query: `jobId`, `status`, `source`, `page`, `limit` |
| **Process** | WHERE theo filter; JOIN jobs + users (candidate); ORDER BY applied_at DESC; phân trang |
| **Output** | `{ items: [...], total, page, limit }` mỗi item gồm: id, ứng viên, job, status, applied_at, source |

### 3. Nhóm 2 - Xem chi tiết hồ sơ đơn ứng tuyển

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; path param `id` (application id) |
| **Process** | findUnique application JOIN jobs, candidate, interviews (với interviewer), email_logs; lấy application_status_history |
| **Output** | Object đầy đủ: thông tin ứng viên, job, CV URL, status history, danh sách interviews, danh sách emails |

### 4. Nhóm 3 - Đổi trạng thái hồ sơ

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; path param `id`; body: `{ toStatus, note }` |
| **Process** | Validate toStatus hợp lệ theo flow; UPDATE applications SET status; INSERT application_status_history; nếu toStatus = hired/rejected → trigger email tự động (optional) |
| **Output** | Application đã cập nhật, history record mới |

### 5. Nhóm 4 - Gửi email cho ứng viên

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; path param `id`; body: `{ type, subject, body }` |
| **Process** | Lấy email ứng viên từ application; gọi Resend API; INSERT email_logs với status pending → sent/failed |
| **Output** | email_log record mới với status sent hoặc failed |

### 6. Nhóm 5 - Tạo lịch phỏng vấn từ hồ sơ

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; path param `id`; body: `{ interviewer_id, scheduled_at, duration_minutes, type, meeting_link, location, notes }` |
| **Process** | Validate application tồn tại; INSERT interviews với application_id; trả về interview mới |
| **Output** | Interview record mới |

---

<a id="sheet-03"></a>
## Sheet 03 - IPO Chi tiết

### Danh sách method

| No | Method | API | Mô tả |
|---:|---|---|---|
| 1 | List Applications | GET /api/dashboard/applications | Danh sách hồ sơ có filter + phân trang |
| 2 | Get Application Detail | GET /api/dashboard/applications/[id] | Chi tiết đơn ứng tuyển |
| 3 | Change Status | POST /api/dashboard/applications/[id]/status | Đổi trạng thái |
| 4 | Send Email | POST /api/dashboard/applications/[id]/email | Gửi email |
| 5 | Create Interview | POST /api/dashboard/applications/[id]/interviews | Tạo lịch PV |
| 6 | Get Email Logs | GET /api/dashboard/applications/[id]/emails | Lịch sử email |

### Method 1 - GET /api/dashboard/applications

**Init:**
- Xác thực JWT; kiểm tra role ∈ [hr, admin]

**Search:**
- Query params: `jobId` (UUID), `status` (enum), `source` (string), `page` (int ≥1), `limit` (int, default 20)

**Process:**
```
where = {}
if jobId → where.job_id = jobId
if status → where.status = status
if source → where.source_channel = source
applications = prisma.application.findMany({ where, include: { job, candidate }, orderBy: { applied_at: 'desc' }, skip, take })
total = prisma.application.count({ where })
```

**Output:** `{ success: true, data: { items, total, page, limit } }`

### Method 2 - GET /api/dashboard/applications/[id]

**Init:**
- Xác thực JWT; role hr/admin

**Process:**
```
application = prisma.application.findUnique({
  where: { id },
  include: {
    job: true,
    candidate: true,
    statusHistory: { orderBy: { changed_at: 'desc' } },
    interviews: { include: { interviewer: true, scores: true } },
    emailLogs: { orderBy: { sent_at: 'desc' } }
  }
})
if !application → 404
```

**Output:** Object application đầy đủ

### Method 3 - POST /api/dashboard/applications/[id]/status

**Init:**
- Xác thực JWT; role hr/admin

**Validate:**
- `toStatus` bắt buộc, phải ∈ enum applications_status
- `note` tùy chọn, max 500 ký tự

**Process:**
```
(transaction)
prisma.application.update({ where: { id }, data: { status: toStatus } })
prisma.applicationStatusHistory.create({
  data: { application_id: id, changed_by: currentUser.id, from_status: current, to_status: toStatus, note }
})
```

**Output:** `{ success: true, data: { application, historyRecord } }`

### Method 4 - POST /api/dashboard/applications/[id]/email

**Init:**
- Xác thực JWT; role hr/admin

**Validate:**
- `type` bắt buộc ∈ ['invite','result','reminder','rejection','offer']
- `subject` bắt buộc, max 200 ký tự
- `body` bắt buộc, max 5000 ký tự

**Process:**
```
application = prisma.application.findUnique({ where: { id }, include: { candidate: true } })
emailLogId = UUID
prisma.emailLog.create({ data: { status: 'pending', ... } })
resend.emails.send({ to: candidate.email, subject, html: body })
prisma.emailLog.update({ where: { id: emailLogId }, data: { status: 'sent', sent_at: now } })
// Nếu lỗi: update status = 'failed', error_message = error.message
```

**Output:** email_log record

### Method 5 - POST /api/dashboard/applications/[id]/interviews

**Validate:**
- `interviewer_id`, `scheduled_at`, `type` bắt buộc
- `duration_minutes` default 60
- `type` ∈ ['phone','video','onsite','technical']

**Process:**
```
prisma.interview.create({
  data: { application_id: id, interviewer_id, scheduled_at, duration_minutes, type, status: 'scheduled', meeting_link, location, notes }
})
```

**Output:** Interview record mới

---

<a id="sheet-04"></a>
## Sheet 04 - Chi tiết điều khiển

### Màn hình /dashboard/applications - Danh sách

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Bộ lọc Job | DROPDOWN | I | Danh sách jobs active | Tất cả | Lọc theo jobId |
| 2 | Bộ lọc Trạng thái | DROPDOWN | I | applied/screening/.../rejected | Tất cả | Lọc theo status |
| 3 | Bộ lọc Nguồn | DROPDOWN | I | Danh sách source_channel | Tất cả | Lọc theo source |
| 4 | Nút Áp dụng | BUTTON | I | - | - | Trigger filter |
| 5 | Bảng danh sách hồ sơ | TABLE | O | - | - | Cols: Ứng viên, Job, Trạng thái, Nguồn, Ngày nộp |
| 6 | Badge trạng thái | TEXT | O | - | - | Color-coded theo status |
| 7 | Phân trang | SECTION | I/O | - | Page 1, 20/trang | Điều hướng trang |
| 8 | Link xem chi tiết | BUTTON | I | - | - | Click row → /dashboard/applications/[id] |

### Màn hình /dashboard/applications/[id] - Chi tiết

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Thông tin ứng viên | SECTION | O | - | - | Tên, email, phone |
| 2 | Thông tin job | SECTION | O | - | - | Title, department |
| 3 | Link tải CV | BUTTON | I | - | - | Mở URL cv_file_url |
| 4 | Cover letter | TEXT | O | - | - | Hiển thị cover_letter |
| 5 | Dropdown đổi trạng thái | DROPDOWN | I | Enum applications_status | Trạng thái hiện tại | Trigger modal xác nhận |
| 6 | Nút Gửi email | BUTTON | I | - | - | Mở modal soạn email |
| 7 | Nút Tạo lịch PV | BUTTON | I | - | - | Điều hướng /dashboard/interviews/new |
| 8 | Tab Lịch sử trạng thái | TAB | I/O | - | Tab mặc định | Timeline thay đổi status |
| 9 | Tab Phỏng vấn | TAB | I/O | - | - | Danh sách interviews liên quan |
| 10 | Tab Email | TAB | I/O | - | - | Nhật ký email |
| 11 | Modal gửi email | MODAL | I/O | - | - | Form: type, subject, body |
| 12 | Modal xác nhận đổi status | MODAL | I/O | - | - | Chọn toStatus + ghi chú |

### Màn hình /dashboard/applications/[id]/status - Đổi trạng thái

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Dropdown Trạng thái mới | DROPDOWN | I | Bắt buộc chọn; enum hợp lệ | - | Hiển thị các bước tiếp theo |
| 2 | Textarea Ghi chú | TEXTBOX | I | Tùy chọn; max 500 ký tự | - | Lý do thay đổi |
| 3 | Nút Lưu | BUTTON | I | Form hợp lệ mới enable | - | Submit đổi trạng thái |
| 4 | Nút Hủy | BUTTON | I | - | - | Quay lại /dashboard/applications/[id] |

---

<a id="sheet-05"></a>
## Sheet 05 - Giao diện màn hình

### 2. Danh sách màn hình

| No | Tên màn hình | Route / URL | Loại màn hình | Khái quát | Trạng thái |
|---:|---|---|---|---|---|
| 1 | Danh sách hồ sơ | /dashboard/applications | Danh sách | Pipeline hồ sơ ứng tuyển với filter | x |
| 2 | Chi tiết hồ sơ ứng tuyển | /dashboard/applications/[id] | Chi tiết | Thông tin đầy đủ ứng viên + 3 tab | x |
| 3 | Đổi trạng thái hồ sơ | /dashboard/applications/[id]/status | Form | Form chuyển trạng thái pipeline | x |

### 3. Màn hình 1 - /dashboard/applications

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/applications |
| Tên màn hình | Danh sách hồ sơ ứng tuyển |
| Loại màn hình | Danh sách |
| Khái quát chức năng | Hiển thị tất cả hồ sơ dạng bảng có filter theo job, trạng thái, nguồn; click vào hồ sơ để xem chi tiết |
| Tác vụ liên quan | Lọc theo job/status/source; phân trang; xem chi tiết |
| Điều kiện hiển thị | User đăng nhập với role hr hoặc admin |
| Điều kiện không có dữ liệu | Empty state: "Chưa có hồ sơ nào. Khi ứng viên nộp đơn, hồ sơ sẽ xuất hiện tại đây." |
| Điều hướng từ màn hình này | /dashboard/applications/[id] khi click hàng trong bảng |
| Điều hướng đến màn hình này | Sidebar menu; KPI card từ Dashboard |
| Liên kết control | Sheet Chi tiết điều khiển, No.1-8 (applications list) |
| Liên kết API | Sheet API, API No.E-01 |
| Liên kết Request | Sheet Request, API No.E-01 |
| Liên kết Response | Sheet Response, API No.E-01 |
| Liên kết Message | Sheet Thông báo, E-ERR-001 |
| Ghi chú | Client Component; React Query; URL sync với filter params |

### 4. Rule hiển thị màn hình 1

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Bình thường | Có hồ sơ | Bảng danh sách với badge status màu sắc | - |
| 2 | Không có dữ liệu | total = 0 | Empty state với icon và message | - |
| 3 | Lỗi tải | API lỗi | Alert lỗi + nút thử lại | - |
| 4 | Đang loading | Fetching | Skeleton table | - |
| 5 | Filter không có kết quả | Filter active nhưng không có match | "Không tìm thấy hồ sơ phù hợp với bộ lọc" + nút xóa filter | - |

### 5. Rule validation màn hình 1

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | jobId trong URL | Phải là UUID hợp lệ nếu có | - | Bỏ qua filter không hợp lệ |
| 2 | status trong URL | Phải thuộc enum nếu có | - | Bỏ qua |

### 6. Màn hình 2 - /dashboard/applications/[id]

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/applications/[id] |
| Tên màn hình | Chi tiết hồ sơ ứng viên |
| Loại màn hình | Chi tiết |
| Khái quát chức năng | Xem toàn bộ thông tin ứng viên, CV, trạng thái hiện tại, và 3 tab: Lịch sử trạng thái / Phỏng vấn / Email |
| Tác vụ liên quan | Xem thông tin; tải CV; đổi trạng thái; gửi email; tạo lịch PV |
| Điều kiện hiển thị | User đăng nhập role hr/admin; application tồn tại |
| Điều kiện không có dữ liệu | 404 nếu application không tồn tại |
| Điều hướng từ màn hình này | /dashboard/applications/[id]/status; /dashboard/interviews/new; /dashboard/interviews/[id] |
| Điều hướng đến màn hình này | Click row từ danh sách hồ sơ |
| Liên kết control | Sheet Chi tiết điều khiển, No.1-12 (chi tiết hồ sơ) |
| Liên kết API | Sheet API, API No.E-02, E-03, E-04, E-06 |
| Liên kết Message | Sheet Thông báo, E-SUC-001, E-SUC-002, E-ERR-002 |
| Ghi chú | Server Component cho phần static; Client Component cho 3 tab |

### 7. Rule hiển thị màn hình 2

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Bình thường | Application tồn tại | Toàn bộ thông tin + 3 tab | - |
| 2 | Không tìm thấy | 404 từ API | Trang 404 "Hồ sơ không tồn tại" | - |
| 3 | Tab Lịch sử trống | Chưa có thay đổi | "Chưa có lịch sử thay đổi trạng thái" | - |
| 4 | Tab PV trống | Chưa có interview | "Chưa có lịch phỏng vấn nào" + nút tạo mới | - |
| 5 | Tab Email trống | Chưa gửi email | "Chưa có email nào được gửi" | - |

### 8. Rule validation màn hình 2 (Modal đổi trạng thái)

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Trạng thái mới | Bắt buộc chọn | E-VAL-001 | Disable nút lưu |
| 2 | Ghi chú | Max 500 ký tự | E-VAL-002 | Hiển thị lỗi dưới field |

### 9. Màn hình 3 - /dashboard/applications/[id]/status

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/applications/[id]/status |
| Tên màn hình | Đổi trạng thái hồ sơ |
| Loại màn hình | Form |
| Khái quát chức năng | Form standalone để thay đổi trạng thái pipeline của hồ sơ |
| Tác vụ liên quan | Chọn trạng thái mới; nhập ghi chú; lưu thay đổi |
| Điều kiện hiển thị | User đăng nhập role hr/admin; application tồn tại |
| Điều hướng từ màn hình này | Sau submit thành công → /dashboard/applications/[id] |
| Điều hướng đến màn hình này | Từ /dashboard/applications/[id] |
| Liên kết API | Sheet API, API No.E-03 |
| Liên kết Message | Sheet Thông báo, E-SUC-001, E-ERR-003 |
| Ghi chú | Client Component; React Hook Form + Zod |

### 10. Rule validation màn hình 3

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Trạng thái mới | Bắt buộc; phải thuộc enum; không được giống trạng thái hiện tại | E-VAL-001 | Hiển thị lỗi; disable submit |
| 2 | Ghi chú | Tùy chọn; max 500 ký tự | E-VAL-002 | Hiển thị đếm ký tự |

---

<a id="sheet-06"></a>
## Sheet 06 - Thông báo

| MessageCD | Loại | Nội dung (tiếng Việt) | Ghi chú |
|---|---|---|---|
| E-SUC-001 | Success | Trạng thái hồ sơ đã được cập nhật thành công. | Sau đổi trạng thái |
| E-SUC-002 | Success | Email đã được gửi thành công đến ứng viên. | Sau gửi email |
| E-SUC-003 | Success | Lịch phỏng vấn đã được tạo thành công. | Sau tạo interview |
| E-ERR-001 | Error | Không thể tải danh sách hồ sơ. Vui lòng thử lại. | API fetch thất bại |
| E-ERR-002 | Error | Hồ sơ không tồn tại hoặc đã bị xóa. | 404 |
| E-ERR-003 | Error | Không thể cập nhật trạng thái. Vui lòng thử lại. | Lỗi API |
| E-ERR-004 | Error | Không thể gửi email. Vui lòng thử lại sau. | Resend API lỗi |
| E-ERR-005 | Error | Không thể tạo lịch phỏng vấn. Vui lòng kiểm tra lại thông tin. | Lỗi tạo interview |
| E-VAL-001 | Validation | Vui lòng chọn trạng thái mới cho hồ sơ. | Bỏ trống trạng thái |
| E-VAL-002 | Validation | Ghi chú không được vượt quá 500 ký tự. | Ghi chú quá dài |
| E-VAL-003 | Validation | Loại email không hợp lệ. | type enum sai |

---

<a id="sheet-07"></a>
## Sheet 07 - API

### 1. Danh sách API

| API No | Method | Endpoint | Auth | Mô tả |
|---|---|---|---|---|
| E-01 | GET | /api/dashboard/applications | hr, admin | Danh sách hồ sơ có filter, phân trang |
| E-02 | GET | /api/dashboard/applications/[id] | hr, admin | Chi tiết hồ sơ ứng tuyển |
| E-03 | POST | /api/dashboard/applications/[id]/status | hr, admin | Đổi trạng thái hồ sơ |
| E-04 | POST | /api/dashboard/applications/[id]/email | hr, admin | Gửi email cho ứng viên |
| E-05 | POST | /api/dashboard/applications/[id]/interviews | hr, admin | Tạo lịch phỏng vấn từ hồ sơ |
| E-06 | GET | /api/dashboard/applications/[id]/emails | hr, admin | Nhật ký email của hồ sơ |

### 2. API E-01 - GET /api/dashboard/applications

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/applications |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Danh sách hồ sơ ứng tuyển có lọc theo jobId, status, source; phân trang |
| Query Params | `jobId`, `status`, `source`, `page` (default 1), `limit` (default 20) |
| Biến trả về | `items[]`, `total`, `page`, `limit` |
| Validation | status ∈ enum nếu có; jobId là UUID nếu có |
| Xử lý lỗi | 401, 403, 500 |
| Xử lý thành công | 200 + JSON envelope |

### 3. API E-02 - GET /api/dashboard/applications/[id]

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/applications/[id] |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Chi tiết đầy đủ 1 hồ sơ: thông tin ứng viên, job, CV, lịch sử trạng thái, interviews, email logs |
| Path Params | `id`: UUID của application |
| Biến trả về | `application` object đầy đủ với include relations |
| Xử lý lỗi | 401, 403, 404 (không tìm thấy), 500 |
| Xử lý thành công | 200 + JSON envelope |

### 4. API E-03 - POST /api/dashboard/applications/[id]/status

| Field | Nội dung |
|---|---|
| Method | POST |
| Endpoint | /api/dashboard/applications/[id]/status |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Cập nhật trạng thái hồ sơ và ghi log vào application_status_history |
| Path Params | `id`: UUID của application |
| Body | `{ toStatus: string, note?: string }` |
| Validation | toStatus bắt buộc ∈ applications_status enum; note max 500 ký tự |
| Xử lý lỗi | 400 (validation fail), 401, 403, 404, 500 |
| Xử lý thành công | 200 + application và history record mới |

### 5. API E-04 - POST /api/dashboard/applications/[id]/email

| Field | Nội dung |
|---|---|
| Method | POST |
| Endpoint | /api/dashboard/applications/[id]/email |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Gửi email thông báo đến ứng viên qua Resend; ghi log vào email_logs |
| Body | `{ type: string, subject: string, body: string }` |
| Validation | type ∈ ['invite','result','reminder','rejection','offer']; subject max 200; body max 5000 |
| Xử lý lỗi | 400, 401, 403, 404, 502 (Resend lỗi), 500 |
| Xử lý thành công | 200 + email_log record |

### 6. API E-05 - POST /api/dashboard/applications/[id]/interviews

| Field | Nội dung |
|---|---|
| Method | POST |
| Endpoint | /api/dashboard/applications/[id]/interviews |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Tạo lịch phỏng vấn mới liên kết với hồ sơ ứng tuyển |
| Body | `{ interviewer_id, scheduled_at, duration_minutes?, type, meeting_link?, location?, notes? }` |
| Validation | interviewer_id là UUID hợp lệ; scheduled_at là datetime hợp lệ và trong tương lai; type ∈ enum |
| Xử lý lỗi | 400, 401, 403, 404, 500 |
| Xử lý thành công | 201 + interview record mới |

### 7. API E-06 - GET /api/dashboard/applications/[id]/emails

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/applications/[id]/emails |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Lấy danh sách email đã gửi cho ứng viên của hồ sơ cụ thể |
| Biến trả về | Array email_logs với thông tin sender |
| Xử lý lỗi | 401, 403, 404, 500 |
| Xử lý thành công | 200 + array emails |

---

<a id="sheet-08"></a>
## Sheet 08 - Request

### API E-01 - GET /api/dashboard/applications

**Header:**
```
Cookie: session=<JWT_TOKEN>
```

**Query Params:**
| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| jobId | string (UUID) | Không | Lọc theo job |
| status | string | Không | applied \| screening \| interviewing \| offered \| hired \| rejected |
| source | string | Không | Nguồn ứng tuyển |
| page | number | Không | Default 1 |
| limit | number | Không | Default 20 |

**Ví dụ:**
```
GET /api/dashboard/applications?status=screening&page=1&limit=20
```

---

### API E-03 - POST /api/dashboard/applications/[id]/status

**Header:**
```
Cookie: session=<JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "toStatus": "interviewing",
  "note": "Hồ sơ phù hợp, mời phỏng vấn vòng 1"
}
```

---

### API E-04 - POST /api/dashboard/applications/[id]/email

**Header:**
```
Cookie: session=<JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "type": "invite",
  "subject": "Thư mời phỏng vấn - Vị trí Frontend Developer tại Company X",
  "body": "<p>Kính chào Nguyễn Văn A,</p><p>Chúng tôi trân trọng mời bạn tham dự phỏng vấn...</p>"
}
```

---

### API E-05 - POST /api/dashboard/applications/[id]/interviews

**Body:**
```json
{
  "interviewer_id": "uuid-interviewer-001",
  "scheduled_at": "2026-05-20T09:00:00Z",
  "duration_minutes": 60,
  "type": "video",
  "meeting_link": "https://meet.google.com/xxx-yyy-zzz",
  "notes": "Phỏng vấn kỹ thuật vòng 1, tập trung vào React và TypeScript"
}
```

---

<a id="sheet-09"></a>
## Sheet 09 - Response

### API E-01 - GET /api/dashboard/applications

**Success (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-app-001",
        "status": "screening",
        "applied_at": "2026-05-15T08:00:00Z",
        "source_channel": "website",
        "cv_filename": "NguyenVanA_CV.pdf",
        "candidate": { "id": "uuid-u1", "full_name": "Nguyễn Văn A", "email": "a@email.com", "phone": "0901234567" },
        "job": { "id": "uuid-job-1", "title": "Frontend Developer", "department": "Engineering" }
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

---

### API E-03 - POST .../status

**Success (200):**
```json
{
  "success": true,
  "data": {
    "application": { "id": "uuid-app-001", "status": "interviewing" },
    "historyRecord": {
      "id": "uuid-hist-1",
      "from_status": "screening",
      "to_status": "interviewing",
      "note": "Hồ sơ phù hợp, mời phỏng vấn vòng 1",
      "changed_at": "2026-05-17T10:00:00Z"
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Dữ liệu không hợp lệ.",
  "fieldErrors": { "toStatus": "Trạng thái không hợp lệ." }
}
```

---

### API E-04 - POST .../email

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-email-log-1",
    "type": "invite",
    "status": "sent",
    "sent_at": "2026-05-17T10:05:00Z",
    "subject": "Thư mời phỏng vấn - Vị trí Frontend Developer"
  }
}
```

**Error (502):**
```json
{ "success": false, "error": "Không thể gửi email. Vui lòng thử lại sau." }
```

---

### API E-05 - POST .../interviews

**Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-interview-1",
    "application_id": "uuid-app-001",
    "scheduled_at": "2026-05-20T09:00:00Z",
    "type": "video",
    "status": "scheduled",
    "duration_minutes": 60,
    "meeting_link": "https://meet.google.com/xxx-yyy-zzz"
  }
}
```

---

<a id="sheet-10"></a>
## Sheet 10 - SQL

### 1. Danh sách SQL

| SQL No | Tên SQL / Mục đích | Loại | API sử dụng | Ghi chú |
|---:|---|---|---|---|
| E-01 | Lấy danh sách hồ sơ có filter | SELECT | E-01 | JOIN jobs, users; phân trang |
| E-02 | Lấy chi tiết hồ sơ ứng tuyển | SELECT | E-02 | Multiple JOIN + includes |
| E-03 | Cập nhật trạng thái hồ sơ | UPDATE + INSERT | E-03 | Transaction: update + log |
| E-04 | Ghi email log | INSERT + UPDATE | E-04 | Tạo log, cập nhật status sau gửi |
| E-05 | Tạo lịch phỏng vấn | INSERT | E-05 | INSERT interviews |
| E-06 | Lấy nhật ký email của hồ sơ | SELECT | E-06 | Filter by application_id |

### 2. SQL No. E-01 - Lấy danh sách hồ sơ có filter

#### 2.1. Mục đích
Lấy danh sách applications có filter theo job, trạng thái, nguồn; JOIN thông tin ứng viên và job; phân trang.

#### 2.3. Table sử dụng
| No | Table name | Alias | Create | Read | Update | Delete |
|---:|---|---|---|---|---|---|
| 1 | applications | a | - | x | - | - |
| 2 | users | u | - | x | - | - |
| 3 | jobs | j | - | x | - | - |

#### 2.5. SQL
```sql
-- Prisma ORM tương đương:
-- prisma.application.findMany({
--   where: { job_id: jobId, status: status, source_channel: source },
--   include: { candidate: true, job: true },
--   orderBy: { applied_at: 'desc' },
--   skip: (page - 1) * limit,
--   take: limit
-- })

SELECT a.id, a.status, a.applied_at, a.source_channel, a.cv_filename,
       u.id AS candidate_id, u.full_name, u.email, u.phone,
       j.id AS job_id, j.title, j.department
FROM applications a
JOIN users u ON a.candidate_id = u.id
JOIN jobs j ON a.job_id = j.id
WHERE (a.job_id = :jobId OR :jobId IS NULL)
  AND (a.status = :status OR :status IS NULL)
  AND (a.source_channel = :source OR :source IS NULL)
ORDER BY a.applied_at DESC
LIMIT :limit OFFSET :offset;
```

#### 2.7. Ghi chú xử lý
| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Performance note | Index trên `job_id`, `status`, `applied_at` trong applications |

---

### 3. SQL No. E-02 - Lấy chi tiết hồ sơ ứng tuyển

#### 2.5. SQL
```sql
-- Prisma ORM tương đương:
-- prisma.application.findUnique({
--   where: { id },
--   include: {
--     job: true,
--     candidate: true,
--     statusHistory: { orderBy: { changed_at: 'desc' }, include: { changedBy: true } },
--     interviews: { include: { interviewer: true, scores: true } },
--     emailLogs: { orderBy: { sent_at: 'desc' }, include: { sender: true } }
--   }
-- })

SELECT a.*, 
       j.title AS job_title, j.department,
       u.full_name, u.email, u.phone
FROM applications a
JOIN jobs j ON a.job_id = j.id
JOIN users u ON a.candidate_id = u.id
WHERE a.id = :id;

-- Riêng biệt:
SELECT * FROM application_status_history WHERE application_id = :id ORDER BY changed_at DESC;
SELECT i.*, ui.full_name AS interviewer_name FROM interviews i JOIN users ui ON i.interviewer_id = ui.id WHERE i.application_id = :id;
SELECT el.*, us.full_name AS sender_name FROM email_logs el LEFT JOIN users us ON el.sender_id = us.id WHERE el.application_id = :id ORDER BY el.sent_at DESC;
```

---

### 4. SQL No. E-03 - Cập nhật trạng thái + ghi log

#### 2.5. SQL
```sql
-- Transaction:
-- prisma.$transaction([
--   prisma.application.update({ where: { id }, data: { status: toStatus } }),
--   prisma.applicationStatusHistory.create({ data: { application_id: id, changed_by, from_status, to_status, note } })
-- ])

START TRANSACTION;

UPDATE applications SET status = :toStatus WHERE id = :id;

INSERT INTO application_status_history (id, application_id, changed_by, from_status, to_status, note, changed_at)
VALUES (UUID(), :id, :changedById, :fromStatus, :toStatus, :note, NOW());

COMMIT;
```

#### 2.7. Ghi chú xử lý
| Nội dung | Ghi chú |
|---|---|
| Transaction | Có — đảm bảo cả 2 thao tác thành công hoặc rollback |
| Rollback | Nếu bất kỳ câu lệnh nào lỗi |

---

### 5. SQL No. E-04 - Ghi email log

#### 2.5. SQL
```sql
-- INSERT log với status pending, sau đó UPDATE sau khi gọi Resend API
INSERT INTO email_logs (id, application_id, recipient_id, sender_id, subject, type, status)
VALUES (UUID(), :applicationId, :recipientId, :senderId, :subject, :type, 'pending');

-- Sau khi gửi thành công:
UPDATE email_logs SET status = 'sent', sent_at = NOW() WHERE id = :emailLogId;

-- Nếu lỗi:
UPDATE email_logs SET status = 'failed', error_message = :errorMsg WHERE id = :emailLogId;
```

---

### 6. SQL No. E-05 - Tạo lịch phỏng vấn

#### 2.5. SQL
```sql
-- prisma.interview.create({ data: { ... } })

INSERT INTO interviews (id, application_id, interviewer_id, scheduled_at, duration_minutes, type, status, meeting_link, location, notes)
VALUES (UUID(), :applicationId, :interviewerId, :scheduledAt, :durationMinutes, :type, 'scheduled', :meetingLink, :location, :notes);
```

---

<a id="lich-su-thay-doi"></a>
## 11. Lịch sử thay đổi

| Ngày | Nội dung thay đổi | Ghi chú |
|---|---|---|
| 2026-05-17 | Khởi tạo tài liệu | Tạo mới toàn bộ 10 sheet cho Module E - Applications |
