# Tài liệu Đặc tả Màn hình: Quản lý Tin Tuyển dụng (Jobs Dashboard)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Danh sách Tin tuyển dụng |
| **Đường dẫn file** | `app/dashboard/jobs/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu theo cấu trúc Component DataTable thực tế và Query lấy Headcount/Lượt nộp đơn. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là trang trung tâm để HR và Admin xem lại toàn bộ tin tuyển dụng đã tạo trong hệ thống. Theo dõi được số lượng ứng viên nộp vào từng tin, hạn chót và trạng thái hiển thị của tin đó.
- **User Flow:** 
  1. Người dùng truy cập menu `Việc làm` (Jobs).
  2. Bảng dữ liệu hiển thị tất cả tin tuyển dụng, bao gồm các thông số số liệu (như Tổng số CV đã nộp).
  3. Người dùng sử dụng các nút thao tác để chuyển sang chế độ "Chỉnh sửa tin" hoặc "Channels" (kênh đăng tin ngoài).

### IPO Tổng quan
- **Input:** Biến state `status` dùng để lọc (Đang tuyển, Nháp, Đã đóng, Lưu trữ). Tìm kiếm theo tên Job.
- **Process:** 
  - Gọi API GET `/api/dashboard/jobs?status={status}` qua `react-query`.
  - Backend API đếm gộp số lượng đơn ứng tuyển (`_count.applications`).
- **Output:** Giao diện bảng (`DataTable`) hiển thị danh sách các việc làm.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Danh sách Tin tuyển dụng]`

### Chi tiết điều khiển
**Phần Header / Filter:**
| STT | Tên thành phần | Loại | Chức năng | Trạng thái mặc định |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Nút "Đăng tin tuyển dụng" | Link Button | Dẫn sang trang `/dashboard/jobs/new`. | Mở |
| 2 | Lọc Trạng thái tin | Select | Gồm: active, draft, closed, archived. | "Tất cả trạng thái" |
| 3 | Nút "Xóa lọc" | Button | Click để reset filter `status` về "all". | Ẩn nếu chưa lọc |

**Phần Bảng dữ liệu (Data Table):**
| STT | Tên cột | Hiển thị | Ghi chú |
| :--- | :--- | :--- | :--- |
| 1 | Vị trí / Title | Tên vị trí (đậm) + Dòng text phụ "Đã nộp: X đơn". | Searchable: `searchKey="title"`. |
| 2 | Bộ phận | Tên phòng ban (`department`). | Nếu rỗng hiện `—`. |
| 3 | Trạng thái | Badge màu tương ứng theo `STATUS_OPTIONS`. | Active (Xanh), Draft (Xám), Closed (Trắng/Viền), Archived (Đỏ). |
| 4 | Hạn ứng tuyển | Ngày tháng (`vi-VN`) | Nếu `expires_at` null thì in chữ "Không giới hạn". |
| 5 | Headcount | Số lượng nhân sự cần tuyển. | Default là 1. |
| 6 | Hành động | 2 nút "Chỉnh sửa" & "Channels". | Điều hướng sang URL chứa ID tương ứng. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Loading data | "Đang tải danh sách tin tuyển dụng..." | Text giữa bảng |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Quản lý Fetch:**
   - Dùng hook `useQuery` với dependency `queryKey: ["dashboard", "jobs", status]`.
   - Lưu cache trong 5 giây (`staleTime: 5000`).
2. **Logic Hiển thị _Count (Thống kê đơn):**
   - Object trả về từ API có đính kèm `_count.applications`. Cột "Vị trí / Title" sẽ dựa vào số này để hiển thị "Đã nộp: X đơn". (Nếu undefined thì fallback là 0).
3. **Logic Hạn ứng tuyển (Expired At):**
   - Hệ thống cho phép tin tuyển dụng tuyển vô thời hạn (không có deadline). Khi đó `expires_at` lưu Database bằng `null`.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Hiệu năng:** Việc đếm số ứng viên cho mỗi job được thực hiện trên Server-side (Prisma Query) để tránh nghẽn tải thay vì bắt frontend phải tự fetch rời.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/jobs` | `GET` | Lấy danh sách việc làm kèm theo lượt nộp đơn. Cung cấp chức năng lọc bằng URL Query `?status=`. |

### Đặc tả Request / Response
**Response Payload (JSON):**
```json
{
  "success": true,
  "data": [
    {
      "id": "job_123",
      "title": "Senior Frontend Developer",
      "department": "Engineering",
      "status": "active",
      "expires_at": "2026-12-31T23:59:59Z",
      "headcount": 2,
      "_count": {
        "applications": 15
      }
    }
  ]
}
```
