# Tài liệu Đặc tả Màn hình: Đăng ký Tài khoản (Register)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Đăng ký Tài khoản Ứng viên |
| **Đường dẫn file** | `app/(auth)/register/page.tsx` & `components/auth/register-form.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 06/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 06/05/2026 | AI | Tạo đặc tả Form Đăng ký, sơ đồ bắt lỗi bằng Zod Schema và Error Parsing từ API. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là cửa ngõ (Onboarding) cho phép một khách truy cập thông thường khởi tạo tài khoản trên hệ thống. **Mặc định** mọi tài khoản đăng ký qua kênh này đều mang role là `candidate` (Ứng viên). Không có luồng tạo tài khoản Admin/HR công khai.
- **User Flow:** 
  1. Người dùng bấm "Tạo tài khoản ứng viên" từ trang Landing.
  2. Hiển thị Form đăng ký gồm: Họ tên, Email, SĐT, Mật khẩu.
  3. Hệ thống chặn lỗi Format qua Zod Validation.
  4. Nếu Form trên Client hợp lệ, gửi dữ liệu POST qua API Auth.
  5. API kiểm tra trùng Email. Thành công báo Toast, chuyển hướng dắt người dùng sang màn hình `/login` để tự đăng nhập.

### IPO Tổng quan
- **Input:** Biến `fullName`, `email`, `phone`, `password`.
- **Process:** 
  - Frontend: Sử dụng `react-hook-form` gắn kèm `zodResolver(registerSchema)` từ `@hookform/resolvers/zod` để bảo vệ Input.
  - Hook Mutation: Gửi POST Request xuống Core Auth API.
  - Bắt lỗi đặc biệt `ApiError` trả về `fieldErrors` và nhét trực tiếp lỗi từ server lên các Field đỏ tương ứng bằng hàm `form.setError()`.
- **Output:** Thông báo (Toast) và Router Redirect (`router.push("/login")`).

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Form Đăng ký]`

### Chi tiết điều khiển
**Phần Wrapper Card:**
| STT | Tên thành phần | Loại | Chi tiết |
| :--- | :--- | :--- | :--- |
| 1 | Logo Hệ thống | Image Component | Căn giữa. |
| 2 | Tiêu đề & Subtitle | Text | Nhấn mạnh Role mặc định là Ứng viên. |

**Phần Form Input (`register-form.tsx`):**
| STT | Tên Input | Logic UI Ràng buộc | Attribute |
| :--- | :--- | :--- | :--- |
| 3 | Họ và tên | Bắt buộc (Bắt bằng Zod). | `autoComplete="name"` |
| 4 | Email | Bắt buộc format (Bắt bằng Zod: `@...`). | `type="email"`, `autoComplete="email"` |
| 5 | Số điện thoại | Tuỳ chọn. | `type="tel"`, `autoComplete="tel"` |
| 6 | Mật khẩu | Bắt buộc, che ký tự (Min Length theo Zod). | `type="password"`, `autoComplete="new-password"` |
| 7 | Lỗi Server (Alert) | Ẩn mặc định. Hiện thanh đỏ ở trên cùng khi Backend từ chối. | Variant `destructive`. |
| 8 | Nút Đăng ký | Disabled + Đổi nhãn "Đang tạo..." khi Pending. | Button submit khối Form. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Lỗi Cú pháp Email / Name | Theo Config trong `registerSchema` (Vd: "Email không hợp lệ"). | Field Message (Đỏ, dưới ô input) |
| Email bị trùng lặp | Bắt từ Backend, fill vào Field Email. | Field Message (Đỏ) |
| Lỗi hệ thống nghiêm trọng | "Đăng ký thất bại" (Hoặc Message từ API) | Alert Box (Nằm trên cùng Form) |
| Thành công | "Đăng ký thành công. Vui lòng đăng nhập." | Toast (Xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Lớp rào chắn 1: Zod Schema Validation (Client-Side):**
   - File `lib/validators/auth` quản lý rule (Ví dụ: Password phải trên 8 ký tự, Name không rỗng).
   - Khi bấm Submit, Form không bao giờ bắn API nếu lớp Zod này báo lỗi. UI đỏ các ô tương ứng.
2. **Lớp rào chắn 2: API & Database (Server-Side):**
   - API kiểm tra Email đã nằm trong Database (Prisma) hay chưa.
   - Nếu có lỗi, API ném ra cấu trúc đối tượng `ApiError` chứa trường `fieldErrors` dạng Mảng lồng: `fe.email?.[0]`.
   - Khối lệnh Try/Catch dưới Frontend sẽ bóc lỗi này ra và gài ngược vào Form Hook: `form.setError("email", { message: fe.email[0] })`. Nhờ đó, dù form Zod cho qua, nhưng Backend chê (VD do trùng email) thì ô Textbox vẫn sáng đỏ như bình thường. Đây là cơ chế UX cực kì tốt.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Khối Validation & API liên đới
| File / Hook | Chức năng |
| :--- | :--- |
| `registerSchema` | Object Rule định nghĩa tính hợp lệ của Form. |
| `useRegister()` | Nằm trong `@/hooks/use-auth`. Gói gọn logic gọi Fetch POST tới endpoint xử lý Auth (được viết riêng bằng Session hoặc NextAuth tuỳ cấu hình). |
