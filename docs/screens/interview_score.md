# Tài liệu Đặc tả Màn hình: Đánh giá Phỏng vấn (Scorecard)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Đánh giá Phỏng vấn (Scorecard) |
| **Đường dẫn file** | `app/dashboard/interviews/[id]/score/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu theo cấu trúc form đánh giá điểm số 4 tiêu chí và logic Submit API. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là giao diện dành riêng cho Phỏng vấn viên (Interviewer), HR hoặc Admin để chấm điểm và nhận xét ứng viên ngay sau buổi phỏng vấn.
- **User Flow:** 
  1. Người dùng bấm nút "Thêm đánh giá / Chấm điểm" từ trang Chi tiết phỏng vấn.
  2. Giao diện hiển thị form chấm điểm với các tiêu chí định lượng (1-10) và định tính (Textarea).
  3. Người dùng điền điểm, nhận xét, chọn kết quả tổng quan (Pass/Fail/Hold) và submit.
  4. Hệ thống lưu kết quả (Scorecard) gắn với người chấm (dựa trên session token) và chuyển hướng về trang Chi tiết phỏng vấn.

### IPO Tổng quan
- **Input:** ID lịch phỏng vấn (`[id]`). Các số liệu từ form (Kỹ thuật, Giao tiếp, Cultural Fit, Điểm chung). Các đoạn text nhận xét. Trạng thái kết quả (`result`). Cờ xác nhận (`is_final`).
- **Process:** 
  - Gọi API `POST /api/dashboard/interviews/[id]/score` để lưu Scorecard vào Database.
- **Output:** Bắn Toast thông báo. Redirect về trang `/dashboard/interviews/[id]` và gọi `router.refresh()`.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Form Chấm điểm]`

### Chi tiết điều khiển
**Phần Header:**
| STT | Tên thành phần | Loại | Thông tin hiển thị |
| :--- | :--- | :--- | :--- |
| 1 | Nút Quay lại | Link | Trở về màn hình chi tiết buổi phỏng vấn. |
| 2 | Tiêu đề phụ | Text | Tên ứng viên (`data.applications.users.fullName`) và Tên Vị trí. |

**Phần Form chấm điểm:**
| STT | Tên thành phần | Loại | Ràng buộc (Validation) | Trạng thái mặc định |
| :--- | :--- | :--- | :--- | :--- |
| 3 | Khối Điểm số (4 ô) | Number Input | Bắt buộc. Giới hạn `min="1"`, `max="10"`. Gồm: Kỹ thuật, Giao tiếp, Cultural Fit, Điểm chung. | `5` |
| 4 | Kết quả tổng thể | Select | Bắt buộc. Thuộc `RESULT_OPTIONS`: Pass, Fail, Hold. | `pass` |
| 5 | Điểm mạnh | Textarea | Tùy chọn. Max 2 dòng hiển thị. | Trống |
| 6 | Điểm yếu | Textarea | Tùy chọn. Max 2 dòng hiển thị. | Trống |
| 7 | Nhận xét chi tiết | Textarea | Tùy chọn. Max 3 dòng hiển thị. | Trống |
| 8 | Checkbox "Is Final" | Checkbox | Tùy chọn. Đánh dấu để biết đây có phải quyết định chốt cuối cùng không. | `false` |
| 9 | Nút Lưu đánh giá | Button | Khóa (Disable) khi đang pending. | Enable |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Quên chọn Kết quả | "Vui lòng chọn kết quả đánh giá." | Toast (Đỏ) |
| Lỗi API / Trùng lặp | Message báo lỗi từ Backend | Toast (Đỏ) |
| Thành công | "Đã lưu bảng điểm đánh giá thành công!" | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Khởi tạo:**
   - Đọc tham số URL `params.id`.
   - Setup các state mặc định cho điểm số là chuỗi `"5"` (sau khi submit sẽ được ép kiểu bằng `parseInt(..., 10)`).
   - Component gọi `useQuery` để lấy tên ứng viên và tên việc làm hiển thị lên phần Header (giúp người chấm không bị nhầm lẫn ứng viên).
2. **Submit Logic (`handleSubmit`):**
   - Ngăn sự kiện tải lại trang.
   - Validate thủ công xem `result` có trống không.
   - Bật cờ `isPending = true` để khóa nút bấm.
   - Gửi request `POST`. Body được parse chặt chẽ (đảm bảo các ô điểm chuyển về kiểu `Number` thay vì String trước khi gửi xuống DB).
   - Khi API báo `success = true`, gọi `router.push()` dắt người dùng về trang chi tiết và `router.refresh()` để buộc Server Components tải lại bản Audit mới nhất.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Truy cập sai ID:** Nếu API GET ban đầu (trước khi render form) ném lỗi do sai `interviewId`, giao diện hiển thị ngay text màu đỏ "Không tìm thấy thông tin buổi phỏng vấn" và ẩn toàn bộ Form.
- **Trạng thái ép kiểu (Type Casting):** Form sử dụng input type `number` nhưng React State lưu dưới dạng string (`"5"`). Khi gửi API, bắt buộc phải qua `parseInt(val, 10)` để đảm bảo DB nhận đúng kiểu Integer cho các cột score.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/interviews/[id]` | `GET` | (Dùng chung) Lấy thông tin tóm tắt để render Header. |
| `/api/dashboard/interviews/[id]/score` | `POST` | Lưu bản ghi đánh giá (Scorecard) mới. Liên kết bản ghi này với Session User ID hiện tại (Người chấm). |

### Đặc tả Request / Response
**Request Payload API POST (JSON):**
```json
{
  "technical_score": 8,
  "communication_score": 7,
  "cultural_fit_score": 9,
  "overall_score": 8,
  "strengths": "Nắm vững React, Next.js",
  "weaknesses": "Hơi run khi trả lời câu hỏi thuật toán",
  "feedback": "Phù hợp văn hóa công ty, có thể training thêm cấu trúc dữ liệu",
  "result": "pass",
  "is_final": true
}
```

**Response (Thành công):**
```json
{
  "success": true,
  "message": "Đã lưu bảng điểm",
  "data": {
    "id": "score_abc123"
  }
}
```
