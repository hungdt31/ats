# Tài liệu Đặc tả Màn hình: Danh sách Phỏng vấn (Interviews Dashboard)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Danh sách Lịch phỏng vấn |
| **Đường dẫn file** | `app/dashboard/interviews/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Đặc tả danh sách phỏng vấn dựa trên Component DataTable và React Query. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là khu vực quản lý toàn bộ các lịch phỏng vấn trong hệ thống. Cung cấp góc nhìn tổng quan cho Admin, HR và các Phỏng vấn viên để biết khi nào có lịch, phỏng vấn ai, vị trí nào, hình thức (Online/Onsite) và người phụ trách phỏng vấn.
- **User Flow:** 
  1. Người dùng truy cập menu `Phỏng vấn`.
  2. Hệ thống tải danh sách lịch phỏng vấn xếp theo thứ tự thời gian.
  3. Người dùng sử dụng bộ lọc Trạng thái (Ví dụ: Chỉ xem các lịch "Đã lên lịch" hoặc "Hoàn thành") hoặc tìm kiếm tên ứng viên.
  4. Người dùng bấm "Chi tiết" để đi vào đánh giá, hoặc bấm "+ Lên lịch phỏng vấn" để tạo cuộc hẹn mới.

### IPO Tổng quan
- **Input:** Biến State lọc trạng thái (`status`). Tìm kiếm local tại bảng.
- **Process:** 
  - Gọi API GET `/api/dashboard/interviews` thông qua `@tanstack/react-query`.
  - Parse dữ liệu lồng nhau (`applications.users.fullName`, `users.fullName`...) để binding vào bảng.
- **Output:** Giao diện bảng (`DataTable`) với các Badge màu sắc nhận diện trạng thái.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Danh sách Lịch phỏng vấn]`

### Chi tiết điều khiển
**Phần Thanh công cụ (Toolbar):**
| STT | Tên thành phần | Loại | Chức năng | Trạng thái mặc định |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Nút "+ Lên lịch phỏng vấn" | Link Button | Chuyển sang `/dashboard/interviews/new` | Mở |
| 2 | Bộ lọc Trạng thái | Select | Lọc danh sách theo trạng thái (`scheduled`, `completed`, `cancelled`, `rescheduled`) | "Tất cả trạng thái" |
| 3 | Nút Xóa lọc | Button | Ẩn. Chỉ hiện ra khi bộ lọc khác "Tất cả". Bấm vào để reset bộ lọc. | Ẩn |

**Phần Bảng dữ liệu (Data Table):**
| STT | Tên cột | Dữ liệu hiển thị | Ghi chú cấu hình |
| :--- | :--- | :--- | :--- |
| 1 | Ứng viên | Tên Ứng viên (đậm) + Tên Vị trí ứng tuyển (nhạt). | Định cấu hình làm `searchKey="candidate"`. |
| 2 | Thời gian | Ngày tháng năm + Giờ phút (kèm Thời lượng cuộc họp). | Ép kiểu bằng `toLocaleDateString` và `toLocaleTimeString`. |
| 3 | Hình thức | Chữ in hoa (Ví dụ: VIDEO, ONSITE). | Dùng CSS `uppercase`. |
| 4 | Interviewer | Tên người phụ trách phỏng vấn. | Fallback là "Admin/HR" nếu rỗng. |
| 5 | Trạng thái | Badge màu sắc theo `STATUS_OPTIONS`. | scheduled (Outline), completed (Đen), cancelled (Đỏ). |
| 6 | Hành động | Nút Link "Chi tiết". | Dẫn sang `/dashboard/interviews/[id]`. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Loading data | "Đang tải danh sách lịch phỏng vấn..." | Text giữa bảng |
| Lỗi Fetch API | Error từ React Query | Cảnh báo Console / Fallback UI |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Khởi tạo và State:**
   - Sử dụng `useState` cho biến `status` (mặc định `"all"`).
2. **Fetch Data:**
   - Hook `useQuery` được trigger lại mỗi khi `status` thay đổi.
   - Hàm API append `status` vào URL query params. `staleTime: 5000` (giữ cache trong 5s).
3. **Logic Mapping Cột Dữ Liệu:**
   - Trong `columns` của Table, hệ thống phải móc qua Object liên kết (Relationship) phức tạp của Prisma.
   - Ví dụ Cột Ứng Viên: `row.original.applications?.users?.fullName` (Do bảng Interview liên kết với Application, rồi Application lại liên kết với Users).
   - Cột Thời gian: Render đồng thời 2 mốc định dạng: `toLocaleDateString("vi-VN")` và `toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })`.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Thiếu dữ liệu Quan hệ (Orphan Records):** Nếu do tác động vật lý ở DB làm một đơn ứng tuyển bị xóa sạch nhưng lịch phỏng vấn vẫn còn, cột Ứng viên và Interviewer sẽ tự động hiển thị ký tự `—` thay vì văng màn hình trắng.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/interviews` | `GET` | Lấy danh sách phỏng vấn theo Query Status. Backend chịu trách nhiệm sắp xếp (`orderBy`) theo thời gian scheduled_at. |

### Đặc tả Request / Response
**Request URL:**
```http
GET /api/dashboard/interviews?status=scheduled
```

**Response Payload (JSON):**
```json
{
  "success": true,
  "data": [
    {
      "id": "iv_123",
      "scheduled_at": "2026-05-10T14:00:00Z",
      "duration_minutes": 60,
      "type": "video",
      "status": "scheduled",
      "users": {
        "fullName": "Le Van Interviewer"
      },
      "applications": {
        "users": {
          "fullName": "Nguyen Van Ung Vien"
        },
        "jobs": {
          "title": "Backend Developer"
        }
      }
    }
  ]
}
```
