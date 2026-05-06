const fs = require('fs');
const path = require('path');

const screens = [
  { id: 'landing', path: 'app/page.tsx', name: 'Trang chủ (Landing Page)', desc: 'Giới thiệu về hệ thống, hiển thị các công việc nổi bật.' },
  { id: 'login', path: 'app/(auth)/login/page.tsx', name: 'Đăng nhập', desc: 'Cho phép người dùng (Candidate, Employer, Admin) đăng nhập vào hệ thống.' },
  { id: 'register', path: 'app/(auth)/register/page.tsx', name: 'Đăng ký', desc: 'Cho phép ứng viên hoặc nhà tuyển dụng tạo tài khoản mới.' },
  { id: 'candidate_dashboard', path: 'app/candidate/page.tsx', name: 'Bảng điều khiển Ứng viên', desc: 'Quản lý hồ sơ, xem danh sách đơn ứng tuyển và lịch phỏng vấn của ứng viên.' },
  { id: 'dashboard_home', path: 'app/dashboard/page.tsx', name: 'Tổng quan Dashboard (Employer/Admin)', desc: 'Thống kê tổng quan về công việc, ứng viên, lịch phỏng vấn.' },
  { id: 'applications_list', path: 'app/dashboard/applications/page.tsx', name: 'Danh sách Đơn ứng tuyển', desc: 'Quản lý danh sách các ứng viên đã nộp CV vào các công việc.' },
  { id: 'application_detail', path: 'app/dashboard/applications/[id]/page.tsx', name: 'Chi tiết Đơn ứng tuyển', desc: 'Xem thông tin chi tiết của một đơn ứng tuyển, CV, đổi trạng thái.' },
  { id: 'application_emails', path: 'app/dashboard/applications/[id]/emails/page.tsx', name: 'Email Đơn ứng tuyển', desc: 'Gửi và xem lịch sử email liên quan đến đơn ứng tuyển.' },
  { id: 'application_status', path: 'app/dashboard/applications/[id]/status/page.tsx', name: 'Trạng thái Đơn ứng tuyển', desc: 'Cập nhật và theo dõi các bước thay đổi trạng thái của đơn ứng tuyển.' },
  { id: 'emails_list', path: 'app/dashboard/emails/page.tsx', name: 'Quản lý Email', desc: 'Danh sách các email đã gửi/nhận trong hệ thống ATS.' },
  { id: 'interviews_list', path: 'app/dashboard/interviews/page.tsx', name: 'Danh sách Phỏng vấn', desc: 'Quản lý lịch phỏng vấn, thời gian, người tham gia.' },
  { id: 'new_interview', path: 'app/dashboard/interviews/new/page.tsx', name: 'Tạo Lịch Phỏng vấn', desc: 'Lên lịch phỏng vấn mới cho một ứng viên.' },
  { id: 'interview_detail', path: 'app/dashboard/interviews/[id]/page.tsx', name: 'Chi tiết Phỏng vấn', desc: 'Thông tin chi tiết về buổi phỏng vấn, link meeting, ghi chú.' },
  { id: 'interview_score', path: 'app/dashboard/interviews/[id]/score/page.tsx', name: 'Đánh giá Phỏng vấn', desc: 'Chấm điểm và nhận xét ứng viên sau buổi phỏng vấn.' },
  { id: 'jobs_list', path: 'app/dashboard/jobs/page.tsx', name: 'Danh sách Công việc', desc: 'Quản lý các tin tuyển dụng, hiển thị trạng thái (Open, Closed).' },
  { id: 'new_job', path: 'app/dashboard/jobs/new/page.tsx', name: 'Tạo Công việc Mới', desc: 'Soạn thảo và đăng tin tuyển dụng mới.' },
  { id: 'job_channels', path: 'app/dashboard/jobs/[id]/channels/page.tsx', name: 'Kênh Đăng tin', desc: 'Quản lý các kênh phân phối tin tuyển dụng (LinkedIn, Facebook...).' },
  { id: 'job_edit', path: 'app/dashboard/jobs/[id]/edit/page.tsx', name: 'Chỉnh sửa Công việc', desc: 'Sửa nội dung, yêu cầu, trạng thái của tin tuyển dụng.' },
  { id: 'docs', path: 'app/docs/page.tsx', name: 'Tài liệu hệ thống', desc: 'Trang tài liệu/hướng dẫn sử dụng hệ thống.' },
  { id: 'public_jobs', path: 'app/jobs/page.tsx', name: 'Danh sách Công việc (Public)', desc: 'Danh sách các công việc đang tuyển dành cho ứng viên tìm kiếm.' },
  { id: 'public_job_detail', path: 'app/jobs/[id]/page.tsx', name: 'Chi tiết Công việc (Public)', desc: 'Thông tin chi tiết của một công việc và nút nộp đơn (Apply).' },
  { id: 'unauthorized', path: 'app/unauthorized/page.tsx', name: 'Không có quyền truy cập', desc: 'Trang thông báo lỗi 403 khi người dùng không đủ quyền.' },
];

const template = (screen) => `# Tài liệu Đặc tả Màn hình: ${screen.name}

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | ${screen.name} |
| **Đường dẫn file** | \`${screen.path}\` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | ${new Date().toLocaleDateString('vi-VN')} |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | ${new Date().toLocaleDateString('vi-VN')} | AI | Tạo tài liệu đặc tả ban đầu |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** ${screen.desc}
- **User Flow:** 
  1. Người dùng truy cập vào màn hình.
  2. Xem dữ liệu hoặc thực hiện thao tác (Thêm/Sửa/Xóa/Điền form).
  3. Hệ thống xử lý, lưu Database và phản hồi kết quả.

### IPO Tổng quan
- **Input:** Các trường dữ liệu người dùng nhập, tham số URL.
- **Process:** Xác thực token (Authentication), kiểm tra quyền (Authorization), validate dữ liệu đầu vào.
- **Output:** Giao diện hiển thị, thay đổi dữ liệu DB, thông báo trả về (Toast).

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
\`[Hình ảnh giao diện ${screen.name}]\`

### Chi tiết điều khiển
| STT | Tên thành phần | Loại | Ràng buộc (Validation) | Trạng thái mặc định |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Tiêu đề chính | Heading | Bắt buộc hiển thị | Theo tên màn hình |
| 2 | Các trường thông tin | Text/Input | Theo yêu cầu nghiệp vụ | Trống |
| 3 | Nút xác nhận | Button | Disabled khi đang tải/lưu | Enable |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Lỗi API/Mạng | "Đã xảy ra lỗi, vui lòng thử lại sau" | Toast (Đỏ) |
| Thành công | "Cập nhật thành công!" | Toast (Xanh) |
| Validate Form | "Trường này không được để trống" | Text đỏ dưới Input |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Mount (Khởi tạo):**
   - Hook React fetch dữ liệu từ API tương ứng.
   - Hiển thị Skeleton/Loader trong lúc tải.
2. **Submit (Xử lý lưu):**
   - Kiểm tra validation ở Frontend.
   - Gửi request đến Backend.
   - Refresh trang/tắt Modal/chuyển hướng khi thành công.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- Mất kết nối internet khi đang thao tác.
- Phiên làm việc (Session) hết hạn.
- Cố tình truy cập trái phép bằng URL.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| TBD | GET/POST | TBD |

### Đặc tả Request / Response
**Request:**
\`\`\`json
{
  "key": "value"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {}
}
\`\`\`
`;

const dir = path.join(__dirname, '../docs/screens');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

screens.forEach(screen => {
  const filePath = path.join(dir, screen.id + '.md');
  fs.writeFileSync(filePath, template(screen), 'utf-8');
});

console.log('Successfully generated markdown files in docs/screens.');
