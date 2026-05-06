# Tài liệu Đặc tả Màn hình: Trạng thái Đơn ứng tuyển

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Cập nhật Trạng thái Đơn ứng tuyển |
| **Đường dẫn file** | `app/dashboard/applications/[id]/status/page.tsx` và `app/dashboard/applications/[id]/status-form.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Đặc tả luồng form cập nhật Audit Log & thay đổi trạng thái theo mã nguồn. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là giao diện (có thể truy cập rời dưới dạng một trang độc lập hoặc được nhúng vào trong Tab của trang Hồ sơ 360°) cho phép nhà tuyển dụng thay đổi vòng ứng tuyển của ứng viên (ví dụ: chuyển từ Sàng lọc sang Phỏng vấn).
- **User Flow:** 
  1. Người dùng mở trang (hoặc tab). Dữ liệu hiện tại được lấy từ `application.status`.
  2. Người dùng chọn trạng thái mới trong danh sách thả xuống.
  3. Người dùng nhập lý do/ghi chú (Tùy chọn) vào ô Textarea.
  4. Bấm "Cập nhật trạng thái". Hệ thống lưu log (Audit) và cập nhật đơn, sau đó hiển thị thông báo.

### IPO Tổng quan
- **Input:** ID đơn ứng tuyển (`applicationId`), Trạng thái mới (`toStatus`), Ghi chú nội bộ (`note`).
- **Process:** 
  - API xử lý: Cập nhật row trong bảng `Applications`.
  - Tạo mới 1 row trong bảng `ApplicationStatusHistory` (Audit Log) để ghi nhận người đổi, thời gian đổi, trạng thái cũ, trạng thái mới và ghi chú.
- **Output:** Thông báo Toast (Thành công/Thất bại), `router.refresh()` để reload lại dữ liệu toàn trang.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Form Cập nhật trạng thái]`

### Chi tiết điều khiển
| STT | Tên thành phần | Loại | Ràng buộc (Validation) | Trạng thái mặc định |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Combobox Trạng thái | Select | Bắt buộc chọn khác null. | Trạng thái hiện tại của đơn. |
| 2 | Ô nhập Ghi chú | Textarea | Tùy chọn. Tối đa độ dài (nếu DB có limit, mặc định ko check). | Trống |
| 3 | Nút Cập nhật | Button | Chỉ gọi API khi có `toStatus`. | Enable (Chuyển "Đang cập nhật..." khi submit) |
| 4 | Nút Quay lại | Link Button | Bấm để trở về Hồ sơ 360° (Nằm ở Header nếu đang xem trang rời). | - |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Trống trạng thái | "Vui lòng chọn trạng thái mới." | Toast (Đỏ) |
| API Trả về lỗi | Lấy message từ API, mặc định: "Đã xảy ra lỗi khi cập nhật." | Toast (Đỏ) |
| Thành công | "Cập nhật trạng thái thành công!" | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Mount (Khởi tạo):**
   - Lấy tham số tĩnh truyền vào Form (`applicationId`, `currentStatus`, `statusOptions`).
   - Setup `useState` cho Form: `toStatus` (mặc định bằng `currentStatus`), `note` (trống).
2. **Submit Form:**
   - Ngăn sự kiện reload trang mặc định (`e.preventDefault()`).
   - Khóa nút bấm (`isPending = true`).
   - Gọi `fetch` với phương thức `POST` tới endpoint `/api/dashboard/applications/[id]/status`.
   - Body mang theo: `to_status`, `note`.
   - Bắt kết quả. Nếu thành công, reset ô `note` về rỗng, nhả khóa nút bấm, bắn Toast xanh và gọi `router.refresh()` để Next.js lấy lại dữ liệu mới nhất (thấy ngay log trên bảng Lịch sử).

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Truy cập trang rời bằng React Query:** Nếu người dùng vô tình f5 hoặc vào trực tiếp URL `/dashboard/applications/[id]/status`, trang này sử dụng `useQuery` để fetch tạm thông tin đơn. Nếu API lỗi (404), nó sẽ không hiện form mà văng dòng chữ "Không thể tải thông tin đơn ứng tuyển."
- **Double click submit:** Form đã chặn qua cơ chế `isPending` disable nút.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/applications/[id]/status` | `POST` | Xử lý cập nhật trạng thái đơn ứng tuyển và viết Audit Log. |
| `/api/dashboard/applications/[id]` | `GET` | (Dành cho trang rời) Lấy thông tin ứng viên và công việc để hiển thị tiêu đề. |

### Đặc tả Request / Response
**Request Payload API POST Cập nhật trạng thái (JSON):**
```json
{
  "to_status": "interviewing",
  "note": "Bạn này pass bài test kỹ năng, chuyển qua báo lịch phỏng vấn HR."
}
```

**Response (Thành công):**
```json
{
  "success": true,
  "message": "Trạng thái đã được lưu",
  "data": null
}
```
