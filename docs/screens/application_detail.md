# Tài liệu Đặc tả Màn hình: Chi tiết Đơn ứng tuyển (Hồ sơ 360°)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Chi tiết Đơn ứng tuyển (Hồ sơ 360°) |
| **Đường dẫn file** | `app/dashboard/applications/[id]/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu đặc tả theo mã nguồn Prisma SSR |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là giao diện tổng hợp mọi thông tin liên quan đến quá trình ứng tuyển của một ứng viên vào một công việc. Cung cấp góc nhìn toàn cảnh để HR/Nhà tuyển dụng có thể theo dõi tiến độ, xem CV, cập nhật trạng thái đơn, lên lịch phỏng vấn và gửi email trực tiếp từ một nơi.
- **User Flow:** 
  1. HR/Admin truy cập danh sách đơn, click vào một đơn cụ thể.
  2. Trang SSR load đầy đủ dữ liệu từ Database.
  3. Người dùng xem nhanh thông tin tóm tắt bên trái (Tên, CV, Cover Letter).
  4. Bên phải, người dùng thao tác qua các Tab: Cập nhật trạng thái (kèm note), xem lịch sử trạng thái (Audit logs), quản lý lịch phỏng vấn, hoặc gửi email (tích hợp Resend).

### IPO Tổng quan
- **Input:** ID của đơn ứng tuyển (URL Params `[id]`).
- **Process:** Truy vấn DB (`prisma.applications.findUnique`) join đa bảng (jobs, users, status_history, interviews, email_logs).
- **Output:** Giao diện Dashboard chia cột (Left: Summary, Right: Tabs).

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Chi tiết Đơn ứng tuyển 360°]`

### Chi tiết điều khiển
**Cột trái (Summary Info):**
| STT | Tên thành phần | Loại | Thông tin hiển thị |
| :--- | :--- | :--- | :--- |
| 1 | Header | Text & Badge | Tên công việc, Trạng thái đơn hiện tại |
| 2 | Ứng viên | Text | Họ tên, Email, Ngày nộp |
| 3 | Tệp đính kèm | Link mở tab mới | CV file link URL |
| 4 | Cover Letter | Textbox Readonly | Hiển thị nếu ứng viên có nhập thư giới thiệu |

**Cột phải (Tabs Navigation):**
| Tab | Tên thành phần | Loại thao tác | Mô tả tính năng |
| :--- | :--- | :--- | :--- |
| 1 | Cập nhật trạng thái | Form | Chứa `StatusForm` để đổi trạng thái đơn (Sàng lọc, Phỏng vấn, Offered...) kèm theo ghi chú lưu vào Audit. |
| 2 | Lịch sử Audit | Timeline View | Hiển thị log chuyển đổi trạng thái, người thao tác và thời gian. |
| 3 | Phỏng vấn | List & Dialog | Hiển thị danh sách lịch phỏng vấn, điểm đánh giá của Interviewer. Có nút "Lên lịch phỏng vấn" mở popup `CreateInterviewForm`. |
| 4 | Nhật ký Email | List & Dialog | Hiển thị danh sách email đã gửi. Có nút "Gửi Email mới" mở popup `SendEmailForm`. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Sai ID đơn | "404 Not Found" | Hệ thống trả về trang lỗi 404 mặc định (hàm `notFound()`) |
| Gửi/Lưu thành công | (Do các form component con tự định nghĩa) | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Khởi tạo trang (Server-Side Rendering - RSC):**
   - Lấy tham số `[id]` từ URL (`props.params`).
   - Gọi truy vấn `prisma.applications.findUnique` với các block `include` lớn để lấy quan hệ 360:
     - `users`, `jobs`
     - `application_status_history` (include users để lấy người thay đổi)
     - `interviews` (include interview_scores)
     - `email_logs`
   - Gọi truy vấn lấy danh sách Admin/HR/Interviewer (`prisma.user.findMany`) để truyền vào form tạo lịch phỏng vấn.
2. **Hiển thị Form & Logic con (Client Components):**
   - Trạng thái được render trực tiếp thông qua React Components `StatusForm`, `CreateInterviewForm`, `SendEmailForm`. (Mỗi component này sẽ chứa logic gọi API Mutation riêng biệt).
3. **Logic hiển thị điểm phỏng vấn (Interview Scores):**
   - Trong Tab Phỏng vấn, lặp qua `iv.interview_scores`. Dựa vào trường `result` ("pass", "hold", "destructive") sẽ hiển thị Badge kết quả tương ứng.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Truy cập sai ID:** Hệ thống catch dữ liệu rỗng và gọi `notFound()`.
- **Dữ liệu lớn:** Việc join quá nhiều bảng có thể gây chậm SSR, do đó `orderBy` chỉ lấy lịch sử và email theo thứ tự giảm dần mới nhất.
- **Trạng thái lạ:** Nếu `application.status` không khớp với `STATUS_OPTIONS` được định nghĩa sẵn, hệ thống sẽ fallback hiển thị màu sắc mặc định thay vì lỗi màn hình.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan Logic (Server Component)
Vì đây là **Next.js Server Component**, không có Client Fetching cho trang chính, toàn bộ dữ liệu gọi trực tiếp ở máy chủ và render ra HTML:
- Công nghệ: Prisma ORM.

### Truy vấn SQL (Mô phỏng qua Prisma)
```typescript
const application = await prisma.applications.findUnique({
  where: { id: appId },
  include: {
    users: true,
    jobs: true,
    application_status_history: {
      include: { users: { select: { fullName: true, email: true } } },
      orderBy: { changed_at: "desc" },
    },
    interviews: {
      include: {
        users: { select: { fullName: true, email: true } },
        interview_scores: { include: { users: { select: { fullName: true, email: true } } } },
      },
      orderBy: { scheduled_at: "desc" },
    },
    email_logs: { orderBy: { created_at: "desc" } },
  },
});
```
*(Chi tiết Submit form sẽ được đặc tả trong các file Component con `status-form.tsx` hay `send-email-form.tsx`).*
