# Tài liệu Đặc tả Màn hình: Chỉnh sửa Tin tuyển dụng (Job Edit)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Chỉnh sửa Tin tuyển dụng |
| **Đường dẫn file** | `app/dashboard/jobs/[id]/edit/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu theo form chỉnh sửa đa trường (Multi-fields Form), logic parse JSON cho Kỹ năng và Submit bằng API PUT. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Cho phép nhà tuyển dụng cập nhật chi tiết nội dung của một bài đăng tuyển cụ thể (Mô tả công việc, mức lương, yêu cầu...). Có thể dùng trang này để thay đổi trạng thái đăng tuyển (ví dụ đóng tin khi đủ người).
- **User Flow:** 
  1. Người dùng bấm "Chỉnh sửa" tại danh sách Việc làm.
  2. Giao diện tải dữ liệu cũ của Job và điền (binding) tự động vào form.
  3. Người dùng thay đổi thông tin (Text, Select, Textarea).
  4. Bấm "Lưu tin tuyển dụng", hệ thống ghi nhận vào Database và chuyển hướng ra ngoài danh sách.

### IPO Tổng quan
- **Input:** 12 trường dữ liệu từ form (Tiêu đề, phòng ban, địa điểm, headcount, lương, hình thức, trạng thái, ngày hết hạn, skills, mô tả, yêu cầu, quyền lợi).
- **Process:** 
  - Gọi GET `/api/dashboard/jobs/[id]` để nạp dữ liệu. Parse cột `required_skills` từ Array/JSON sang chuỗi String để hiển thị.
  - Khi submit, đóng gói dữ liệu, parse lại chuỗi Kỹ năng thành mảng `skillsArray` và gọi `PUT`.
- **Output:** Toast thông báo. Redirect về màn hình List kèm reload Component (`router.refresh()`).

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Form Chỉnh sửa Tin tuyển dụng]`

### Chi tiết điều khiển
**Phần Header:**
| STT | Tên thành phần | Loại | Chức năng |
| :--- | :--- | :--- | :--- |
| 1 | Nút Quay lại | Link | Trở về màn hình `/dashboard/jobs`. |

**Phần Form Input:**
| STT | Tên trường | Loại UI | Ràng buộc |
| :--- | :--- | :--- | :--- |
| 2 | Tiêu đề tin | Input text | Bắt buộc (`required`). |
| 3 | Phòng ban, Địa điểm | Input text | Tùy chọn. |
| 4 | Headcount | Number | Bắt buộc, `min="1"`. |
| 5 | Lương (Min - Max) | Number | Tùy chọn. |
| 6 | Hạn ứng tuyển | Date Picker | Format kiểu `YYYY-MM-DD`. Tùy chọn. |
| 7 | Hình thức làm việc | Select | Thuộc `full_time`, `part_time`, `contract`. |
| 8 | Trạng thái | Select | Thuộc `draft`, `active`, `closed`, `archived`. |
| 9 | Kỹ năng yêu cầu | Input text | Nhập các tag cách nhau bằng dấu phẩy. |
| 10 | Mô tả công việc | Textarea | Bắt buộc. Max 4 dòng hiển thị. |
| 11 | Yêu cầu / Quyền lợi | Textarea | Tùy chọn. |
| 12 | Nút Submit | Button | Disabled khi đang xử lý API. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Để trống tiêu đề/mô tả | "Vui lòng nhập tiêu đề và mô tả công việc." | Toast (Đỏ) |
| Lỗi API Update | Lấy message từ server hoặc "Đã xảy ra lỗi." | Toast (Đỏ) |
| Submit thành công | "Cập nhật tin tuyển dụng thành công!" | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Binding Data (Load form):**
   - Sử dụng `useEffect` lắng nghe khi `data` (từ React Query) thay đổi. Nếu có `data`, set toàn bộ vào các biến React States.
   - Cắt chuỗi ngày tháng: Database lưu dạng chuẩn ISO `2026-12-31T23:59:59Z`, form input type `date` chỉ nhận `YYYY-MM-DD`. Logic sử dụng `split("T")[0]` để gán.
2. **Logic Parse Array Kỹ năng (Required Skills):**
   - **Khi tải lên (Load):** `required_skills` trong DB có thể lưu dưới dạng JSON String `["React", "Node"]` hoặc mảng JSONB Array trực tiếp. Mã nguồn sử dụng khối `try...catch` và `JSON.parse` để biến mảng này thành một chuỗi `"React, Node"` gán vào form.
   - **Khi lưu xuống (Submit):** Lấy chuỗi trên, dùng `.split(",")`, `map` để `trim()` khoảng trắng, và `filter(Boolean)` để bỏ đi các phần tử rỗng. Gửi xuống API là một Mảng thuần (`Array`).
3. **Ép kiểu Lương và Headcount:**
   - Khi Form submit, các giá trị số phải được ép kiểu an toàn: `salary_min: salaryMin ? parseInt(salaryMin, 10) : null`. Tránh gửi String xuống trường Integer của Database.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/jobs/[id]` | `GET` | Lấy chi tiết thông tin đầy đủ để binding vào Form. |
| `/api/dashboard/jobs/[id]` | `PUT` | Cập nhật nguyên khối (Replace toàn bộ các field cấu hình của Job). |

### Đặc tả Request / Response
**Request Payload API Cập nhật (PUT JSON):**
```json
{
  "title": "Senior React Developer",
  "description": "Làm việc với hệ thống lớn...",
  "requirements": "3 năm kinh nghiệm React",
  "benefits": "BHXH, thưởng tháng 13",
  "location": "Hà Nội",
  "department": "IT",
  "salary_min": 20000000,
  "salary_max": 40000000,
  "employment_type": "full_time",
  "required_skills": ["React", "TypeScript", "Next.js"],
  "headcount": 2,
  "status": "active",
  "expires_at": "2026-12-31"
}
```

**Response (Thành công):**
```json
{
  "success": true,
  "message": "Cập nhật thành công",
  "data": { "id": "job_123" }
}
```
