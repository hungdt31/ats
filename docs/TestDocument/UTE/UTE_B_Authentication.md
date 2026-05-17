# UTE - Unit Test Evidence
# Module B - Xác thực (Authentication)

| Thông tin | Nội dung |
|-----------|----------|
| **Tên hệ thống** | ATS - Applicant Tracking System |
| **ID chức năng** | B-01 đến B-05 |
| **Tên chức năng** | Authentication |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Người test lần 1** | |
| **Người test lần 2** | |
| **Người test lần 3** | |
| **Tổng số item test** | 65 |
| **Tổng số bug** | |

> **Quy ước kết quả:** ○: OK | ×: NG chưa giải quyết | ×→○: NG đã giải quyết | －: Không test

---

## B-01 · Đăng nhập (`/login`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 1 | Khởi tạo trang – guest chưa đăng nhập | Xóa cookie, truy cập `/(auth)/login` | Trang hiển thị form đăng nhập (email + password), HTTP 200 | | | | |
| 2 | Khởi tạo – đã đăng nhập (candidate) | Đã có cookie `session_token` role=candidate, truy cập `/login` | Redirect tự động về `/candidate` | | | | |
| 3 | Khởi tạo – đã đăng nhập (admin/hr) | Đã có cookie role=admin, truy cập `/login` | Redirect tự động về `/dashboard` | | | | |
| 4 | Layout – Form đăng nhập | Truy cập `/login` | Hiển thị: field Email, field Password (ẩn ký tự), nút "Đăng nhập", link "Quên mật khẩu", link "Đăng ký" | | | | |
| 5 | Validate – Email bỏ trống | Click submit khi email trống | Hiển thị lỗi "Email là bắt buộc" dưới field | | | | |
| 6 | Validate – Email sai format | Nhập `notanemail`, submit | Hiển thị lỗi "Email không hợp lệ" | | | | |
| 7 | Validate – Password bỏ trống | Nhập email hợp lệ, để trống password, submit | Hiển thị lỗi "Mật khẩu là bắt buộc" | | | | |
| 8 | Validate – Password dưới 8 ký tự | Nhập password `1234567` (7 ký tự), submit | Hiển thị lỗi "Mật khẩu phải có ít nhất 8 ký tự" | | | | |
| 9 | Đăng nhập thành công – candidate | Email/password đúng của tài khoản role=candidate | API trả 200, set cookie `session_token`, redirect `/candidate` | | | | |
| 10 | Đăng nhập thành công – admin | Email/password đúng của tài khoản role=admin | API trả 200, set cookie `session_token`, redirect `/dashboard` | | | | |
| 11 | Đăng nhập thành công – hr | Email/password đúng của tài khoản role=hr | API trả 200, set cookie `session_token`, redirect `/dashboard` | | | | |
| 12 | Đăng nhập thất bại – sai password | Email đúng nhưng password sai | API trả 401, toast "Email hoặc mật khẩu không đúng" | | | | |
| 13 | Đăng nhập thất bại – email không tồn tại | Nhập email không có trong DB | API trả 401, toast "Email hoặc mật khẩu không đúng" (không tiết lộ email có tồn tại hay không) | | | | |
| 14 | Đăng nhập – tài khoản chưa xác minh email | Tài khoản có `emailVerified = false` | API trả 403, toast "Vui lòng xác minh email trước khi đăng nhập" | | | | |
| 15 | Đăng nhập – tài khoản bị vô hiệu hóa | Tài khoản có `isActive = false` | API trả 403, toast "Tài khoản đã bị vô hiệu hóa" | | | | |
| 16 | Toggle show/hide password | Click icon mắt trong field password | Password hiển thị dạng text, click lại để ẩn | | | | |
| 17 | Link "Quên mật khẩu" | Click link "Quên mật khẩu" | Chuyển hướng đến `/(auth)/forgot-password` | | | | |
| 18 | Link "Đăng ký" | Click link "Đăng ký" | Chuyển hướng đến `/(auth)/register` | | | | |
| 19 | API – lỗi 500 server | Giả lập DB lỗi khi submit | Toast "Đã có lỗi xảy ra, vui lòng thử lại sau" | | | | |
| 20 | Cookie – httpOnly | Đăng nhập thành công, kiểm tra browser DevTools | Cookie `session_token` có flag `httpOnly`, `Secure` (trên HTTPS), `SameSite` | | | | |

---

## B-02 · Đăng ký (`/register`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 21 | Khởi tạo trang | Guest truy cập `/(auth)/register` | Trang load HTTP 200, form đăng ký hiển thị | | | | |
| 22 | Layout – Form đăng ký | Truy cập `/register` | Hiển thị: field Họ tên, Email, Mật khẩu, Số điện thoại (optional), nút "Đăng ký", link "Đăng nhập" | | | | |
| 23 | Validate – Họ tên bỏ trống | Submit form bỏ trống fullName | Lỗi "Họ và tên là bắt buộc" | | | | |
| 24 | Validate – Họ tên ít hơn 2 ký tự | Nhập fullName = `"A"` (1 ký tự) | Lỗi "Họ và tên phải có ít nhất 2 ký tự" | | | | |
| 25 | Validate – Họ tên đúng tối thiểu 2 ký tự | Nhập fullName = `"Lê"` (2 ký tự) | Không có lỗi validation | | | | |
| 26 | Validate – Email bỏ trống | Submit form bỏ trống email | Lỗi "Email là bắt buộc" | | | | |
| 27 | Validate – Email sai format | Nhập `user@`, submit | Lỗi "Email không hợp lệ" | | | | |
| 28 | Validate – Password dưới 8 ký tự | Nhập password `pass123` (7 ký tự) | Lỗi "Mật khẩu phải có ít nhất 8 ký tự" | | | | |
| 29 | Validate – Password đúng 8 ký tự | Nhập password `pass1234` (8 ký tự) | Không có lỗi về password | | | | |
| 30 | Validate – Phone vượt 20 ký tự | Nhập phone = 21 ký tự số | Lỗi "Số điện thoại không được vượt quá 20 ký tự" | | | | |
| 31 | Validate – Phone bỏ trống (optional) | Để trống field phone, điền đủ các field khác, submit | Không có lỗi, đăng ký thành công | | | | |
| 32 | Đăng ký thành công | Điền đầy đủ thông tin hợp lệ, submit | API POST `/api/auth/register` trả 201, redirect đến `/verify-email?email=...`, toast "Vui lòng kiểm tra email để xác minh tài khoản" | | | | |
| 33 | Đăng ký – email trùng | Đăng ký với email đã tồn tại trong DB | API trả 409, toast "Email này đã được sử dụng" | | | | |
| 34 | Đăng ký – role được gán tự động | Đăng ký thành công, kiểm tra DB | Bản ghi user trong DB có `role = candidate` | | | | |
| 35 | Đăng ký – emailVerified ban đầu | Sau đăng ký, kiểm tra DB | Bản ghi user có `emailVerified = false` | | | | |
| 36 | Link "Đã có tài khoản? Đăng nhập" | Click link | Chuyển hướng về `/login` | | | | |

---

## B-03 · Xác thực Email OTP (`/verify-email`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 37 | Khởi tạo trang | Sau đăng ký, truy cập `/verify-email?email=user@test.com` | Trang load, hiển thị thông báo "Nhập mã OTP đã gửi đến email", field nhập 6 chữ số | | | | |
| 38 | Layout – Form OTP | Truy cập `/verify-email` | Hiển thị: field OTP (6 ký tự), nút "Xác minh", nút/link "Gửi lại mã" | | | | |
| 39 | Validate – OTP bỏ trống | Submit form khi OTP trống | Lỗi "Vui lòng nhập mã OTP" | | | | |
| 40 | Validate – OTP ít hơn 6 ký tự | Nhập `12345` (5 ký tự), submit | Lỗi "Mã OTP phải có đúng 6 ký tự" | | | | |
| 41 | Validate – OTP nhiều hơn 6 ký tự | Nhập `1234567` (7 ký tự) | Field giới hạn không nhận quá 6 ký tự HOẶC hiện lỗi | | | | |
| 42 | Xác minh OTP thành công | Nhập đúng OTP 6 số đã nhận qua email | API POST `/api/auth/otp/verify-email` trả 200, `emailVerified` cập nhật `true`, redirect `/login` kèm toast "Xác minh email thành công" | | | | |
| 43 | OTP sai | Nhập OTP không đúng | API trả 400, toast "Mã OTP không hợp lệ" | | | | |
| 44 | OTP hết hạn | Nhập OTP đúng nhưng đã quá thời hạn `expiresAt` | API trả 400, toast "Mã OTP đã hết hạn, vui lòng gửi lại" | | | | |
| 45 | OTP đã sử dụng | Nhập lại OTP đã dùng thành công lần trước | API trả 400, toast "Mã OTP đã được sử dụng" | | | | |
| 46 | Gửi lại OTP | Click "Gửi lại mã" | Gọi POST `/api/auth/otp/send`, tạo OTP mới, email gửi lại, toast "Đã gửi lại mã OTP" | | | | |
| 47 | Giới hạn attempts OTP | Nhập sai OTP nhiều lần (vượt ngưỡng) | Tài khoản bị khóa OTP tạm thời, thông báo phù hợp | | | | |

---

## B-04 · Quên mật khẩu (`/forgot-password`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 48 | Khởi tạo trang | Truy cập `/(auth)/forgot-password` | Trang load HTTP 200, hiển thị form nhập email | | | | |
| 49 | Layout – Form | Truy cập `/forgot-password` | Hiển thị: field Email, nút "Gửi mã OTP", link quay lại đăng nhập | | | | |
| 50 | Validate – Email bỏ trống | Submit form bỏ trống email | Lỗi "Email là bắt buộc" | | | | |
| 51 | Validate – Email sai format | Nhập `notvalid@@`, submit | Lỗi "Email không hợp lệ" | | | | |
| 52 | Gửi OTP thành công | Nhập email tồn tại trong DB, submit | Gọi POST `/api/auth/otp/send` với `type=password_reset`, trả 200, redirect `/reset-password?email=...`, toast "Mã OTP đã được gửi đến email" | | | | |
| 53 | Gửi OTP – email không tồn tại | Nhập email không có trong DB | Để bảo mật: API trả 200 nhưng không gửi email, hoặc trả 404 tùy thiết kế; thông báo chung "Nếu email tồn tại, mã sẽ được gửi" | | | | |
| 54 | Link quay lại đăng nhập | Click link | Chuyển hướng về `/login` | | | | |

---

## B-05 · Đặt lại mật khẩu (`/reset-password`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 55 | Khởi tạo trang | Truy cập `/reset-password?email=user@test.com` | Trang load, hiển thị form nhập OTP + mật khẩu mới | | | | |
| 56 | Layout – Form | Truy cập `/reset-password` | Hiển thị: field OTP (6 ký tự), field Mật khẩu mới, field Xác nhận mật khẩu, nút "Đặt lại mật khẩu" | | | | |
| 57 | Validate – OTP bỏ trống | Submit form bỏ trống OTP | Lỗi "Vui lòng nhập mã OTP" | | | | |
| 58 | Validate – OTP không đúng 6 ký tự | Nhập `12345`, submit | Lỗi "Mã OTP phải có đúng 6 ký tự" | | | | |
| 59 | Validate – Mật khẩu mới dưới 8 ký tự | Nhập password `abc1234` (7 ký tự) | Lỗi "Mật khẩu phải có ít nhất 8 ký tự" | | | | |
| 60 | Validate – Xác nhận mật khẩu không khớp | Nhập password mới và confirm khác nhau | Lỗi "Mật khẩu xác nhận không khớp" | | | | |
| 61 | Đặt lại mật khẩu thành công | OTP đúng, password mới hợp lệ, confirm khớp | API POST `/api/auth/otp/reset-password` trả 200, password_hash cập nhật trong DB, redirect `/login`, toast "Đặt lại mật khẩu thành công" | | | | |
| 62 | OTP sai khi reset | Nhập OTP không đúng | API trả 400, toast "Mã OTP không hợp lệ" | | | | |
| 63 | OTP hết hạn khi reset | Nhập OTP quá hạn | API trả 400, toast "Mã OTP đã hết hạn" | | | | |
| 64 | Dùng mật khẩu cũ sau reset | Sau khi reset thành công, đăng nhập bằng mật khẩu cũ | Đăng nhập thất bại 401, mật khẩu cũ không còn hiệu lực | | | | |
| 65 | Đăng nhập bằng mật khẩu mới | Sau reset thành công, đăng nhập bằng mật khẩu mới | Đăng nhập thành công, redirect đúng theo role | | | | |
