# TEST CASE DOCUMENT
# Module B - Xác thực (Authentication)

| Thông tin | Nội dung |
|-----------|----------|
| **Module** | B - Authentication (`/login`, `/register`, `/forgot-password`, `/verify-email`) |
| **Ngày tạo** | 2026-05-17 |
| **Người tạo** | AI Agent |
| **Phiên bản** | 1.0 |

---

| No. | Item test | Điều kiện test | Kết quả mong đợi/cách xác nhận | Kết quả test - 1st | Kết quả test - 2nd | Kết quả test - 3rd | Note |
|-----|-----------|----------------|-------------------------------|-------------------|-------------------|-------------------|------|
| 1 | Khởi tạo trang Login<br>・Layout tổng thể | ・Truy cập `/login` khi chưa đăng nhập | Trang hiển thị đầy đủ:<br>・Form đăng nhập với 2 field: Email, Password<br>・Nút "Đăng nhập"<br>・Link "Quên mật khẩu"<br>・Link "Đăng ký" | | | | |
| 2 | Khởi tạo trang Login<br>・Giá trị mặc định | ・Truy cập `/login` lần đầu | Tất cả field trống:<br>・Email = ""<br>・Password = ""<br>・Không có thông báo lỗi nào | | | | |
| 3 | Khởi tạo trang Login<br>・Redirect nếu đã đăng nhập (candidate) | ・Đã đăng nhập với role candidate<br>・Truy cập `/login` | Tự động redirect đến `/candidate`<br>・Không hiển thị form login | | | | |
| 4 | Khởi tạo trang Login<br>・Redirect nếu đã đăng nhập (admin) | ・Đã đăng nhập với role admin<br>・Truy cập `/login` | Tự động redirect đến `/dashboard`<br>・Không hiển thị form login | | | | |
| 5 | Khởi tạo trang Login<br>・Redirect nếu đã đăng nhập (hr/interviewer) | ・Đã đăng nhập với role hr hoặc interviewer<br>・Truy cập `/login` | Tự động redirect đến `/dashboard` | | | | |
| 6 | Login - Validation Email<br>・Email bắt buộc | ・Để trống field Email<br>・Nhập password hợp lệ<br>・Click Đăng nhập | Hiển thị lỗi: "Email là bắt buộc"<br>・Không gọi API<br>・Focus vào field Email | | | | |
| 7 | Login - Validation Email<br>・Email sai format | ・Nhập email "khongphaimail"<br>・Nhập password hợp lệ<br>・Click Đăng nhập | Hiển thị lỗi: "Email không đúng định dạng"<br>・Không gọi API | | | | |
| 8 | Login - Validation Email<br>・Email sai format (thiếu domain) | ・Nhập email "user@"<br>・Click Đăng nhập | Hiển thị lỗi format email<br>・Không gọi API | | | | |
| 9 | Login - Validation Password<br>・Password bắt buộc | ・Nhập email hợp lệ<br>・Để trống field Password<br>・Click Đăng nhập | Hiển thị lỗi: "Mật khẩu là bắt buộc"<br>・Không gọi API | | | | |
| 10 | Login - Nút Đăng nhập<br>・Sai email/password | ・Nhập email tồn tại trong DB<br>・Nhập password sai<br>・Click Đăng nhập | API POST /api/auth/login trả 401<br>・Toast/message lỗi: "Email hoặc mật khẩu không đúng"<br>・Không set cookie<br>・Không redirect | | | | |
| 11 | Login - Nút Đăng nhập<br>・Email không tồn tại | ・Nhập email không có trong DB<br>・Nhập password bất kỳ<br>・Click Đăng nhập | API trả 401<br>・Message: "Email hoặc mật khẩu không đúng"<br>・Không lộ thông tin "email không tồn tại" (security) | | | | |
| 12 | Login - Nút Đăng nhập<br>・Dữ liệu hợp lệ (role candidate) | ・Email/password đúng, user role=candidate<br>・Click Đăng nhập | API trả 200<br>・Cookie `session` được set (httpOnly)<br>・Redirect đến `/candidate`<br>・Toast: "Đăng nhập thành công" | | | | |
| 13 | Login - Nút Đăng nhập<br>・Dữ liệu hợp lệ (role admin) | ・Email/password đúng, user role=admin<br>・Click Đăng nhập | API trả 200<br>・Cookie `session` được set<br>・Redirect đến `/dashboard` | | | | |
| 14 | Login - Nút Đăng nhập<br>・Dữ liệu hợp lệ (role hr) | ・Email/password đúng, user role=hr | Redirect đến `/dashboard` | | | | |
| 15 | Login - Nút Đăng nhập<br>・Dữ liệu hợp lệ (role interviewer) | ・Email/password đúng, user role=interviewer | Redirect đến `/dashboard` | | | | |
| 16 | Login - Loading state<br>・Disable button khi đang xử lý | ・Nhập thông tin hợp lệ<br>・Click Đăng nhập | Nút Đăng nhập bị disabled trong lúc loading<br>・Hiển thị spinner/loading indicator<br>・Không thể click nhiều lần (chống double submit) | | | | |
| 17 | Login - API lỗi<br>・API 500 Server error | ・Mock API /api/auth/login trả 500 | Toast lỗi: "Có lỗi xảy ra, vui lòng thử lại"<br>・Nút Đăng nhập trở về enabled<br>・Không redirect | | | | Cần mock API |
| 18 | Login - API lỗi<br>・Network error | ・Tắt mạng<br>・Click Đăng nhập | Toast lỗi: "Không thể kết nối đến máy chủ"<br>・Form không bị reset | | | | |
| 19 | Login - Password field<br>・Hiển thị/ẩn password | ・Nhập password vào field<br>・Click icon show/hide | Password chuyển giữa dạng ẩn (●●●) và hiện (*text*)<br>・Hoạt động đúng khi toggle nhiều lần | | | | Cần confirm UI có toggle không |
| 20 | Login - Navigation<br>・Link Quên mật khẩu | ・Trên trang Login<br>・Click "Quên mật khẩu?" | Redirect đến `/forgot-password` | | | | |
| 21 | Login - Navigation<br>・Link Đăng ký | ・Trên trang Login<br>・Click "Đăng ký" | Redirect đến `/register` | | | | |
| 22 | Khởi tạo trang Register<br>・Layout tổng thể | ・Truy cập `/register` khi chưa đăng nhập | Trang hiển thị đầy đủ:<br>・Fields: Email, Password, fullName, Phone (tùy chọn)<br>・Nút "Đăng ký"<br>・Link "Đã có tài khoản? Đăng nhập" | | | | |
| 23 | Khởi tạo trang Register<br>・Redirect nếu đã đăng nhập | ・Đã đăng nhập với bất kỳ role<br>・Truy cập `/register` | Tự động redirect đến trang tương ứng của role<br>・Không hiển thị form đăng ký | | | | |
| 24 | Register - Validation Email<br>・Email bắt buộc | ・Để trống Email<br>・Các field khác hợp lệ<br>・Click Đăng ký | Lỗi: "Email là bắt buộc"<br>・Không gọi API | | | | |
| 25 | Register - Validation Email<br>・Email sai format | ・Nhập "khonghoplemailnay"<br>・Click Đăng ký | Lỗi: "Email không đúng định dạng" | | | | |
| 26 | Register - Validation Email<br>・Email đã tồn tại trong DB | ・Nhập email đã có tài khoản<br>・Các field khác hợp lệ<br>・Click Đăng ký | API trả lỗi 409 hoặc 400<br>・Message: "Email đã được sử dụng"<br>・Không tạo tài khoản mới | | | | |
| 27 | Register - Validation Password<br>・Password bắt buộc | ・Để trống Password | Lỗi: "Mật khẩu là bắt buộc" | | | | |
| 28 | Register - Validation Password<br>・Password dưới 8 ký tự | ・Nhập password "abc123" (6 ký tự) | Lỗi: "Mật khẩu phải có ít nhất 8 ký tự" | | | | |
| 29 | Register - Validation Password<br>・Password đúng 8 ký tự (biên dưới) | ・Nhập password "abcd1234" (8 ký tự) | Password được chấp nhận<br>・Không có lỗi | | | | |
| 30 | Register - Validation Password<br>・Password thiếu số | ・Nhập password "abcdefgh" (toàn chữ) | Lỗi: "Mật khẩu phải chứa ít nhất 1 số và 1 chữ cái" | | | | |
| 31 | Register - Validation Password<br>・Password thiếu chữ | ・Nhập password "12345678" (toàn số) | Lỗi: "Mật khẩu phải chứa ít nhất 1 số và 1 chữ cái" | | | | |
| 32 | Register - Validation fullName<br>・fullName bắt buộc | ・Để trống trường Họ tên | Lỗi: "Họ tên là bắt buộc" | | | | |
| 33 | Register - Validation fullName<br>・fullName vượt 255 ký tự | ・Nhập fullName 256 ký tự | Lỗi: "Họ tên không được vượt quá 255 ký tự"<br>・Hoặc field tự giới hạn maxlength | | | | |
| 34 | Register - Validation Phone<br>・Phone tùy chọn (để trống) | ・Để trống trường Phone<br>・Các field khác hợp lệ<br>・Click Đăng ký | Đăng ký thành công<br>・phone = null trong DB<br>・Không có lỗi validation | | | | |
| 35 | Register - Validation Phone<br>・Phone sai format | ・Nhập phone "abc12345"<br>・Click Đăng ký | Lỗi: "Số điện thoại không đúng định dạng"<br>・Format VN: 10 chữ số, bắt đầu 0 | | | | |
| 36 | Register - Validation Phone<br>・Phone VN hợp lệ | ・Nhập "0912345678"<br>・Click Đăng ký | Phone được chấp nhận<br>・Không có lỗi | | | | |
| 37 | Register - Submit<br>・Đăng ký thành công | ・Email mới, password ≥8 ký tự (chữ+số), fullName hợp lệ<br>・Click Đăng ký | API POST /api/auth/register trả 200/201<br>・OTP verification email được gửi<br>・Redirect đến `/verify-email`<br>・Toast: "Vui lòng kiểm tra email để xác minh tài khoản" | | | | |
| 38 | Register - API lỗi<br>・Server error 500 | ・Mock API /api/auth/register trả 500 | Toast lỗi: "Có lỗi xảy ra, vui lòng thử lại"<br>・Không tạo tài khoản | | | | Cần mock API |
| 39 | Verify Email - Khởi tạo<br>・Layout | ・Redirect đến `/verify-email` sau đăng ký | Trang hiển thị:<br>・Thông báo hướng dẫn nhập OTP<br>・Field nhập OTP (6 chữ số)<br>・Nút "Xác minh"<br>・Link "Gửi lại OTP" | | | | |
| 40 | Verify Email - Validation OTP<br>・OTP bắt buộc | ・Để trống field OTP<br>・Click Xác minh | Lỗi: "Vui lòng nhập mã OTP"<br>・Không gọi API | | | | |
| 41 | Verify Email - Validation OTP<br>・OTP không đủ 6 chữ số | ・Nhập "1234" (4 số)<br>・Click Xác minh | Lỗi: "Mã OTP phải có 6 chữ số"<br>・Không gọi API | | | | |
| 42 | Verify Email - Validation OTP<br>・OTP chứa ký tự không phải số | ・Nhập "12345a"<br>・Click Xác minh | Lỗi: "Mã OTP chỉ được chứa chữ số" hoặc field không cho nhập chữ | | | | |
| 43 | Verify Email - Submit OTP<br>・OTP đúng | ・Nhập OTP 6 số đúng từ email<br>・Click Xác minh | API POST /api/auth/otp/verify-email trả 200<br>・Email được xác minh<br>・Redirect đến `/login` hoặc `/candidate`<br>・Toast: "Xác minh email thành công" | | | | |
| 44 | Verify Email - Submit OTP<br>・OTP sai | ・Nhập OTP sai<br>・Click Xác minh | API trả lỗi<br>・Message: "Mã OTP không đúng"<br>・Không redirect | | | | |
| 45 | Verify Email - Submit OTP<br>・OTP hết hạn (>10 phút) | ・Chờ hơn 10 phút<br>・Nhập OTP cũ | API trả lỗi<br>・Message: "Mã OTP đã hết hạn, vui lòng gửi lại"<br>・Hiển thị link/nút "Gửi lại OTP" | | | | |
| 46 | Verify Email - Gửi lại OTP<br>・Click Gửi lại | ・Đang ở trang `/verify-email`<br>・Click "Gửi lại OTP" | API POST /api/auth/otp/send được gọi<br>・OTP mới được gửi đến email<br>・Toast: "OTP đã được gửi lại"<br>・Cooldown: disable nút trong X giây | | | | Cần confirm thời gian cooldown |
| 47 | Forgot Password - Khởi tạo<br>・Layout | ・Truy cập `/forgot-password` | Trang hiển thị:<br>・Field nhập Email<br>・Nút "Gửi OTP"<br>・Link quay lại Login | | | | |
| 48 | Forgot Password - Step 1<br>・Email bắt buộc | ・Để trống Email<br>・Click Gửi OTP | Lỗi: "Email là bắt buộc" | | | | |
| 49 | Forgot Password - Step 1<br>・Email không tồn tại trong DB | ・Nhập email không có tài khoản<br>・Click Gửi OTP | Hiển thị message trung lập:<br>・"Nếu email tồn tại, bạn sẽ nhận được mã OTP"<br>・Không lộ thông tin "email không tồn tại" (security) | | | | |
| 50 | Forgot Password - Step 1<br>・Email hợp lệ | ・Nhập email tồn tại trong DB<br>・Click Gửi OTP | API POST /api/auth/otp/send được gọi<br>・Chuyển sang Step 2: nhập OTP<br>・Toast: "Mã OTP đã được gửi đến email" | | | | |
| 51 | Forgot Password - Step 2<br>・Nhập OTP đúng | ・Nhập OTP 6 số đúng từ email<br>・Click Xác nhận | Chuyển sang Step 3: nhập mật khẩu mới<br>・OTP hợp lệ được xác nhận | | | | |
| 52 | Forgot Password - Step 2<br>・OTP hết hạn | ・Chờ >10 phút<br>・Nhập OTP cũ | Message: "Mã OTP đã hết hạn"<br>・Có tùy chọn Gửi lại OTP | | | | |
| 53 | Forgot Password - Step 3<br>・Password mới bắt buộc | ・Để trống Password mới<br>・Click Đặt mật khẩu | Lỗi: "Mật khẩu mới là bắt buộc" | | | | |
| 54 | Forgot Password - Step 3<br>・Password mới < 8 ký tự | ・Nhập "abc123"<br>・Click Đặt mật khẩu | Lỗi: "Mật khẩu phải có ít nhất 8 ký tự" | | | | |
| 55 | Forgot Password - Step 3<br>・Xác nhận password không khớp | ・Password mới: "abcd1234"<br>・Xác nhận: "abcd1235"<br>・Click Đặt mật khẩu | Lỗi: "Mật khẩu xác nhận không khớp" | | | | Cần confirm UI có field confirm password không |
| 56 | Forgot Password - Step 3<br>・Đặt mật khẩu thành công | ・OTP đã xác nhận<br>・Password mới hợp lệ (≥8 ký tự, có số+chữ)<br>・Click Đặt mật khẩu | API POST /api/auth/password trả 200<br>・Mật khẩu được cập nhật trong DB<br>・Redirect đến `/login`<br>・Toast: "Đặt mật khẩu thành công, vui lòng đăng nhập" | | | | |
| 57 | Forgot Password - API lỗi<br>・Send OTP - 500 | ・Mock API /api/auth/otp/send trả 500 | Toast lỗi: "Có lỗi xảy ra, vui lòng thử lại" | | | | Cần mock API |
| 58 | Logout<br>・Click Logout | ・Đã đăng nhập<br>・Click nút Logout trong dropdown | API POST /api/auth/logout được gọi<br>・Cookie `session` bị xóa<br>・Redirect đến `/login` hoặc `/`<br>・Không thể truy cập /candidate hoặc /dashboard nữa | | | | |
| 59 | Logout<br>・Cookie bị xóa sau logout | ・Sau khi logout<br>・Kiểm tra browser DevTools > Application > Cookies | Cookie `session` không còn tồn tại | | | | |
| 60 | JWT Cookie<br>・Cookie attributes | ・Đăng nhập thành công<br>・Kiểm tra cookie trong DevTools | Cookie session có attributes:<br>・HttpOnly = true<br>・SameSite = Lax<br>・Secure = true (production)<br>・Có thời hạn MAX_AGE | | | | Chỉ verify trên production |
| 61 | API me<br>・GET /api/auth/me với cookie hợp lệ | ・Đăng nhập thành công<br>・Gọi GET /api/auth/me | Response 200:<br>・`{ success: true, data: { user: { id, email, fullName, role } } }`<br>・Không trả về password | | | | |
| 62 | API me<br>・GET /api/auth/me không có cookie | ・Chưa đăng nhập<br>・Gọi GET /api/auth/me | Response 401:<br>・`{ success: false, error: "Unauthorized" }` | | | | |
| 63 | API me<br>・GET /api/auth/me cookie hết hạn | ・Cookie session hết hạn<br>・Gọi GET /api/auth/me | Response 401<br>・Ứng dụng tự động redirect về `/login` | | | | |
| 64 | Phân quyền - Protected routes<br>・Truy cập /candidate khi chưa đăng nhập | ・Chưa đăng nhập<br>・Truy cập trực tiếp URL `/candidate` | Redirect đến `/login`<br>・Không hiển thị nội dung trang candidate | | | | |
| 65 | Phân quyền - Protected routes<br>・Truy cập /dashboard khi chưa đăng nhập | ・Chưa đăng nhập<br>・Truy cập trực tiếp `/dashboard` | Redirect đến `/login` | | | | |
| 66 | Phân quyền - Protected routes<br>・Candidate vào /dashboard | ・Đăng nhập role candidate<br>・Truy cập trực tiếp `/dashboard` | Redirect đến `/candidate` hoặc `/unauthorized`<br>・Không hiển thị dashboard admin/hr | | | | |
| 67 | Phân quyền - Protected routes<br>・Admin/HR vào /candidate | ・Đăng nhập role admin<br>・Truy cập trực tiếp `/candidate` | Redirect đến `/dashboard` hoặc `/unauthorized` | | | | |
