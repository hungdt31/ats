# Tài liệu Đặc tả Màn hình: Quản lý Kênh Đăng tin (Job Channels)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Kênh Đăng tin (Job Channels) |
| **Đường dẫn file** | `app/dashboard/jobs/[id]/channels/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu theo cấu trúc Layout 2 cột, logic lưu URL đăng tuyển đa kênh. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là màn hình cho phép HR quản lý, lưu trữ đường dẫn (URL) và theo dõi trạng thái hiển thị của một Tin tuyển dụng trên nhiều kênh phân phối khác nhau (Ví dụ: Đăng trên LinkedIn, VietnamWorks, TopCV). Giúp doanh nghiệp biết được tin đang được quảng cáo ở đâu.
- **User Flow:** 
  1. Người dùng bấm "Channels" tại dòng Việc làm tương ứng.
  2. Trang tải danh sách các kênh đã đăng ở cột bên phải.
  3. Người dùng sử dụng Form ở cột bên trái để khai báo thêm một Kênh mới, điền Link bài viết và trạng thái.
  4. Bấm "Lưu channel", hệ thống lưu lại và load lập tức bảng bên phải.

### IPO Tổng quan
- **Input:** ID Việc làm (`[id]`). Các giá trị Form khai báo: `channel` (Tên kênh), `external_url` (Link bài), `external_id` (Mã bài), `status` (Trạng thái).
- **Process:** 
  - Gọi API GET để fetch danh sách các Channels đã lưu của riêng Job ID này.
  - Gọi API POST để lưu/cập nhật thông tin kênh mới vào DB.
- **Output:** Thông báo Toast (Thành công/Thất bại), clear các field ngoại trừ `status` và `channel` để có thể nhập nhanh kênh khác. Bảng danh sách kênh tự động Refetch dữ liệu.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Quản lý Kênh đăng tin]`

### Chi tiết điều khiển
**Cột Trái (Form Thêm/Sửa):**
| STT | Tên thành phần | Loại | Thông số Config / Ràng buộc |
| :--- | :--- | :--- | :--- |
| 1 | Kênh tuyển dụng | Select | `linkedin`, `itviec`, `topcv`, `vietnamworks`, `website` |
| 2 | Trạng thái đăng | Select | `pending`, `posted`, `failed`, `expired`, `removed` |
| 3 | Link bài (External URL)| URL Input | Text bắt đầu bằng `http`/`https`. Tuỳ chọn. |
| 4 | ID Bài (External ID) | Text Input | Mã ID sinh ra bởi kênh thứ 3 (VD: job-123). Tuỳ chọn. |
| 5 | Nút Lưu Channel | Button | Disabled nếu đang gửi POST request. |

**Cột Phải (Bảng Danh sách):**
| STT | Cột hiển thị | Chi tiết |
| :--- | :--- | :--- |
| 1 | Kênh (Channel) | Tên kênh In đậm (Map theo `CHANNELS_OPTIONS`). |
| 2 | Trạng thái | Cục Badge với màu tương ứng (Posted: Đen, Expired: Xám, Removed: Đỏ). |
| 3 | Thông tin chi tiết | Hiển thị Mã ID. Hiển thị chữ "Xem tin đăng" (Link màu xanh) có thể bấm chuyển hướng trực tiếp ra bài post. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Bảng rỗng | "Chưa đăng tin lên bất kỳ kênh nào." | Text ở giữa bảng |
| Form trống Kênh/Trạng thái| "Vui lòng chọn kênh và trạng thái." | Toast (Đỏ) |
| Cập nhật thành công | "Cập nhật kênh tuyển dụng thành công!" | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Khởi tạo:**
   - Dùng hook `useQuery` lấy Object JSON. API trả về cả mảng `channels` và thông tin `job` gốc (để dùng hiển thị Tiêu đề job lên Header "Vị trí: [Tên job]").
2. **Logic Cập nhật / Thêm mới qua Form:**
   - Khi Form Trigger `handleSubmit`, hệ thống kiểm tra logic.
   - Gửi API qua `fetch` POST. API Backend được thiết kế dưới dạng **Upsert**: Nếu HR chọn `linkedin` mà DB đã có rồi, Backend tự động đè/cập nhật đè dữ liệu cũ. Nếu chưa có, tạo Record mới.
   - Khi kết thúc, UI làm rỗng ô Link và ID, đưa `channel` về mặc định `"linkedin"` và gọi `refetch()` nạp lại bảng.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Target Link:** Nút mở External Link "Xem tin đăng" trong bảng được config `target="_blank" rel="noopener noreferrer"` chuẩn bảo mật để mở tab mới mà không cấp quyền access DOM cho bên thứ 3.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/jobs/[id]/channels` | `GET` | Lấy danh sách các kênh phân phối của 1 job ID. |
| `/api/dashboard/jobs/[id]/channels` | `POST` | (Upsert) Thêm kênh mới hoặc cập nhật URL/Trạng thái của kênh đã có. |

### Đặc tả Request / Response
**1. Request Cập nhật Kênh (POST JSON):**
```json
{
  "channel": "linkedin",
  "external_url": "https://www.linkedin.com/jobs/view/12345",
  "external_id": "LI-12345",
  "status": "posted"
}
```

**2. Response Lấy danh sách (GET):**
```json
{
  "success": true,
  "data": {
    "job": {
      "title": "Senior Frontend Developer"
    },
    "channels": [
      {
        "id": "chan_abc",
        "channel": "linkedin",
        "external_url": "https://www.linkedin.com/jobs/view/12345",
        "external_id": "LI-12345",
        "status": "posted"
      }
    ]
  }
}
```
