# Tài liệu Đặc tả Màn hình: Tổng quan Dashboard (Employer/Admin)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Tổng quan Dashboard (Trang chủ quản trị) |
| **Đường dẫn file** | `app/dashboard/page.tsx` và `app/dashboard/dashboard-charts.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Cập nhật tài liệu thực tế theo mã nguồn sử dụng Prisma SSR |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là trang đầu tiên hiển thị sau khi người dùng thuộc nhóm nội bộ (Admin, HR, Interviewer) đăng nhập thành công. Trang cung cấp cái nhìn toàn cảnh bằng các con số thống kê (KPIs) về hoạt động tuyển dụng hiện tại của công ty và biểu đồ trực quan.
- **User Flow:** 
  1. Người dùng (Admin/HR) đăng nhập thành công.
  2. Hệ thống redirect về `/dashboard`.
  3. Server lấy session, đếm số lượng bản ghi từ cơ sở dữ liệu.
  4. Trả về giao diện HTML có chứa các thẻ số liệu thống kê (Active Jobs, New Applications, Scheduled Interviews) và biểu đồ.

### IPO Tổng quan
- **Input:** Token/Cookie phân quyền để lấy Session thông tin người dùng (`getSession()`).
- **Process:** 
  - Gọi đồng thời (Promise.all) 11 câu truy vấn đếm (`prisma.count`) qua các bảng Jobs, Applications, Interviews, Users.
- **Output:** Giao diện gồm 3 Card KPI chính, khu vực Biểu đồ thống kê (`DashboardCharts`) và khu vực Thống kê người dùng theo Role.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Dashboard Overview]`

### Chi tiết điều khiển
| STT | Tên thành phần | Loại | Thông tin hiển thị | Hành động |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Lời chào Header | Text | Chào mừng + Tên người dùng (`session.user.fullName`). | - |
| 2 | Card: Tin hoạt động | KPI Card | Đếm Job có `status: "active"`. | Link chuyển hướng `/dashboard/jobs`. |
| 3 | Card: Đơn mới | KPI Card | Đếm Application có `status: "applied"`. | Link chuyển hướng `/dashboard/applications`. |
| 4 | Card: Phỏng vấn | KPI Card | Đếm Interview có `status: "scheduled"`. | Link chuyển hướng `/dashboard/interviews`. |
| 5 | Biểu đồ tổng quan | Chart | Truyền số liệu tổng quan vào `DashboardCharts` để vẽ biểu đồ trực quan. | - |
| 6 | Thống kê User | Grid/Card | Hiển thị số lượng user chia theo 4 role: Admin, HR, Phỏng vấn viên, Ứng viên. | - |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Lỗi DB | Trang tự động crash (Next.js Error Boundary) nếu mất kết nối Prisma. | Màn hình lỗi hệ thống |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Khởi tạo trang (Server-Side Rendering - RSC):**
   - Đọc Session bằng `await getSession()`. Fallback tên là `"Thành viên"` nếu không có tên.
   - Chạy 11 truy vấn độc lập thông qua `Promise.all` để tránh block tuần tự (Water-falling), giúp tốc độ render trang nhanh hơn đáng kể.
2. **Các luồng truy vấn đếm:**
   - Jobs: `active`, `draft`
   - Applications: `applied`, `hired`, `interviewing`, total count.
   - Interviews: `scheduled`
   - Users: `admin`, `hr`, `interviewer`, `candidate`
3. **Truyền Props:**
   - Client Component `<DashboardCharts />` nhận vào 3 tham số KPI chính (active jobs, new applications, scheduled interviews) để render biểu đồ. Các thư viện biểu đồ (như Recharts/Chart.js) không chạy được trực tiếp trên Server nên cần tách riêng Component con.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Hiệu năng Database:** Vì Dashboard là trang vào nhiều nhất, việc Count 11 lệnh trên các bảng lớn có thể làm chậm Database. Tuy nhiên hệ thống hiện tại đang sử dụng `count()` trực tiếp bằng SQL sẽ rất nhanh ở quy mô vừa. Nếu quy mô lớn, cần cân nhắc cache Redis hoặc tính toán bằng Cronjob ngầm.
- **Zero States (Rỗng):** Nếu các số liệu đếm ra 0, giao diện vẫn hiển thị số 0 rõ ràng trên thẻ KPI.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan Logic (Server Component)
Không gọi API nội bộ bằng Fetch. Component này tự truy vấn thẳng vào Database bằng Prisma ORM trong môi trường Node.js.

### Truy vấn SQL (Mô phỏng qua Prisma)
Khối truy vấn song song tại SSR:
```typescript
const [
  activeJobsCount,
  newApplicationsCount,
  scheduledInterviewsCount,
  totalApplicationsCount,
  hiredApplicationsCount,
  interviewingApplicationsCount,
  draftJobsCount,
  adminCount,
  hrCount,
  interviewerCount,
  candidateCount,
] = await Promise.all([
  prisma.jobs.count({ where: { status: "active" } }),
  prisma.applications.count({ where: { status: "applied" } }),
  prisma.interviews.count({ where: { status: "scheduled" } }),
  prisma.applications.count(),
  prisma.applications.count({ where: { status: "hired" } }),
  prisma.applications.count({ where: { status: "interviewing" } }),
  prisma.jobs.count({ where: { status: "draft" } }),
  prisma.user.count({ where: { role: "admin" } }),
  prisma.user.count({ where: { role: "hr" } }),
  prisma.user.count({ where: { role: "interviewer" } }),
  prisma.user.count({ where: { role: "candidate" } }),
]);
```
Sau đó dữ liệu được binding thẳng vào HTML/JSX để Server trả về cho người dùng giao diện tĩnh và nhanh nhất.
