# Tài liệu Đặc tả Màn hình: Quản lý Nhật ký Email Đơn ứng tuyển

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Nhật ký Email Đơn ứng tuyển |
| **Đường dẫn file** | `app/dashboard/applications/[id]/emails/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu dựa trên mã nguồn React Query |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Cung cấp cho HR/Admin một giao diện danh sách bảng (Table) chi tiết về toàn bộ lịch sử gửi email tới một ứng viên cụ thể trong khuôn khổ một đơn ứng tuyển nhất định.
- **User Flow:** 
  1. Người dùng bấm vào liên kết chuyển hướng từ trang Hồ sơ 360° sang trang mở rộng này (hoặc truy cập trực tiếp URL).
  2. Giao diện hiển thị Skeleton/Text loading trong lúc gọi API.
  3. API trả về danh sách lịch sử email. Bảng liệt kê tiêu đề email, loại email (Mời phỏng vấn, Kết quả, Offer, Nhắc nhở), trạng thái gửi thành công hay thất bại, và thời gian.

### IPO Tổng quan
- **Input:** ID của đơn ứng tuyển (tham số `[id]` trên URL).
- **Process:** 
  - Gọi API `GET /api/dashboard/applications/[id]/emails` thông qua thư viện `@tanstack/react-query`.
- **Output:** Bảng dữ liệu UI (Table component).

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Bảng Nhật ký Email]`

### Chi tiết điều khiển
| STT | Tên thành phần | Loại | Thông tin / Trạng thái mặc định |
| :--- | :--- | :--- | :--- |
| 1 | Nút quay lại | Link Button | `< Quay lại hồ sơ 360°` -> Chuyển về trang `/dashboard/applications/[id]` |
| 2 | Header Trang | Block | Hiển thị Tên ứng viên và Vị trí đang ứng tuyển, tổng số lượng email. |
| 3 | Bảng dữ liệu | Table | Cột: Tiêu đề (Subject), Loại email, Trạng thái (Badge), Thời gian. |
| 4 | Loại Email | Text | Map dữ liệu: `invite` (Mời phỏng vấn), `result` (Kết quả), `reminder` (Nhắc nhở), `rejection` (Thư từ chối), `offer` (Offer). |
| 5 | Trạng thái gửi | Badge UI | Màu xám (Chờ gửi), Xanh (Đã gửi), Đỏ (Thất bại). Kèm theo thông báo lỗi chi tiết nếu trạng thái là thất bại. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Đang tải API | "Đang tải nhật ký email..." | Text in Table Cell (Trạng thái Loading) |
| API trả về mảng rỗng | "Không tìm thấy email nào." | Text in Table Cell (Trạng thái Empty) |
| Lỗi API/Network | Lỗi do React Query bắt `Error("Không thể tải thông tin.")` | Fallback hệ thống |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Mount (Khởi tạo):**
   - Đọc `applicationId` từ `props.params` bằng hàm `React.use()`.
   - Khởi tạo hook `useQuery` với `queryKey: ["dashboard", "applications", applicationId, "emails"]`.
   - Bật cờ `isLoading = true`.
2. **Fetch Data:**
   - Trình duyệt gửi GET request đến API nội bộ.
   - Nếu Fetch thất bại (`!res.ok`), quăng lỗi và React Query chuyển trạng thái lỗi.
   - Trích xuất payload thành hai object: `emailLogs` (Mảng log) và `application` (Thông tin tóm tắt đơn).
3. **Hiển thị Bảng:**
   - Map qua mảng `emailLogs`.
   - Định dạng cột thời gian: Nếu email đã gửi (`sent_at` khác null) thì hiển thị thời gian gửi, nếu chưa gửi thì lấy thời gian tạo (`created_at`).
   - Nếu `log.error_message` có dữ liệu, hiển thị kèm chữ màu đỏ ngay bên dưới Badge trạng thái.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Tương tác Cache:** Nhờ `@tanstack/react-query`, nếu người dùng quay lại từ tab trước, dữ liệu email này sẽ được tải lại tức thì từ Cache thay vì chờ Loading.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/applications/[id]/emails` | `GET` | Lấy danh sách lịch sử email liên kết với `applicationId` kèm thông tin cơ bản của đơn. |

### Đặc tả Request / Response
**Request Payload:**
- Tham số trên URL (`Params`): `id` (Application ID)

**Response Payload (JSON):**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "app_123",
      "users": { "fullName": "Nguyen Van A" },
      "jobs": { "title": "Software Engineer" }
    },
    "emailLogs": [
      {
        "id": "log_1",
        "subject": "Thư mời phỏng vấn",
        "type": "invite",
        "status": "sent",
        "sent_at": "2026-05-05T15:00:00Z",
        "created_at": "2026-05-05T14:59:00Z",
        "error_message": null
      },
      {
        "id": "log_2",
        "subject": "Xác nhận lịch hẹn",
        "type": "reminder",
        "status": "failed",
        "sent_at": null,
        "created_at": "2026-05-06T10:00:00Z",
        "error_message": "Resend API Error: Invalid email address"
      }
    ]
  }
}
```
