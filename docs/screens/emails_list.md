# Tài liệu Đặc tả Màn hình: Quản lý Email (Audit Email)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Quản lý Email (Audit Email) |
| **Đường dẫn file** | `app/dashboard/emails/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Đặc tả luồng hiển thị danh sách toàn bộ email Audit theo mã nguồn. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là màn hình Audit dùng để HR và Admin theo dõi toàn bộ lịch sử các email đã được hệ thống gửi ra bên ngoài (hoặc được lên lịch gửi). Chức năng này giúp kiểm soát xem ứng viên có thực sự nhận được email hay do gửi lỗi (do sai định dạng email, lỗi Resend provider...).
- **User Flow:** 
  1. Truy cập vào mục `Email` trên menu Dashboard.
  2. Giao diện tải và hiển thị danh sách tất cả email logs trong DB.
  3. Người dùng có thể dùng bộ lọc (Loại email, Trạng thái) hoặc tìm kiếm theo Tên/Email người nhận.
  4. Có thể click vào nút "Xem hồ sơ" ở mỗi dòng để đi tới đơn ứng tuyển chứa email đó.

### IPO Tổng quan
- **Input:** State cho bộ lọc Loại email (`type`) và Trạng thái gửi (`status`). Tìm kiếm qua box search.
- **Process:** 
  - Gọi API GET `/api/dashboard/emails` bằng `react-query` mang theo querystring.
  - Component `DataTable` xử lý sắp xếp và render các cột dữ liệu.
- **Output:** Bảng dữ liệu chi tiết danh sách email, gồm Tiêu đề, Loại, Trạng thái và Thời gian.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Audit Email Dashboard]`

### Chi tiết điều khiển
**Bộ Lọc (Filters):**
| STT | Tên thành phần | Loại | Trạng thái mặc định | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Lọc theo Loại email | Select | Tất cả loại email | `invite`, `result`, `reminder`, `rejection`, `offer` |
| 2 | Lọc theo Trạng thái | Select | Tất cả trạng thái | `pending` (Chờ gửi), `sent` (Đã gửi), `failed` (Thất bại) |
| 3 | Nút Xóa lọc | Button | Ẩn | Chỉ hiện khi một trong 2 bộ lọc có giá trị khác "all" |

**Bảng dữ liệu (Data Table):**
| STT | Tên cột | Hiển thị | Ghi chú |
| :--- | :--- | :--- | :--- |
| 1 | Người nhận | Họ tên (Đậm) + Email (Nhạt) | Cột này được cấu hình làm key tìm kiếm local (`searchKey="recipient"`). |
| 2 | Tiêu đề (Subject) | Text string | - |
| 3 | Loại | Text uppercase | Tên loại map theo `TYPE_OPTIONS` |
| 4 | Trạng thái | Badge + Error Msg | Nếu `failed`, sẽ hiện nội dung lỗi (`error_message`) ngay dưới cục Badge. |
| 5 | Thời gian | Ngày giờ (dd/MM/yyyy, hh:mm:ss) | Ưu tiên hiển thị `sent_at`, nếu rỗng lấy `created_at`. |
| 6 | Hành động | Nút Link "Xem hồ sơ" | Dẫn sang `/dashboard/applications/[id]` |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Đang tải API | "Đang tải nhật ký email..." | Text hiển thị giữa bảng |
| Mạng lỗi / Server lỗi | React Query Error "Không thể tải nhật ký email." | Console / Fallback UI |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Quản lý State:**
   - Component sử dụng `useState` cho `type` và `status`.
2. **Fetch Data:**
   - `useQuery` theo dõi thay đổi của `type` và `status`.
   - Hàm fetch đẩy tham số qua URL Params (`?type=...&status=...`).
   - `staleTime: 5000` (dữ liệu làm mới mỗi 5 giây nếu người dùng chuyển tab liên tục).
3. **Logic Hiển thị Cột Người nhận:**
   - Email log lưu ID người nhận qua relations `users_email_logs_recipient_idTousers`. Bảng sẽ móc thông tin `fullName` và `email` từ relation này.
4. **Logic Cột Thời Gian:**
   - Cơ sở dữ liệu cho phép `sent_at` là null (đối với thư đang hàng đợi hoặc fail ngay lập tức). Nếu `sent_at` null, bảng tự động fallback lấy `created_at` (thời điểm hệ thống tạo log).

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Email không thuộc đơn ứng tuyển nào:** Trong hệ thống, có thể có Email được gửi độc lập không nằm trong chu trình Application (ví dụ gửi OTP đăng ký). Cột "Hành động" của DataTable có câu lệnh `row.original.applications?.id ? <Link> : null` để ẩn nút "Xem hồ sơ" nếu email này không thuộc Application nào.
- **Tin báo Lỗi dài:** Nội dung báo lỗi từ Resend/SMTP có thể rất dài, do đó text lỗi có style `max-w-xs break-words` để không làm vỡ giao diện bảng.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/emails` | `GET` | Lấy danh sách toàn bộ Audit Email Logs với tùy chọn lọc Query. |

### Đặc tả Request / Response
**Request URL:**
```http
GET /api/dashboard/emails?type=invite&status=sent
```

**Response Payload (JSON):**
```json
{
  "success": true,
  "data": [
    {
      "id": "log_abc123",
      "subject": "Thư mời phỏng vấn",
      "type": "invite",
      "status": "sent",
      "sent_at": "2026-05-05T08:00:00Z",
      "created_at": "2026-05-05T07:59:00Z",
      "error_message": null,
      "users_email_logs_recipient_idTousers": {
        "fullName": "Nguyen Van B",
        "email": "nguyenvanb@gmail.com"
      },
      "applications": {
        "id": "app_xyz456"
      }
    }
  ]
}
```
