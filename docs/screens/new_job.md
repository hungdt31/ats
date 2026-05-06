# Tài liệu Đặc tả Màn hình: Tạo Tin Tuyển Dụng Mới (New Job)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Tạo Tin Tuyển Dụng Mới |
| **Đường dẫn file** | `app/dashboard/jobs/new/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 06/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 06/05/2026 | AI | Tạo tài liệu đặc tả luồng submit Form JSON tạo Job. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Giao diện cho HR/Admin tạo mới một thông báo tuyển dụng lên hệ thống.
- **User Flow:** 
  1. Người dùng bấm "Tạo tin tuyển dụng" từ trang danh sách Jobs.
  2. Hệ thống hiển thị biểu mẫu trống.
  3. Người dùng nhập liệu (Tiêu đề, phòng ban, lương, kỹ năng, mô tả...).
  4. Hệ thống kiểm tra hợp lệ, sau đó gọi POST API để lưu.
  5. Đăng thành công, tự động chuyển về `/dashboard/jobs` và làm mới danh sách.

### IPO Tổng quan
- **Input:** 12 trường dữ liệu văn bản, số, danh sách và ngày tháng.
- **Process:** Gom nhóm thông tin, parse chuỗi Kỹ năng cách nhau bằng dấu phẩy thành mảng chuỗi nguyên thuỷ (`Array<string>`), ép kiểu Số lượng (Headcount) và Mức lương (Salary) sang Integer trước khi POST.
- **Output:** Dữ liệu được lưu trong Database (bảng Jobs). Thông báo Toast thành công và tự động Redirect.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Tạo Việc Làm Mới]`

### Chi tiết điều khiển
Bao gồm một Form Card duy nhất ở giữa màn hình. Các phần nhập liệu bao gồm:

| STT | Tên thành phần | Loại UI | Ràng buộc |
| :--- | :--- | :--- | :--- |
| 1 | Tiêu đề | Input text | Bắt buộc (`required`). |
| 2 | Bộ phận, Địa điểm | Input text | Tùy chọn. Cột chia 2 lưới. |
| 3 | Headcount | Number Input | Bắt buộc, min 1, mặc định 1. |
| 4 | Hạn ứng tuyển | Date Picker | Format kiểu `YYYY-MM-DD`. Tùy chọn. |
| 5 | Lương tối thiểu & tối đa | Number Input | Tùy chọn. |
| 6 | Hình thức làm việc | Select | `full_time` (Mặc định), `part_time`, `contract`. |
| 7 | Trạng thái đăng tuyển | Select | `draft` (Mặc định), `active`. |
| 8 | Kỹ năng yêu cầu | Input text | Các từ khóa cách nhau bằng dấu phẩy. |
| 9 | Mô tả công việc | Textarea | Bắt buộc. |
| 10 | Yêu cầu, Quyền lợi | Textarea | Tùy chọn. |
| 11 | Nút Submit | Button | "Lưu tin tuyển dụng". Disabled khi pending. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Thiếu Title / Description | "Vui lòng nhập tiêu đề và mô tả công việc." | Toast (Đỏ) |
| API Error | Lỗi bắt được từ server hoặc "Đã xảy ra lỗi." | Toast (Đỏ) |
| Success | "Tạo tin tuyển dụng thành công!" | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Quản lý dữ liệu chuỗi (String Parsing):**
   - Người dùng nhập trường Kỹ năng: `"React, Node,   AWS "`.
   - Logic `handleSubmit`: `.split(",")` tạo mảng, `.map((s) => s.trim())` xóa khoảng trắng 2 đầu, `.filter(Boolean)` để loại bỏ phần tử trống. Cuối cùng biến thành: `["React", "Node", "AWS"]`.
2. **Quản lý biến Số (Type Casting):**
   - Headcount và Salary lấy từ Input sẽ là Text.
   - Khi tạo body request, bắt buộc dùng `parseInt(value, 10)` để tuân thủ Schema Database. Nếu người dùng bỏ trống Lương, biến sẽ được truyền `null` thay vì `NaN`.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/jobs` | `POST` | Nhận Object Payload mới và Insert trực tiếp vào bảng Jobs. |

### Đặc tả Request / Response
**Request Payload (JSON):**
```json
{
  "title": "Backend Developer",
  "description": "Tham gia phát triển Core Banking...",
  "requirements": "2 năm kinh nghiệm Node.js",
  "benefits": "Macbook Pro, Bảo hiểm cao cấp",
  "location": "HCM",
  "department": "Engineering",
  "salary_min": 25000000,
  "salary_max": 45000000,
  "employment_type": "full_time",
  "required_skills": ["Node.js", "PostgreSQL"],
  "headcount": 1,
  "status": "active",
  "expires_at": "2026-12-31"
}
```
