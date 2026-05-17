# DETAIL DESIGN DOCUMENT
# Module F - Interviews

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
| 1 | Hiển thị danh sách lịch phỏng vấn với bộ lọc theo trạng thái và ngày, dành cho HR/Admin. |
| 2 | Tạo mới lịch phỏng vấn: chọn ứng viên (từ application), interviewer, thời gian, hình thức và link họp. |
| 3 | Xem chi tiết buổi phỏng vấn: thông tin đầy đủ ứng viên, interviewer, scorecard (nếu đã chấm). |
| 4 | Cập nhật thông tin phỏng vấn: thay đổi lịch, trạng thái (reschedule/cancel/complete). |
| 5 | Chấm điểm phỏng vấn: interviewer nhập điểm kỹ thuật, giao tiếp, văn hoá, nhận xét, kết luận pass/fail/hold. |
| 6 | Lấy dữ liệu dropdown (danh sách interviewer) cho form tạo/sửa phỏng vấn. |

### 2. Danh sách table sử dụng

| No | Table | Create | Read | Update | Delete | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | interviews | x | x | x | - | CRUD chính của module |
| 2 | interview_scores | x | x | x | - | Chấm điểm PV |
| 3 | applications | - | x | - | - | Liên kết ứng viên |
| 4 | users | - | x | - | - | Interviewer và ứng viên |
| 5 | jobs | - | x | - | - | Tên vị trí liên quan |

### 3. Đối tượng / Bộ phận sử dụng

| Đối tượng | Xem danh sách | Xem chi tiết | Tạo/Sửa PV | Chấm điểm |
|---|---|---|---|---|
| Guest | - | - | - | - |
| Candidate | - | - | - | - |
| HR | x | x | x | - |
| Admin | x | x | x | - |
| Interviewer | x (chỉ của mình) | x (chỉ của mình) | - | x |

---

<a id="sheet-02"></a>
## Sheet 02 - IPO

### 1. Danh sách nhóm chức năng

| No | Nhóm chức năng | Mô tả |
|---:|---|---|
| 1 | Xem danh sách phỏng vấn | Liệt kê interviews có filter theo status/date |
| 2 | Tạo phỏng vấn mới | Tạo record interview mới |
| 3 | Xem chi tiết phỏng vấn | Thông tin đầy đủ + scorecard |
| 4 | Cập nhật phỏng vấn | Sửa thông tin, đổi trạng thái |
| 5 | Chấm điểm phỏng vấn | Tạo/cập nhật interview_scores |
| 6 | Lấy metadata | Dropdown interviewer list cho form |

### 2. Nhóm 1 - Xem danh sách phỏng vấn

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; query: `status`, `date`, `page`, `limit` |
| **Process** | WHERE theo filter; nếu role = interviewer → thêm WHERE interviewer_id = currentUser.id; JOIN applications + users + jobs; ORDER BY scheduled_at ASC |
| **Output** | `{ items: [...], total, page, limit }` |

### 3. Nhóm 2 - Tạo phỏng vấn mới

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session (hr/admin); body: `{ application_id, interviewer_id, scheduled_at, duration_minutes, type, meeting_link, location, notes }` |
| **Process** | Validate application tồn tại; validate interviewer tồn tại và có role = interviewer; INSERT interviews với status = 'scheduled' |
| **Output** | Interview record mới với id |

### 4. Nhóm 3 - Xem chi tiết phỏng vấn

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session; path param `id` |
| **Process** | findUnique interview JOIN application (+ candidate, job), interviewer, scores |
| **Output** | Object interview đầy đủ |

### 5. Nhóm 4 - Cập nhật phỏng vấn

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session (hr/admin); path param `id`; body: các trường cần cập nhật |
| **Process** | Validate interview tồn tại; UPDATE các trường được cung cấp; nếu status thay đổi → ghi log |
| **Output** | Interview record đã cập nhật |

### 6. Nhóm 5 - Chấm điểm phỏng vấn

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session (interviewer); path param `id`; body: `{ technical_score, communication_score, cultural_fit_score, overall_score, strengths, weaknesses, feedback, result, is_final }` |
| **Process** | Validate interview tồn tại; kiểm tra evaluator_id = currentUser.id; UPSERT interview_scores; nếu is_final = true → UPDATE interview.status = 'completed' |
| **Output** | interview_score record |

### 7. Nhóm 6 - Lấy metadata

| Thành phần | Nội dung |
|---|---|
| **Input** | JWT session (hr/admin) |
| **Process** | Lấy danh sách users có role = 'interviewer' và is_active = true |
| **Output** | `{ interviewers: [{ id, full_name, email }] }` |

---

<a id="sheet-03"></a>
## Sheet 03 - IPO Chi tiết

### Danh sách method

| No | Method | API | Mô tả |
|---:|---|---|---|
| 1 | List Interviews | GET /api/dashboard/interviews | Danh sách PV |
| 2 | Create Interview | POST /api/dashboard/interviews | Tạo PV mới |
| 3 | Get Interview | GET /api/dashboard/interviews/[id] | Chi tiết PV |
| 4 | Update Interview | PATCH /api/dashboard/interviews/[id] | Cập nhật PV |
| 5 | Score Interview | POST /api/dashboard/interviews/[id]/score | Chấm điểm |
| 6 | Get Metadata | GET /api/dashboard/interviews/metadata | Dropdown data |

### Method 1 - GET /api/dashboard/interviews

**Init:**
- Xác thực JWT; role ∈ [hr, admin, interviewer]

**Search:**
- `status` ∈ ['scheduled','completed','cancelled','rescheduled'] nếu có
- `date`: định dạng YYYY-MM-DD nếu có
- `page` ≥ 1, `limit` ∈ [10,20,50]

**Process:**
```
where = {}
if status → where.status = status
if date → where.scheduled_at = { gte: startOfDay(date), lte: endOfDay(date) }
if role === 'interviewer' → where.interviewer_id = currentUser.id
interviews = prisma.interview.findMany({ where, include: { application: { include: { candidate: true, job: true } }, interviewer: true }, orderBy: { scheduled_at: 'asc' }, skip, take })
```

**Output:** `{ success: true, data: { items, total, page, limit } }`

### Method 2 - POST /api/dashboard/interviews

**Init:**
- Xác thực JWT; role ∈ [hr, admin]

**Validate:**
- `application_id` bắt buộc, UUID, phải tồn tại
- `interviewer_id` bắt buộc, UUID, user phải tồn tại và role = 'interviewer'
- `scheduled_at` bắt buộc, datetime hợp lệ, phải trong tương lai
- `type` bắt buộc ∈ ['phone','video','onsite','technical']
- `duration_minutes` default 60

**Process:**
```
prisma.interview.create({
  data: { application_id, interviewer_id, scheduled_at, duration_minutes: 60, type, status: 'scheduled', meeting_link, location, notes }
})
```

**Output:** `{ success: true, data: interviewRecord }` (201)

### Method 3 - GET /api/dashboard/interviews/[id]

**Process:**
```
interview = prisma.interview.findUnique({
  where: { id },
  include: {
    application: { include: { candidate: true, job: true } },
    interviewer: true,
    scores: { include: { evaluator: true } }
  }
})
// Role interviewer: kiểm tra interviewer_id === currentUser.id, nếu không → 403
if !interview → 404
```

### Method 4 - PATCH /api/dashboard/interviews/[id]

**Validate:**
- Chỉ role hr/admin mới được cập nhật
- `scheduled_at` nếu có phải trong tương lai
- `status` nếu có ∈ ['scheduled','completed','cancelled','rescheduled']

**Process:**
```
prisma.interview.update({ where: { id }, data: { ...validatedFields } })
```

### Method 5 - POST /api/dashboard/interviews/[id]/score

**Init:**
- Xác thực JWT; role = interviewer (hoặc hr/admin cho override)
- Nếu role = interviewer: kiểm tra interview.interviewer_id === currentUser.id

**Validate:**
- Điểm: technical_score, communication_score, cultural_fit_score ∈ [1,10]
- overall_score ∈ [1,10]
- result ∈ ['pass','fail','hold'] bắt buộc

**Process:**
```
// UPSERT: nếu đã có score của evaluator này thì UPDATE, chưa có thì CREATE
existingScore = prisma.interviewScore.findFirst({ where: { interview_id: id, evaluator_id: currentUser.id } })
if existingScore → prisma.interviewScore.update(...)
else → prisma.interviewScore.create(...)
if is_final → prisma.interview.update({ where: { id }, data: { status: 'completed' } })
```

---

<a id="sheet-04"></a>
## Sheet 04 - Chi tiết điều khiển

### Màn hình /dashboard/interviews - Danh sách

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Bộ lọc Trạng thái | DROPDOWN | I | scheduled/completed/cancelled/rescheduled | Tất cả | Filter status |
| 2 | Bộ lọc Ngày | TEXTBOX | I | Định dạng YYYY-MM-DD hoặc date picker | Hôm nay | Filter ngày PV |
| 3 | Nút Áp dụng | BUTTON | I | - | - | Trigger search |
| 4 | Bảng danh sách PV | TABLE | O | - | - | Cols: Ứng viên, Vị trí, Interviewer, Ngày giờ, Hình thức, Trạng thái |
| 5 | Badge trạng thái | TEXT | O | - | - | scheduled=blue, completed=green, cancelled=red, rescheduled=orange |
| 6 | Phân trang | SECTION | I/O | - | Page 1, 20/trang | - |
| 7 | Nút Tạo PV mới | BUTTON | I | - | - | Điều hướng /dashboard/interviews/new (chỉ hr/admin) |

### Màn hình /dashboard/interviews/new - Tạo mới

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Chọn hồ sơ ứng tuyển | DROPDOWN | I | Bắt buộc; search by tên ứng viên/job | - | SELECT từ applications có status ≠ hired/rejected |
| 2 | Chọn Interviewer | DROPDOWN | I | Bắt buộc; chọn từ danh sách | - | Lấy từ metadata API |
| 3 | Ngày giờ phỏng vấn | TEXTBOX | I | Bắt buộc; datetime tương lai | - | Datetime picker |
| 4 | Thời lượng (phút) | TEXTBOX | I | Số nguyên dương | 60 | - |
| 5 | Hình thức | DROPDOWN | I | Bắt buộc; phone/video/onsite/technical | video | - |
| 6 | Link họp | TEXTBOX | I | URL hợp lệ nếu có | - | Cho video/onsite |
| 7 | Địa điểm | TEXTBOX | I | Tùy chọn; max 200 ký tự | - | Cho onsite |
| 8 | Ghi chú | TEXTBOX | I | Tùy chọn; max 1000 ký tự | - | Textarea |
| 9 | Nút Tạo phỏng vấn | BUTTON | I | Form hợp lệ | - | Submit |
| 10 | Nút Hủy | BUTTON | I | - | - | Quay lại danh sách |

### Màn hình /dashboard/interviews/[id] - Chi tiết

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Thông tin ứng viên | SECTION | O | - | - | Tên, email, job applied |
| 2 | Thông tin interviewer | SECTION | O | - | - | Tên, email |
| 3 | Thông tin buổi PV | SECTION | O | - | - | Ngày giờ, hình thức, thời lượng, link |
| 4 | Badge trạng thái | TEXT | O | - | - | Color-coded |
| 5 | Nút Chỉnh sửa | BUTTON | I | Chỉ hr/admin | - | Điều hướng edit modal |
| 6 | Nút Đổi trạng thái | DROPDOWN | I | Chỉ hr/admin | - | Cancel/Complete/Reschedule |
| 7 | Scorecard section | SECTION | O | - | - | Hiển thị điểm nếu có |
| 8 | Nút Chấm điểm | BUTTON | I | Chỉ interviewer của buổi PV này | - | Điều hướng /score |

### Màn hình /dashboard/interviews/[id]/score - Chấm điểm

| No | Tên control | Loại | I/O | Check nhập | Giá trị mặc định | Ghi chú |
|---:|---|---|---|---|---|---|
| 1 | Điểm kỹ thuật | TEXTBOX | I | Bắt buộc; số 1-10 | - | Slider hoặc input number |
| 2 | Điểm giao tiếp | TEXTBOX | I | Bắt buộc; số 1-10 | - | - |
| 3 | Điểm phù hợp văn hóa | TEXTBOX | I | Bắt buộc; số 1-10 | - | - |
| 4 | Điểm tổng thể | TEXTBOX | I | Bắt buộc; số 1-10 | - | - |
| 5 | Điểm mạnh | TEXTBOX | I | Tùy chọn; max 500 ký tự | - | Textarea |
| 6 | Điểm yếu | TEXTBOX | I | Tùy chọn; max 500 ký tự | - | Textarea |
| 7 | Nhận xét tổng quan | TEXTBOX | I | Tùy chọn; max 2000 ký tự | - | Textarea |
| 8 | Kết luận | DROPDOWN | I | Bắt buộc; pass/fail/hold | - | - |
| 9 | Đánh dấu chấm điểm cuối cùng | SECTION | I | Checkbox | false | Nếu true → cập nhật interview.status = completed |
| 10 | Nút Lưu điểm | BUTTON | I | Form hợp lệ | - | Submit |

---

<a id="sheet-05"></a>
## Sheet 05 - Giao diện màn hình

### 2. Danh sách màn hình

| No | Tên màn hình | Route / URL | Loại màn hình | Khái quát | Trạng thái |
|---:|---|---|---|---|---|
| 1 | Danh sách phỏng vấn | /dashboard/interviews | Danh sách | Tất cả lịch PV có filter | x |
| 2 | Tạo phỏng vấn mới | /dashboard/interviews/new | Form | Form tạo lịch PV | x |
| 3 | Chi tiết phỏng vấn | /dashboard/interviews/[id] | Chi tiết | Thông tin buổi PV + scorecard | x |
| 4 | Chấm điểm phỏng vấn | /dashboard/interviews/[id]/score | Form | Form chấm điểm của interviewer | x |

### 3. Màn hình 1 - /dashboard/interviews

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/interviews |
| Tên màn hình | Danh sách phỏng vấn |
| Loại màn hình | Danh sách |
| Khái quát chức năng | Hiển thị tất cả buổi phỏng vấn có filter; HR/Admin thấy tất cả; Interviewer chỉ thấy lịch của mình |
| Tác vụ liên quan | Lọc theo status/ngày; phân trang; xem chi tiết; tạo mới (hr/admin) |
| Điều kiện hiển thị | User đăng nhập với role hr, admin, hoặc interviewer |
| Điều kiện không có dữ liệu | "Chưa có lịch phỏng vấn nào." |
| Điều hướng từ màn hình này | /dashboard/interviews/new; /dashboard/interviews/[id] |
| Điều hướng đến màn hình này | Sidebar menu "Phỏng vấn" |
| Liên kết control | Sheet Chi tiết điều khiển, No.1-7 (danh sách PV) |
| Liên kết API | Sheet API, API No.F-01 |
| Liên kết Message | Sheet Thông báo, F-ERR-001 |
| Ghi chú | Client Component; React Query; URL sync filter |

### 4. Rule hiển thị màn hình 1

| No | Trường hợp | Điều kiện | Nội dung hiển thị | Ghi chú |
|---:|---|---|---|---|
| 1 | Bình thường | Có dữ liệu | Bảng danh sách | - |
| 2 | Rỗng | total = 0 | Empty state + nút tạo mới (hr/admin) | - |
| 3 | Interviewer | role = interviewer | Ẩn nút "Tạo PV mới"; chỉ hiện lịch của mình | - |
| 4 | Lỗi | API lỗi | Alert lỗi | - |
| 5 | Loading | Fetching | Skeleton table | - |

### 5. Rule validation màn hình 1

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Filter date | YYYY-MM-DD hợp lệ nếu có | - | Bỏ qua nếu không hợp lệ |
| 2 | Filter status | ∈ enum nếu có | - | Bỏ qua |

### 6. Màn hình 2 - /dashboard/interviews/new

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/interviews/new |
| Tên màn hình | Tạo phỏng vấn mới |
| Loại màn hình | Form |
| Khái quát chức năng | Form tạo lịch phỏng vấn mới: chọn ứng viên, interviewer, thời gian và hình thức |
| Tác vụ liên quan | Nhập thông tin; submit tạo PV; hủy về danh sách |
| Điều kiện hiển thị | role hr hoặc admin |
| Điều hướng từ màn hình này | Sau submit thành công → /dashboard/interviews/[id]; Hủy → /dashboard/interviews |
| Liên kết API | Sheet API, API No.F-02, F-06 |
| Liên kết Message | Sheet Thông báo, F-SUC-001, F-ERR-002 |
| Ghi chú | Client Component; React Hook Form + Zod; load metadata khi mount |

### 7. Rule validation màn hình 2

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Hồ sơ ứng tuyển | Bắt buộc chọn | F-VAL-001 | Hiển thị lỗi, disable submit |
| 2 | Interviewer | Bắt buộc chọn | F-VAL-002 | Hiển thị lỗi |
| 3 | Ngày giờ PV | Bắt buộc; phải trong tương lai | F-VAL-003 | Hiển thị lỗi |
| 4 | Hình thức | Bắt buộc chọn | F-VAL-004 | Hiển thị lỗi |
| 5 | Thời lượng | Số dương; default 60 | F-VAL-005 | Hiển thị lỗi nếu <= 0 |
| 6 | Link họp | URL hợp lệ nếu có | F-VAL-006 | Hiển thị lỗi |

### 8. Màn hình 3 - /dashboard/interviews/[id]

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/interviews/[id] |
| Tên màn hình | Chi tiết phỏng vấn |
| Loại màn hình | Chi tiết |
| Khái quát chức năng | Hiển thị đầy đủ thông tin buổi PV và scorecard nếu đã chấm điểm |
| Điều kiện hiển thị | User đăng nhập role hr/admin/interviewer; nếu interviewer thì chỉ xem PV của mình |
| Điều hướng từ màn hình này | /dashboard/interviews/[id]/score (interviewer); back về danh sách |
| Liên kết API | Sheet API, API No.F-03, F-04 |
| Liên kết Message | Sheet Thông báo, F-SUC-002, F-ERR-003 |

### 9. Màn hình 4 - /dashboard/interviews/[id]/score

| Field | Nội dung |
|---|---|
| Route / URL | /dashboard/interviews/[id]/score |
| Tên màn hình | Chấm điểm phỏng vấn |
| Loại màn hình | Form |
| Khái quát chức năng | Form chấm điểm cho interviewer sau khi buổi PV diễn ra |
| Điều kiện hiển thị | role = interviewer VÀ là người được chỉ định phỏng vấn; hoặc hr/admin |
| Điều hướng từ màn hình này | Sau submit → /dashboard/interviews/[id] |
| Liên kết API | Sheet API, API No.F-05 |
| Liên kết Message | Sheet Thông báo, F-SUC-003, F-VAL-007 |

### 10. Rule validation màn hình 4

| No | Item | Điều kiện validation | MessageCD | Hành vi khi lỗi |
|---:|---|---|---|---|
| 1 | Điểm kỹ thuật | Bắt buộc; số nguyên 1-10 | F-VAL-007 | Hiển thị lỗi |
| 2 | Điểm giao tiếp | Bắt buộc; số nguyên 1-10 | F-VAL-007 | Hiển thị lỗi |
| 3 | Điểm văn hóa | Bắt buộc; số nguyên 1-10 | F-VAL-007 | Hiển thị lỗi |
| 4 | Điểm tổng thể | Bắt buộc; số nguyên 1-10 | F-VAL-007 | Hiển thị lỗi |
| 5 | Kết luận | Bắt buộc; pass/fail/hold | F-VAL-008 | Hiển thị lỗi |

---

<a id="sheet-06"></a>
## Sheet 06 - Thông báo

| MessageCD | Loại | Nội dung (tiếng Việt) | Ghi chú |
|---|---|---|---|
| F-SUC-001 | Success | Lịch phỏng vấn đã được tạo thành công. | Sau tạo PV |
| F-SUC-002 | Success | Thông tin phỏng vấn đã được cập nhật. | Sau PATCH |
| F-SUC-003 | Success | Điểm phỏng vấn đã được lưu thành công. | Sau chấm điểm |
| F-ERR-001 | Error | Không thể tải danh sách phỏng vấn. Vui lòng thử lại. | API fetch thất bại |
| F-ERR-002 | Error | Không thể tạo lịch phỏng vấn. Vui lòng kiểm tra thông tin. | POST thất bại |
| F-ERR-003 | Error | Phỏng vấn không tồn tại. | 404 |
| F-ERR-004 | Error | Bạn không có quyền xem phỏng vấn này. | Interviewer xem PV người khác |
| F-ERR-005 | Error | Không thể lưu điểm. Vui lòng thử lại. | POST score thất bại |
| F-VAL-001 | Validation | Vui lòng chọn hồ sơ ứng tuyển. | Bỏ trống application |
| F-VAL-002 | Validation | Vui lòng chọn người phỏng vấn. | Bỏ trống interviewer |
| F-VAL-003 | Validation | Ngày giờ phỏng vấn phải trong tương lai. | scheduled_at không hợp lệ |
| F-VAL-004 | Validation | Vui lòng chọn hình thức phỏng vấn. | Bỏ trống type |
| F-VAL-005 | Validation | Thời lượng phỏng vấn phải lớn hơn 0 phút. | duration <= 0 |
| F-VAL-006 | Validation | Link họp phải là URL hợp lệ. | URL không đúng định dạng |
| F-VAL-007 | Validation | Điểm phải là số nguyên từ 1 đến 10. | Score ngoài phạm vi |
| F-VAL-008 | Validation | Vui lòng chọn kết luận phỏng vấn (Đạt / Không đạt / Cân nhắc). | Bỏ trống result |

---

<a id="sheet-07"></a>
## Sheet 07 - API

### 1. Danh sách API

| API No | Method | Endpoint | Auth | Mô tả |
|---|---|---|---|---|
| F-01 | GET | /api/dashboard/interviews | hr, admin, interviewer | Danh sách phỏng vấn |
| F-02 | POST | /api/dashboard/interviews | hr, admin | Tạo phỏng vấn mới |
| F-03 | GET | /api/dashboard/interviews/[id] | hr, admin, interviewer | Chi tiết phỏng vấn |
| F-04 | PATCH | /api/dashboard/interviews/[id] | hr, admin | Cập nhật phỏng vấn |
| F-05 | POST | /api/dashboard/interviews/[id]/score | interviewer, hr, admin | Chấm điểm phỏng vấn |
| F-06 | GET | /api/dashboard/interviews/metadata | hr, admin | Dropdown: danh sách interviewer |

### 2. API F-01 - GET /api/dashboard/interviews

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/interviews |
| Auth | JWT Cookie `session`; role: hr, admin, interviewer |
| Mô tả | Lấy danh sách phỏng vấn; interviewer chỉ thấy lịch của mình; hỗ trợ filter và phân trang |
| Query Params | `status`, `date` (YYYY-MM-DD), `page`, `limit` |
| Biến trả về | `items[]`, `total`, `page`, `limit` |
| Xử lý lỗi | 401, 403, 500 |
| Xử lý thành công | 200 |

### 3. API F-02 - POST /api/dashboard/interviews

| Field | Nội dung |
|---|---|
| Method | POST |
| Endpoint | /api/dashboard/interviews |
| Auth | JWT Cookie `session`; role: hr, admin |
| Mô tả | Tạo lịch phỏng vấn mới liên kết với hồ sơ ứng tuyển |
| Body | `{ application_id, interviewer_id, scheduled_at, duration_minutes?, type, meeting_link?, location?, notes? }` |
| Validation | Xem Method 2 trong Sheet 03 |
| Xử lý lỗi | 400, 401, 403, 404 (application/interviewer không tồn tại), 500 |
| Xử lý thành công | 201 + interview record |

### 4. API F-03 - GET /api/dashboard/interviews/[id]

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/interviews/[id] |
| Auth | JWT Cookie; role: hr, admin, interviewer |
| Mô tả | Lấy chi tiết 1 buổi phỏng vấn kèm scorecard |
| Xử lý lỗi | 401, 403 (interviewer xem PV người khác), 404, 500 |
| Xử lý thành công | 200 + interview object đầy đủ |

### 5. API F-04 - PATCH /api/dashboard/interviews/[id]

| Field | Nội dung |
|---|---|
| Method | PATCH |
| Endpoint | /api/dashboard/interviews/[id] |
| Auth | JWT Cookie; role: hr, admin |
| Mô tả | Cập nhật thông tin phỏng vấn (lịch, trạng thái, ghi chú...) |
| Body | `{ scheduled_at?, duration_minutes?, type?, status?, meeting_link?, location?, notes? }` |
| Validation | scheduled_at phải trong tương lai nếu có; status ∈ enum |
| Xử lý lỗi | 400, 401, 403, 404, 500 |
| Xử lý thành công | 200 + interview đã cập nhật |

### 6. API F-05 - POST /api/dashboard/interviews/[id]/score

| Field | Nội dung |
|---|---|
| Method | POST |
| Endpoint | /api/dashboard/interviews/[id]/score |
| Auth | JWT Cookie; role: interviewer (chỉ người được chỉ định), hr, admin |
| Mô tả | Tạo hoặc cập nhật điểm đánh giá phỏng vấn; nếu is_final = true thì cập nhật interview.status = completed |
| Body | `{ technical_score, communication_score, cultural_fit_score, overall_score, strengths?, weaknesses?, feedback?, result, is_final? }` |
| Validation | Điểm 1-10; result bắt buộc ∈ ['pass','fail','hold'] |
| Xử lý lỗi | 400, 401, 403, 404, 500 |
| Xử lý thành công | 200 + score record |

### 7. API F-06 - GET /api/dashboard/interviews/metadata

| Field | Nội dung |
|---|---|
| Method | GET |
| Endpoint | /api/dashboard/interviews/metadata |
| Auth | JWT Cookie; role: hr, admin |
| Mô tả | Lấy dữ liệu dropdown cho form tạo/sửa PV: danh sách interviewer active |
| Biến trả về | `{ interviewers: [{ id, full_name, email }] }` |
| Xử lý thành công | 200 |

---

<a id="sheet-08"></a>
## Sheet 08 - Request

### API F-01 - GET /api/dashboard/interviews

**Header:**
```
Cookie: session=<JWT_TOKEN>
```

**Query Params:**
| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| status | string | Không | scheduled \| completed \| cancelled \| rescheduled |
| date | string | Không | YYYY-MM-DD |
| page | number | Không | Default 1 |
| limit | number | Không | Default 20 |

---

### API F-02 - POST /api/dashboard/interviews

**Body:**
```json
{
  "application_id": "uuid-app-001",
  "interviewer_id": "uuid-user-interviewer-1",
  "scheduled_at": "2026-05-22T10:00:00Z",
  "duration_minutes": 60,
  "type": "video",
  "meeting_link": "https://meet.google.com/abc-def-ghi",
  "location": null,
  "notes": "Phỏng vấn kỹ thuật vòng 1"
}
```

---

### API F-04 - PATCH /api/dashboard/interviews/[id]

**Body:**
```json
{
  "scheduled_at": "2026-05-23T14:00:00Z",
  "status": "rescheduled",
  "notes": "Dời lịch theo yêu cầu ứng viên"
}
```

---

### API F-05 - POST /api/dashboard/interviews/[id]/score

**Body:**
```json
{
  "technical_score": 8,
  "communication_score": 7,
  "cultural_fit_score": 9,
  "overall_score": 8,
  "strengths": "Kiến thức React vững chắc, tư duy giải quyết vấn đề tốt.",
  "weaknesses": "Kinh nghiệm với TypeScript còn hạn chế.",
  "feedback": "Ứng viên phù hợp với vị trí, cần onboard thêm về quy trình nội bộ.",
  "result": "pass",
  "is_final": true
}
```

---

<a id="sheet-09"></a>
## Sheet 09 - Response

### API F-01 - GET /api/dashboard/interviews

**Success (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-interview-1",
        "scheduled_at": "2026-05-22T10:00:00Z",
        "duration_minutes": 60,
        "type": "video",
        "status": "scheduled",
        "meeting_link": "https://meet.google.com/abc-def-ghi",
        "interviewer": { "id": "uuid-u2", "full_name": "Lê Văn C" },
        "application": {
          "id": "uuid-app-001",
          "candidate": { "full_name": "Nguyễn Văn A" },
          "job": { "title": "Frontend Developer" }
        }
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

---

### API F-05 - POST .../score

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-score-1",
    "interview_id": "uuid-interview-1",
    "evaluator_id": "uuid-user-interviewer-1",
    "technical_score": 8,
    "communication_score": 7,
    "cultural_fit_score": 9,
    "overall_score": 8,
    "result": "pass",
    "is_final": true
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Dữ liệu không hợp lệ.",
  "fieldErrors": {
    "technical_score": "Điểm phải là số nguyên từ 1 đến 10.",
    "result": "Vui lòng chọn kết luận."
  }
}
```

**Error (403):**
```json
{ "success": false, "error": "Bạn không có quyền chấm điểm phỏng vấn này." }
```

---

<a id="sheet-10"></a>
## Sheet 10 - SQL

### 1. Danh sách SQL

| SQL No | Tên SQL / Mục đích | Loại | API sử dụng | Ghi chú |
|---:|---|---|---|---|
| F-01 | Lấy danh sách phỏng vấn có filter | SELECT | F-01 | JOIN + filter + phân trang |
| F-02 | Tạo phỏng vấn mới | INSERT | F-02 | INSERT interviews |
| F-03 | Lấy chi tiết phỏng vấn | SELECT | F-03 | Multiple JOIN + scores |
| F-04 | Cập nhật phỏng vấn | UPDATE | F-04 | UPDATE interviews |
| F-05 | UPSERT điểm phỏng vấn | INSERT/UPDATE | F-05 | Upsert interview_scores |
| F-06 | Lấy danh sách interviewer | SELECT | F-06 | WHERE role = 'interviewer' |

### 2. SQL No. F-01 - Lấy danh sách phỏng vấn

#### 2.3. Table sử dụng
| No | Table name | Alias | Create | Read | Update | Delete |
|---:|---|---|---|---|---|---|
| 1 | interviews | i | - | x | - | - |
| 2 | applications | a | - | x | - | - |
| 3 | users (candidate) | uc | - | x | - | - |
| 4 | users (interviewer) | ui | - | x | - | - |
| 5 | jobs | j | - | x | - | - |

#### 2.5. SQL
```sql
-- Prisma ORM tương đương:
-- prisma.interview.findMany({
--   where: { status, scheduled_at: dateFilter, interviewer_id: (role='interviewer' ? userId : undefined) },
--   include: { interviewer: true, application: { include: { candidate: true, job: true } } },
--   orderBy: { scheduled_at: 'asc' },
--   skip, take
-- })

SELECT i.id, i.scheduled_at, i.duration_minutes, i.type, i.status, i.meeting_link, i.location,
       ui.id AS interviewer_id, ui.full_name AS interviewer_name,
       uc.full_name AS candidate_name,
       j.title AS job_title
FROM interviews i
JOIN applications a ON i.application_id = a.id
JOIN users uc ON a.candidate_id = uc.id
JOIN users ui ON i.interviewer_id = ui.id
JOIN jobs j ON a.job_id = j.id
WHERE (i.status = :status OR :status IS NULL)
  AND (DATE(i.scheduled_at) = :date OR :date IS NULL)
  AND (i.interviewer_id = :interviewerId OR :interviewerId IS NULL)
ORDER BY i.scheduled_at ASC
LIMIT :limit OFFSET :offset;
```

#### 2.7. Ghi chú xử lý
| Nội dung | Ghi chú |
|---|---|
| Transaction | Không |
| Performance note | Index trên `interviewer_id`, `status`, `scheduled_at` |

---

### 3. SQL No. F-02 - Tạo phỏng vấn mới

#### 2.5. SQL
```sql
-- prisma.interview.create({ data: { ... } })

INSERT INTO interviews (id, application_id, interviewer_id, scheduled_at, duration_minutes, type, status, meeting_link, location, notes)
VALUES (UUID(), :applicationId, :interviewerId, :scheduledAt, :durationMinutes, :type, 'scheduled', :meetingLink, :location, :notes);
```

---

### 4. SQL No. F-03 - Chi tiết phỏng vấn + scores

#### 2.5. SQL
```sql
SELECT i.*, 
       a.id AS application_id, a.status AS app_status,
       uc.full_name AS candidate_name, uc.email AS candidate_email,
       j.title AS job_title,
       ui.full_name AS interviewer_name
FROM interviews i
JOIN applications a ON i.application_id = a.id
JOIN users uc ON a.candidate_id = uc.id
JOIN jobs j ON a.job_id = j.id
JOIN users ui ON i.interviewer_id = ui.id
WHERE i.id = :id;

-- Lấy scores:
SELECT s.*, ue.full_name AS evaluator_name
FROM interview_scores s
JOIN users ue ON s.evaluator_id = ue.id
WHERE s.interview_id = :id;
```

---

### 5. SQL No. F-05 - UPSERT điểm phỏng vấn

#### 2.3. Table sử dụng
| No | Table name | Alias | Create | Read | Update | Delete |
|---:|---|---|---|---|---|---|
| 1 | interview_scores | s | x | x | x | - |
| 2 | interviews | i | - | - | x | - |

#### 2.5. SQL
```sql
-- Kiểm tra xem đã có score chưa:
SELECT id FROM interview_scores WHERE interview_id = :interviewId AND evaluator_id = :evaluatorId;

-- Nếu chưa có → INSERT:
INSERT INTO interview_scores (id, interview_id, evaluator_id, technical_score, communication_score, cultural_fit_score, overall_score, strengths, weaknesses, feedback, result, is_final)
VALUES (UUID(), :interviewId, :evaluatorId, :technical, :communication, :cultural, :overall, :strengths, :weaknesses, :feedback, :result, :isFinal);

-- Nếu đã có → UPDATE:
UPDATE interview_scores
SET technical_score = :technical, communication_score = :communication, cultural_fit_score = :cultural,
    overall_score = :overall, strengths = :strengths, weaknesses = :weaknesses,
    feedback = :feedback, result = :result, is_final = :isFinal
WHERE interview_id = :interviewId AND evaluator_id = :evaluatorId;

-- Nếu is_final = true:
UPDATE interviews SET status = 'completed' WHERE id = :interviewId;
```

#### 2.7. Ghi chú xử lý
| Nội dung | Ghi chú |
|---|---|
| Transaction | Có — đảm bảo upsert score và cập nhật interview status nhất quán |
| Rollback | Nếu UPDATE interviews thất bại |

---

### 6. SQL No. F-06 - Lấy danh sách interviewer

#### 2.5. SQL
```sql
-- prisma.user.findMany({ where: { role: 'interviewer', is_active: true }, select: { id, full_name, email } })

SELECT id, full_name, email
FROM users
WHERE role = 'interviewer'
  AND is_active = TRUE
ORDER BY full_name ASC;
```

---

<a id="lich-su-thay-doi"></a>
## 11. Lịch sử thay đổi

| Ngày | Nội dung thay đổi | Ghi chú |
|---|---|---|
| 2026-05-17 | Khởi tạo tài liệu | Tạo mới toàn bộ 10 sheet cho Module F - Interviews |
