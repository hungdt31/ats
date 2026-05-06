# Tài liệu Đặc tả Màn hình: Danh sách Đơn ứng tuyển (Applications Dashboard)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Quản lý Đơn ứng tuyển |
| **Đường dẫn file** | `app/dashboard/applications/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu thực tế theo mã nguồn sử dụng React Query & Data Table |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là trang tổng hợp toàn bộ các đơn ứng tuyển của hệ thống. Dành cho HR/Admin để theo dõi, lọc, tìm kiếm và truy cập vào chi tiết hồ sơ của từng ứng viên.
- **User Flow:** 
  1. Người dùng truy cập menu `Đơn ứng tuyển` trên Dashboard.
  2. Giao diện tải và hiển thị danh sách đơn dạng bảng (Table).
  3. Người dùng sử dụng các bộ lọc (Việc làm, Trạng thái, Nguồn) hoặc thanh tìm kiếm (Tìm theo Tên/Email).
  4. Người dùng bấm "Xem chi tiết" để chuyển hướng sang trang Hồ sơ 360° của đơn ứng tuyển đó.

### IPO Tổng quan
- **Input:** Các tiêu chí lọc (Job ID, Status, Source), từ khóa tìm kiếm nội bộ bảng.
- **Process:** 
  - Lưu trữ state của bộ lọc bằng `useState`.
  - Fetch API danh sách bằng `@tanstack/react-query` dựa vào tham số querystring.
  - Xử lý dữ liệu bảng (sắp xếp, tìm kiếm cục bộ) thông qua component `DataTable`.
- **Output:** Bảng dữ liệu ứng viên và các huy hiệu trạng thái (Badge). Nút "Xem chi tiết".

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Danh sách Đơn ứng tuyển]`

### Chi tiết điều khiển
**Thanh công cụ lọc (Filter Toolbar):**
| STT | Tên thành phần | Loại | Trạng thái mặc định | Chi tiết logic |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Lọc theo việc làm | Select (Dropdown) | "Tất cả việc làm" | Danh sách việc làm fetch từ DB API |
| 2 | Lọc theo trạng thái | Select (Dropdown) | "Tất cả trạng thái" | Tĩnh (`applied`, `screening`, `interviewing`, `offered`, `hired`, `rejected`) |
| 3 | Lọc theo nguồn | Select (Dropdown) | "Tất cả nguồn" | Tĩnh (`website`, `linkedin`, `itviec`, `topcv`, `vietnamworks`) |
| 4 | Nút "Xoá lọc" | Button | Ẩn | Chỉ hiện khi có ít nhất 1 bộ lọc khác "all" |

**Bảng dữ liệu (Data Table):**
| STT | Tên cột | Hiển thị | Ghi chú |
| :--- | :--- | :--- | :--- |
| 1 | Ứng viên | Tên (đậm) + Email (nhạt) | Có thể search thông qua thẻ Search Bar bên trên |
| 2 | Vị trí | Tiêu đề công việc | - |
| 3 | Trạng thái | Badge màu sắc | Màu xám/vàng/xanh/đỏ tùy logic trạng thái |
| 4 | Nguồn | Text nhạt | Tên nguồn map theo `SOURCE_OPTIONS` |
| 5 | Ngày gửi | Ngày tháng (dd/MM/yyyy) | - |
| 6 | Hành động | Nút "Xem chi tiết" | Chuyển hướng sang `/dashboard/applications/[id]` |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Đang tải danh sách | "Đang tải danh sách đơn ứng tuyển..." | Text giữa bảng |
| Lỗi API (React Query) | Được bắt lỗi ngầm định nếu call fail. | (Chưa hiển thị cảnh báo tĩnh rõ ràng trong mã nguồn hiện tại ngoài console) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Khởi tạo và State:**
   - Sử dụng các state: `jobId`, `status`, `source` với giá trị mặc định là `"all"`.
2. **Data Fetching:**
   - Dùng hook `useQuery` với dependency array chứa các biến state trên để hệ thống tự re-fetch khi user thay đổi bộ lọc.
   - Hàm fetch sẽ tạo đối tượng `URLSearchParams` để nhét các query (`?jobId=...&status=...&source=...`) vào URL của API `/api/dashboard/applications`.
   - `staleTime: 5000` (giữ cache trong 5s để tránh call lại api ngay lập tức khi lướt tab).
3. **Hiển thị Bảng:**
   - Data được truyền vào Component `<DataTable />`. Component này được cấu hình để lọc nội bộ ở Frontend dựa vào ID `candidate` (Tên hoặc Email). Cụm này có searchBox tích hợp sẵn với placeholder `"Tìm theo tên hoặc email ứng viên..."`.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Tối ưu hiệu năng:** API tìm kiếm theo bộ lọc được xử lý tại Backend. Tuy nhiên, thanh tìm kiếm SearchBox theo tên ứng viên hiện đang là Client-Side filtering thông qua `DataTable` (chỉ lọc trong số lượng trả về hiện tại).
- **Trường hợp ứng viên bị xóa:** Nếu user ứng viên (`users`) hoặc công việc (`jobs`) bị null/undefinded trong Database, UI fallback bằng ký hiệu `—` thay vì văng lỗi trang.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/applications` | `GET` | Trả về danh sách đơn ứng tuyển đã được phân trang (nếu có) và áp dụng các query param tương ứng. |

### Đặc tả Request / Response
**Request (Query Parameters):**
- `jobId`: Chuỗi UUID công việc (Tùy chọn)
- `status`: Trạng thái (Tùy chọn)
- `source`: Nguồn ứng tuyển (Tùy chọn)

**Response (Thành công):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_123",
        "status": "applied",
        "source_channel": "linkedin",
        "applied_at": "2026-05-05T08:00:00Z",
        "users": { "fullName": "Nguyen Van A", "email": "a@gmail.com" },
        "jobs": { "title": "Frontend Developer" }
      }
    ],
    "jobs": [
      { "id": "job_1", "title": "Frontend Developer" }
    ]
  }
}
```
