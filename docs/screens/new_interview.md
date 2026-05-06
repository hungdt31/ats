# Tài liệu Đặc tả Màn hình: Lên lịch phỏng vấn mới (New Interview)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Lên Lịch Phỏng Vấn Mới |
| **Đường dẫn file** | `app/dashboard/interviews/new/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 06/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 06/05/2026 | AI | Cập nhật tài liệu theo logic Fetch MetaData (Ứng viên/Người chấm) và Conditional Form. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là biểu mẫu (Form) để HR/Admin điều phối lịch hẹn phỏng vấn. Cho phép chọn ứng viên, phân công người phỏng vấn, ấn định thời gian, địa điểm và hình thức phỏng vấn.
- **User Flow:** 
  1. Người dùng bấm "+ Lên lịch phỏng vấn" từ trang danh sách Phỏng vấn (Hoặc truyền thẳng `applicationId` từ trang Hồ sơ ứng viên).
  2. Giao diện tải trước (fetch) danh sách tất cả các Đơn ứng tuyển và danh sách Nhân sự công ty.
  3. Người dùng điền Form.
  4. Bấm "Lên lịch", hệ thống gửi POST Request. Nếu thành công, tự động chuyển hướng về trang danh sách.

### IPO Tổng quan
- **Input:** Tham số URL `searchParams.applicationId` (để auto-select nếu có). Dữ liệu nhập: Application, Interviewer, Date/Time, Duration, Type, Meeting Link/Location, Notes.
- **Process:** 
  - Gọi GET `/api/dashboard/interviews/metadata` để lấy option data (Ứng viên, Người chấm).
  - Component có logic Conditional Rendering: Hiển thị trường URL nếu chọn Video call, hiện trường Location nếu chọn Onsite/Technical.
  - Gửi POST xuống API.
- **Output:** Thông báo Toast. Chuyển hướng về `/dashboard/interviews`.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Form Lên lịch Phỏng vấn]`

### Chi tiết điều khiển
| STT | Tên thành phần | Loại UI | Ràng buộc | Trạng thái hiển thị |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Ứng viên & Đơn | Select | Bắt buộc chọn. | Fallback Skeleton khi đang load. |
| 2 | Người phỏng vấn | Select | Bắt buộc chọn (Interviewer/Admin/HR). | Fallback Skeleton khi đang load. |
| 3 | Thời gian | Datetime-local | Bắt buộc (YYYY-MM-DDThh:mm). | Luôn hiện |
| 4 | Thời lượng | Number Input | Bắt buộc. Step nhảy mỗi 15 phút. (15 -> 300). | Mặc định: 60 |
| 5 | Hình thức | Select | Thuộc: `video`, `phone`, `onsite`, `technical`. | Mặc định: `video` |
| 6 | Link họp trực tuyến | URL Input | Tùy chọn. | **Chỉ hiện** nếu Hình thức = `video` |
| 7 | Địa điểm / Phòng | Text Input | Tùy chọn. | **Chỉ hiện** nếu Hình thức = `onsite` / `technical` |
| 8 | Ghi chú | Textarea | Tùy chọn. Max 3 dòng. | Luôn hiện |
| 9 | Nút Lên lịch | Button | Khóa khi API đang pending. | Enable |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Trống Ứng viên / Người chấm / Ngày | "Vui lòng chọn..." (Theo từng trường) | Toast (Đỏ) |
| Lỗi API | Message từ Backend hoặc "Đã xảy ra lỗi khi lưu." | Toast (Đỏ) |
| Thành công | "Lên lịch phỏng vấn thành công!" | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Khởi tạo Auto-Select:**
   - Đọc tham số `searchParams.applicationId`. Nếu HR bấm nút "Lên lịch" từ chính trang Hồ sơ ứng viên (URL sẽ có `?applicationId=123`), React State `applicationId` sẽ tự động lấy giá trị này, giúp HR không phải mất công tìm lại tên ứng viên trong Dropdown dài.
2. **Fetch Dữ Liệu Tĩnh (Metadata):**
   - Form cần 2 danh sách sổ xuống: Danh sách đơn ứng tuyển (`applications`) và danh sách nội bộ (`interviewers`). API `/api/dashboard/interviews/metadata` trả về một lúc cả 2 mảng này.
   - Trong quá trình fetch, ô Select hiển thị khối hộp chớp nháy (Skeleton `animate-pulse`) để báo hiệu đang tải.
3. **Logic Hiển thị động (Conditional Rendering):**
   - Sự kiện thay đổi của Select "Hình thức phỏng vấn" làm thay đổi biến React `type`.
   - Form bọc các Input khác trong điều kiện: `{type === "video" && <Input Link />}` và `{(type === "onsite" || type === "technical") && <Input Location />}`.
4. **Submit Logic:**
   - Dừng hành vi reload trang mặc định.
   - Ép kiểu `duration_minutes` bằng `parseInt(durationMinutes, 10)` trước khi gói vào JSON.
   - Gọi Fetch API POST. Nhận phản hồi rồi bắn thẻ Toast xanh và `router.push('/dashboard/interviews')`.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/interviews/metadata` | `GET` | Cung cấp danh sách Option lấp đầy các Select Box. |
| `/api/dashboard/interviews` | `POST` | Xử lý tạo record Lịch hẹn (Interview) xuống Database. |

### Đặc tả Request / Response
**1. Request Payload API Tạo mới (POST JSON):**
```json
{
  "application_id": "app_456",
  "interviewer_id": "user_iv_123",
  "scheduled_at": "2026-05-15T09:00",
  "duration_minutes": 60,
  "type": "video",
  "meeting_link": "https://meet.google.com/xyz-abc",
  "location": "",
  "notes": "Test thuật toán và cấu trúc dữ liệu."
}
```

**2. Response Payload GET Metadata (Ví dụ):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_456",
        "users": { "fullName": "Nguyen Van A" },
        "jobs": { "title": "Frontend Developer" }
      }
    ],
    "interviewers": [
      {
        "id": "user_iv_123",
        "fullName": "Le Van Lead",
        "role": "interviewer"
      }
    ]
  }
}
```
