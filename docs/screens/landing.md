# Tài liệu Đặc tả Màn hình: Trang Chủ (Landing Page)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Trang Chủ (Landing Page) |
| **Đường dẫn file** | `app/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 06/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 06/05/2026 | AI | Đặc tả luồng dữ liệu Server Component, SSR lấy tin việc làm nổi bật và logic điều hướng theo Session. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là trang giới thiệu công khai đầu tiên (Public Page) khi bất kỳ ai truy cập vào domain của hệ thống. Nó thực hiện hai nhiệm vụ: (1) Quáng bá hệ thống ATS và (2) Liệt kê nhanh các công việc nổi bật để thu hút ứng viên nộp CV.
- **User Flow:** 
  1. Người dùng truy cập URL `/`.
  2. Giao diện hiển thị cụm Banner (Hero Section) chứa các Call-to-Action (Đăng nhập, Tạo tài khoản).
  3. Cuộn xuống dưới là danh sách dạng lưới (Grid) hiển thị tối đa 6 tin tuyển dụng mới nhất/nổi bật nhất đang mở.
  4. Người dùng bấm "Xem việc làm" hoặc bấm vào 1 thẻ tin để chuyển sang luồng Public Jobs.

### IPO Tổng quan
- **Input:** Token/Cookie của trình duyệt.
- **Process:** 
  - Tại Server, gọi hàm `getSession()` để lấy trạng thái đăng nhập.
  - Gọi hàm `getFeaturedJobs(6)` truy vấn DB lấy 6 việc làm có trạng thái `active`.
- **Output:** HTML tĩnh được Render từ Server (RSC) chuyển xuống trình duyệt, giúp SEO tốt và load siêu nhanh.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Trang Chủ Landing Page]`

### Chi tiết điều khiển
**Phần Header & Hero Section:**
| STT | Tên thành phần | Loại | Điều kiện thay đổi trạng thái hiển thị |
| :--- | :--- | :--- | :--- |
| 1 | Nút "Xem việc làm" | Link Button | Luôn hiển thị, dẫn tới `/jobs`. |
| 2 | Nút Hành động thứ 2 | Link Button | Nếu **chưa** đăng nhập: Hiển thị "Tạo tài khoản ứng viên" -> `/register`.<br/>Nếu **đã** đăng nhập: Hiển thị "Vào không gian của tôi" -> Tùy Role sẽ đẩy vào `/candidate` (nếu là ứng viên) hoặc `/dashboard` (nếu là HR/Admin). |

**Phần Danh sách Tin Tuyển Dụng (Featured Jobs):**
| STT | Tên thành phần | Chức năng |
| :--- | :--- | :--- |
| 3 | Nút "Xem tất cả" | Dẫn sang `/jobs`. |
| 4 | Component `JobCardPreview` | Thẻ Card nhỏ hiển thị Tiêu đề, Phòng ban, Lương... lấy từ prop của `featuredJobs`. |
| 5 | Fallback Rỗng | Nếu DB không có tin `active` nào, hiện Text Box nét đứt: "Chưa có tin tuyển dụng đang hoạt động..." |

**Phần Footer:**
| STT | Tên thành phần | Chức năng |
| :--- | :--- | :--- |
| 6 | Menu cuối trang | Có Link Đăng nhập (chỉ hiện khi chưa đăng nhập) và Danh sách việc làm. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Empty State | "Chưa có tin tuyển dụng đang hoạt động. HR có thể thêm tin trong dashboard sau khi module được bật." | Block UI |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Server-Side Rendering (SSR):**
   - File `app/page.tsx` là Server Component nguyên bản, không sử dụng `"use client"`. Mọi xử lý đều chạy ở Back-end trước khi gửi HTML về Client. Điều này giúp Google Bot cào (crawl) được nội dung tin tuyển dụng rất tốt.
2. **Logic Điều hướng Thông minh (Smart Navigation):**
   - Trong Hero block, hệ thống quét biến `session.user.role`. Nếu phát hiện người dùng đã đăng nhập với Role là `candidate`, Link điều hướng sẽ lập tức đổi thành `/candidate` để giữ ứng viên ở đúng vùng an toàn của họ. Trái lại, các Role khác (`admin`, `hr`, `interviewer`) sẽ bị đẩy thẳng vào màn hình Admin quản lý `/dashboard`.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Tối ưu SEO:** Đã gán cục `export const metadata` cố định ở đầu file với `title` và `description` riêng biệt, chuẩn hóa thẻ `<title>` cho trình duyệt.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan Logic (Server Component)
| Function | File liên kết | Chức năng |
| :--- | :--- | :--- |
| `getSession()` | `@/lib/auth/session` | Hàm kiểm tra tính hợp lệ của Cookie và Token hiện hành. Trả về JWT payload. |
| `getFeaturedJobs(limit)` | `@/lib/data/jobs` | Truy vấn Prisma ORM, lôi từ bảng Jobs ra `limit` bài đăng thỏa mãn `status="active"`. |

*(Không có lời gọi mạng Fetch API truyền thống do chạy trực tiếp trên Server Node.js của Next.js)*
