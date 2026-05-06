# Tài liệu Đặc tả Màn hình: Đăng nhập

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Màn hình Đăng nhập |
| **Đường dẫn file** | `app/(auth)/login/page.tsx` và `components/auth/login-form.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Tạo tài liệu đặc tả ban đầu |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Màn hình cho phép người dùng (Ứng viên, Nhà tuyển dụng, Quản trị viên) điền thông tin đăng nhập để truy cập vào hệ thống ATS.
- **User Flow:**
  1. Người dùng truy cập `/login`.
  2. Nhập Email và Mật khẩu.
  3. Bấm "Đăng nhập".
  4. Hệ thống kiểm tra thông tin. Nếu đúng, tự động phân quyền (Role) và chuyển hướng (Redirect) về Dashboard tương ứng (hoặc trang callbackUrl trước đó).

### IPO Tổng quan
- **Input:** Email, Mật khẩu.
- **Process:**
  - Kiểm tra tính hợp lệ của định dạng Email và Mật khẩu tại Frontend (Zod validation).
  - Gọi API xác thực (Authentication).
- **Output:** 
  - Thành công: Hiển thị Toast thông báo và chuyển hướng sang Dashboard (`/dashboard` cho Admin/Employer, `/candidate` cho Candidate).
  - Thất bại: Hiển thị cảnh báo lỗi (Alert đỏ) trên form.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh thiết kế Form Đăng nhập]`

### Chi tiết điều khiển
| STT | Tên thành phần | Loại | Ràng buộc (Validation) | Trạng thái mặc định | Disable/Enable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Logo hệ thống | Image/Icon | Không | Hiển thị giữa | - |
| 2 | Ô nhập Email | Textbox | Bắt buộc. Định dạng email hợp lệ. | Trống | Cho phép nhập |
| 3 | Ô nhập Mật khẩu | Textbox (Password) | Bắt buộc. Ít nhất 8 ký tự. | Trống | Cho phép nhập |
| 4 | Nút Đăng nhập | Button | Không | Enable | Disable (mờ đi) khi đang gọi API `loginMutation.isPending` |
| 5 | Link "Đăng ký" | Link text | Không | Điều hướng sang `/register` | - |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Email sai định dạng | "Email không hợp lệ" | Text đỏ dưới ô Email |
| Mật khẩu quá ngắn | "Mật khẩu tối thiểu 8 ký tự" | Text đỏ dưới ô Mật khẩu |
| Sai tài khoản/mật khẩu | Tùy API trả về (VD: "Đăng nhập thất bại") | Alert đỏ (Pop-up inline trên form) |
| Lỗi Server | "Đăng nhập thất bại" (Lỗi fallback) | Alert đỏ trên form |
| Đăng nhập thành công | "Đăng nhập thành công" | Toast message (màu xanh) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Mount (Khởi tạo form):**
   - Khởi tạo form bằng `react-hook-form` tích hợp với schema `zodResolver(loginSchema)`.
   - Đọc tham số `callbackUrl` từ URL.
2. **Khi bấm nút "Đăng nhập" (Submit Form):**
   - **Bước 1:** Frontend (Zod) chặn nếu email/mật khẩu sai định dạng.
   - **Bước 2:** Gọi `useLogin` mutation (gửi POST đến API login). Nút đăng nhập chuyển sang trạng thái "Đang đăng nhập…".
   - **Bước 3 (Thất bại):** API trả về lỗi `ApiError`. Catch lỗi và set vào `serverError` để hiển thị Alert đỏ.
   - **Bước 4 (Thành công):** 
     - Hiển thị Toast "Đăng nhập thành công".
     - Kiểm tra nếu có `callbackUrl` (và path an toàn `isSafeRelativePath`), gọi `router.push(callbackUrl)`.
     - Nếu không có callback, check `role`: Nếu `success`, dùng `getPostLoginPath(role)` để chuyển sang Dashboard. Ngược lại chuyển sang `/candidate`.
     - Cuối cùng gọi `router.refresh()`.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **Callback URL Attack:** Hệ thống chỉ chấp nhận `callbackUrl` là đường dẫn tương đối (bắt đầu bằng `/` và không phải `//`) thông qua hàm `isSafeRelativePath` để tránh tấn công Open Redirect.
- **Mất mạng khi submit:** `react-query` mutation sẽ ném lỗi network, form sẽ hiển thị "Đăng nhập thất bại".
- **Double click:** Nút "Đăng nhập" sẽ bị disable tự động trong lúc `loginMutation.isPending` để tránh người dùng click nhiều lần gây lỗi tạo phiên song song.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `[API Login]` | `POST` | Xác thực người dùng, trả về thông tin user và cookie session. (Được gọi qua hook `useLogin`). |

### Đặc tả Request / Response
**Request Payload (JSON):**
```json
{
  "email": "user@congty.com",
  "password": "mySecurePassword123"
}
```

**Response (Thành công):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@congty.com",
      "role": "candidate",
      "fullName": "Nguyen Van A"
    }
  }
}
```

### Truy vấn Database (Backend logic)
- Truy vấn bảng `Users` theo `email`.
- Compare hash password.
- Khởi tạo `Session` và đính kèm token/session id vào Response Cookies.
