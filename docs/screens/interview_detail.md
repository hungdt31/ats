# Tài liệu Đặc tả Màn hình: Chi tiết Phỏng vấn (Interview Detail & Scorecard)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Chi tiết Phỏng vấn & Bảng điểm (Scorecard) |
| **Đường dẫn file** | `app/dashboard/interviews/[id]/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu theo cấu trúc Layout chia cột, logic React Query và luồng đánh giá Scorecard. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là trang trung tâm quản lý một lịch hẹn phỏng vấn cụ thể. Cung cấp chức năng cập nhật trạng thái lịch hẹn (Hoàn thành, Dời lịch, Hủy) và quan trọng nhất là hiển thị bảng điểm (Scorecard) đánh giá ứng viên từ các phỏng vấn viên.
- **User Flow:** 
  1. Người dùng (Admin/HR/Interviewer) bấm vào 1 lịch phỏng vấn.
  2. Giao diện tải chi tiết lịch hẹn qua ID.
  3. Ở Header có các nút đổi trạng thái lịch hẹn nhanh.
  4. Cột trái: Tóm tắt thông tin ứng viên, thời gian, meeting link.
  5. Cột phải: Xem bảng đánh giá, hoặc bấm nút chuyển hướng sang màn hình Chấm điểm.

### IPO Tổng quan
- **Input:** ID lịch phỏng vấn (`[id]`). Thao tác click các nút đổi trạng thái (`handleUpdateStatus`).
- **Process:** 
  - Tải dữ liệu bằng `@tanstack/react-query` (`GET /api/dashboard/interviews/[id]`).
  - Gửi request `PATCH` để cập nhật Trạng thái lịch hẹn.
- **Output:** Giao diện chi tiết với các cột hiển thị.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Chi tiết Phỏng vấn]`

### Chi tiết điều khiển
**Khu vực Header:**
| STT | Tên thành phần | Loại | Chức năng | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Nút Quay lại | Link | Trở về `/dashboard/interviews` | - |
| 2 | Các nút Đổi trạng thái | Button Group | Lặp qua `STATUS_OPTIONS` để tạo nút: Hoàn thành, Huỷ bỏ, Dời lịch. | Disabled nếu trạng thái hiện tại trùng với nút hoặc API đang pending. |

**Cột Trái (Chi tiết lịch hẹn):**
| STT | Tên hiển thị | Ghi chú dữ liệu map |
| :--- | :--- | :--- |
| 1 | Ứng viên & Vị trí | `data.applications.users` và `data.applications.jobs.title` |
| 2 | Người phỏng vấn | `data.users.fullName` |
| 3 | Thời gian | Hiển thị Ngày, giờ và Thời lượng (phút). |
| 4 | Link / Địa điểm | Link hiển thị text xanh có thể bấm, Địa điểm hiển thị text thường. |
| 5 | Ghi chú HR | Text box màu nền xám. Ẩn nếu rỗng. |

**Cột Phải (Bảng điểm - Scorecard):**
| STT | Tên thành phần | Loại | Chức năng |
| :--- | :--- | :--- | :--- |
| 1 | Nút "+ Thêm đánh giá" | Link Button | Chuyển hướng trang `/dashboard/interviews/[id]/score` |
| 2 | Card Đánh giá | Block | Mỗi bài đánh giá của 1 Interviewer là một cục Card riêng, hiển thị điểm số và Badge "Pass/Hold/Fail". |
| 3 | Thống kê Điểm | 4 Cột số | Kỹ thuật (10), Giao tiếp (10), Cultural Fit (10), Điểm chung (10). |
| 4 | Điểm mạnh / Yếu | Text Block | Text dài. Ẩn nếu Interviewer không viết. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Load chưa xong | "Đang tải thông tin buổi phỏng vấn..." | Loading State |
| Lỗi API / Không có | "Không tìm thấy thông tin buổi phỏng vấn." | Error State |
| Lỗi cập nhật TT | "Lỗi cập nhật trạng thái." (Hoặc message Backend) | Toast (Đỏ) |
| Thành công | "Cập nhật trạng thái thành công!" | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Khởi tạo:**
   - Đọc tham số từ URL `params.id`.
   - `useQuery` gọi Fetch API để lấy thông tin. Tự động parse JSON.
2. **Logic Cập nhật Trạng thái Nhanh:**
   - Header render một dải nút bấm (loop qua biến `STATUS_OPTIONS`). Nút nào có `value` bằng với trạng thái hiện tại (`data.status`) sẽ bị làm mờ (disabled).
   - Khi bấm vào nút, hàm `handleUpdateStatus` sẽ gọi API `PATCH /api/dashboard/interviews/[id]` và body gửi lên là `{ status }`.
   - Sau khi có kết quả `success`, bắn Toast và gọi hàm `refetch()` của React Query để nạp lại dữ liệu ngay lập tức. Cột bên trái "Chi tiết" sẽ thay đổi huy hiệu (Badge) ngay.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Nhiều người chấm điểm:** Một buổi phỏng vấn có thể có 2-3 người tham gia đánh giá. Giao diện cột bên phải tự động lặp mảng `data.interview_scores` ra để hiển thị tất cả các bài nhận xét mà không bị đè lên nhau.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/dashboard/interviews/[id]` | `GET` | Lấy chi tiết lịch phỏng vấn và relation: Đơn ứng tuyển (có job, user ứng viên) và mảng Bài đánh giá (có user người chấm). |
| `/api/dashboard/interviews/[id]` | `PATCH` | Chỉ thay đổi cột `status` của lịch hẹn. |

### Đặc tả Request / Response
**1. Request Cập nhật Trạng thái (PATCH):**
```json
{
  "status": "completed"
}
```

**2. Response Lấy chi tiết (GET):**
```json
{
  "success": true,
  "data": {
    "id": "iv_123",
    "status": "scheduled",
    "type": "video",
    "scheduled_at": "2026-05-10T14:00:00Z",
    "duration_minutes": 45,
    "meeting_link": "https://meet.google.com/abc",
    "location": null,
    "notes": "Phỏng vấn Front-End",
    "applications": {
      "id": "app_456",
      "users": { "fullName": "Nguyen Van C", "email": "nvc@gmail.com" },
      "jobs": { "title": "Senior Frontend" }
    },
    "users": { "fullName": "Tran Van HR" },
    "interview_scores": [
      {
        "id": "score_1",
        "overall_score": 8,
        "technical_score": 9,
        "communication_score": 7,
        "cultural_fit_score": 8,
        "strengths": "Cứng JS",
        "weaknesses": "Tiếng Anh trung bình",
        "feedback": "Phù hợp dự án mới",
        "result": "pass",
        "users": { "fullName": "Le Van Tech Lead" }
      }
    ]
  }
}
```
