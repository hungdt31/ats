# ITC - Integration Test Case
# ITC_02 - Luồng Xác Thực, Đăng Ký & Phân Quyền

> **Hệ thống:** ATS (Applicant Tracking System)  
> **Phạm vi:** Đăng ký tài khoản, Xác thực email OTP, Đăng nhập, Quên mật khẩu, Đổi mật khẩu, Phân quyền theo role, Đăng xuất  
> **Người tạo:** QA Team  
> **Ngày tạo:** 2026-05-17  
> **Tham chiếu:** Detail Design Module B

---

## Scenario ITC-06: Registration & Email Verification - Luồng Đăng Ký & Xác Thực Email

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-06 |
| **Giải thích scenario** | Kiểm tra luồng đăng ký tài khoản mới và xác thực email OTP: điền form → nhận OTP → xác minh → tài khoản kích hoạt. Bao gồm các trường hợp: email trùng, OTP sai, OTP hết hạn, OTP đã dùng. |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 14 |
| **Số bug** | |
| **Luồng chính** | Guest truy cập trang đăng ký → Điền thông tin hợp lệ → Nhận OTP qua email → Nhập OTP → Tài khoản kích hoạt → Đăng nhập thành công |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | AUTH / REGISTER | ITC-06-01 | **[Điều kiện]** Guest (không có session). **[Thao tác]** Truy cập `/(auth)/register` | Không có session cookie | Form đăng ký hiển thị với các trường: fullName, email, password, phone (optional). Nút "Đăng ký". | Trang load thành công. Form render đúng các input field. Không redirect. | | | | Module B - Sheet 05 |
| 2 | AUTH / REGISTER (Validation - Empty) | ITC-06-02 | **[Điều kiện]** Form đăng ký đang hiển thị. **[Thao tác]** Nhấn "Đăng ký" mà không điền gì | Tất cả trường bỏ trống | Validation lỗi hiển thị: "fullName là bắt buộc", "Email là bắt buộc", "Password là bắt buộc". | Client-side Zod validation. Không gọi API. Form hiển thị error messages dưới từng field. | | | | Module B - Sheet 04 |
| 3 | AUTH / REGISTER (Validation - Email Invalid) | ITC-06-03 | **[Điều kiện]** Form đăng ký. **[Thao tác]** Nhập email sai format | email=`notanemail`, fullName=`Test User`, password=`Test@1234` | Lỗi "Email không hợp lệ". Không submit. | Zod email validation. Error message xuất hiện dưới field email. | | | | Module B - Sheet 04 |
| 4 | AUTH / REGISTER (Validation - Password Short) | ITC-06-04 | **[Điều kiện]** Form đăng ký. **[Thao tác]** Nhập password dưới 8 ký tự | password=`Test123` (7 chars), email=`valid@email.com`, fullName=`Test User` | Lỗi "Mật khẩu phải có ít nhất 8 ký tự". | Zod validation. Error dưới field password. | | | | Module B - Sheet 04 |
| 5 | AUTH / REGISTER (Validation - fullName Short) | ITC-06-05 | **[Điều kiện]** Form đăng ký. **[Thao tác]** Nhập fullName chỉ 1 ký tự | fullName=`A`, email=`valid@email.com`, password=`Test@1234` | Lỗi "Họ tên phải có ít nhất 2 ký tự". | Zod validation. Error dưới field fullName. | | | | Module B - Sheet 04 |
| 6 | AUTH / REGISTER (Happy Path) | ITC-06-06 | **[Điều kiện]** Form đăng ký, email chưa tồn tại trong DB. **[Thao tác]** Điền đầy đủ thông tin hợp lệ, nhấn "Đăng ký" | fullName=`Nguyen Van Test`, email=`newuser@test.ats`, password=`Test@1234`, phone=`0901234567` | Tài khoản tạo thành công. Email OTP được gửi đến `newuser@test.ats`. Redirect đến trang verify email hoặc hiển thị thông báo kiểm tra email. | POST `/api/auth/register` → 201. DB: `users` có record mới, `emailVerified=false`, `role='candidate'`. `otp_tokens` có bản ghi type=`email_verify`. Email gửi qua Resend. | | | | Module B - Sheet 07 |
| 7 | AUTH / REGISTER (Duplicate Email) | ITC-06-07 | **[Điều kiện]** Email đã tồn tại trong DB. **[Thao tác]** Đăng ký với email đã dùng | email=`candidate@test.ats` (đã có trong DB), fullName=`Another User`, password=`Test@1234` | Lỗi "Email đã được sử dụng". Không tạo tài khoản mới. | POST `/api/auth/register` → 409 Conflict. DB: không có user mới. | | | | Module B - Sheet 07 |
| 8 | AUTH / VERIFY EMAIL | ITC-06-08 | **[Điều kiện]** Tài khoản vừa tạo, OTP đã gửi đến email. **[Thao tác]** Truy cập trang `/(auth)/verify-email`, nhập OTP đúng | email=`newuser@test.ats`, code=`<OTP 6 số hợp lệ từ email>` | Email xác thực thành công. `users.emailVerified = true`. `otp_tokens.usedAt` được cập nhật. Redirect đến trang đăng nhập hoặc dashboard. | POST `/api/auth/otp/verify-email` → 200. DB: `users.emailVerified = true`. `otp_tokens.usedAt` != null. | | | | Module B - Sheet 07 |
| 9 | AUTH / VERIFY EMAIL (Wrong OTP) | ITC-06-09 | **[Điều kiện]** OTP hợp lệ đã gửi. **[Thao tác]** Nhập OTP sai | code=`000000` (sai), email=`newuser@test.ats` | Lỗi "Mã OTP không đúng". `otp_tokens.attempts` tăng thêm 1. | POST `/api/auth/otp/verify-email` → 400. DB: `attempts` tăng. User chưa verified. | | | | Module B - Sheet 07 |
| 10 | AUTH / VERIFY EMAIL (Expired OTP) | ITC-06-10 | **[Điều kiện]** OTP đã hết hạn (expiresAt < now()). **[Thao tác]** Nhập OTP hết hạn | code=`<OTP đã expire>`, email=`newuser@test.ats` | Lỗi "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới". | POST `/api/auth/otp/verify-email` → 400. Kiểm tra `expiresAt` logic trong API. | | | | Module B - Sheet 07 |
| 11 | AUTH / VERIFY EMAIL (Used OTP) | ITC-06-11 | **[Điều kiện]** OTP đã được dùng lần trước (usedAt != null). **[Thao tác]** Nhập lại OTP đã dùng | code=`<OTP đã usedAt>`, email=`newuser@test.ats` | Lỗi "Mã OTP đã được sử dụng". | POST → 400. Kiểm tra `usedAt` != null logic. | | | | Module B - Sheet 07 |
| 12 | AUTH / OTP / SEND (Resend) | ITC-06-12 | **[Điều kiện]** User chưa verify, OTP cũ đã hết hạn. **[Thao tác]** User nhấn "Gửi lại OTP" | email=`newuser@test.ats`, type=`email_verify` | OTP mới được tạo và gửi. `otp_tokens` có bản ghi mới (OTP cũ bị vô hiệu hóa hoặc giữ nguyên tùy logic). | POST `/api/auth/otp/send` → 200. DB: bản ghi OTP mới với `expiresAt` mới. Email mới gửi qua Resend. | | | | Module B - Sheet 07 |
| 13 | AUTH / VERIFY EMAIL (5-char OTP) | ITC-06-13 | **[Điều kiện]** Form verify email. **[Thao tác]** Nhập OTP chỉ 5 ký tự | code=`12345` (5 chars) | Validation lỗi "Mã OTP phải có đúng 6 ký tự". | Client-side Zod validation hoặc API → 400. | | | | Module B - Sheet 04 |
| 14 | AUTH / LOGIN (Unverified) | ITC-06-14 | **[Điều kiện]** Tài khoản tồn tại nhưng `emailVerified=false`. **[Thao tác]** Đăng nhập với tài khoản chưa xác thực email | email=`unverified@test.ats`, password=`Test@1234` | Đăng nhập bị từ chối. Thông báo "Vui lòng xác thực email trước khi đăng nhập". Hoặc redirect đến trang verify-email. | POST `/api/auth/login` → 403 hoặc message phù hợp. Cookie session không được set. | | | | Module B - Sheet 07 |

---

## Scenario ITC-07: Login & Role-Based Redirect - Luồng Đăng Nhập & Phân Quyền Redirect

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-07 |
| **Giải thích scenario** | Kiểm tra luồng đăng nhập với các role khác nhau và redirect đúng trang. Kiểm tra session persistence, logout, và các trường hợp đăng nhập thất bại. |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 13 |
| **Số bug** | |
| **Luồng chính** | User nhập email + password → Xác thực bcrypt → JWT httpOnly cookie được set → Redirect theo role |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | AUTH / LOGIN (Candidate) | ITC-07-01 | **[Điều kiện]** Candidate account đã verified và active. **[Thao tác]** Đăng nhập bằng role=candidate | email=`candidate@test.ats`, password=`Test@1234` | Đăng nhập thành công. Redirect đến `/candidate`. Cookie `session` httpOnly set. | POST `/api/auth/login` → 200. URL sau redirect = `/candidate`. Response header có `Set-Cookie: session=...`. | | | | Module B - Sheet 07 |
| 2 | AUTH / LOGIN (HR) | ITC-07-02 | **[Điều kiện]** HR account đã verified và active. **[Thao tác]** Đăng nhập bằng role=hr | email=`hr@test.ats`, password=`Test@1234` | Redirect đến `/dashboard`. Cookie session set với role=hr. | POST `/api/auth/login` → 200. URL = `/dashboard`. | | | | Module B - Sheet 07 |
| 3 | AUTH / LOGIN (Admin) | ITC-07-03 | **[Điều kiện]** Admin account đã verified và active. **[Thao tác]** Đăng nhập bằng role=admin | email=`admin@test.ats`, password=`Test@1234` | Redirect đến `/dashboard`. Cookie session set với role=admin. | POST `/api/auth/login` → 200. URL = `/dashboard`. | | | | Module B - Sheet 07 |
| 4 | AUTH / LOGIN (Interviewer) | ITC-07-04 | **[Điều kiện]** Interviewer account đã verified và active. **[Thao tác]** Đăng nhập bằng role=interviewer | email=`interviewer@test.ats`, password=`Test@1234` | Redirect đến `/dashboard`. Cookie session set với role=interviewer. | POST `/api/auth/login` → 200. URL = `/dashboard`. | | | | Module B - Sheet 07 |
| 5 | AUTH / LOGIN (Wrong Password) | ITC-07-05 | **[Điều kiện]** Account hợp lệ tồn tại. **[Thao tác]** Đăng nhập với password sai | email=`candidate@test.ats`, password=`WrongPass` | Lỗi "Email hoặc mật khẩu không đúng". Cookie không được set. | POST `/api/auth/login` → 401. Response body có error message. No Set-Cookie header. | | | | Module B - Sheet 07 |
| 6 | AUTH / LOGIN (Non-existent Email) | ITC-07-06 | **[Điều kiện]** Email không tồn tại trong DB. **[Thao tác]** Đăng nhập với email không có | email=`notexist@email.com`, password=`Test@1234` | Lỗi "Email hoặc mật khẩu không đúng". Không tiết lộ email có tồn tại hay không. | POST `/api/auth/login` → 401. Cùng message với wrong password (security). | | | | Module B - Sheet 07 |
| 7 | AUTH / LOGIN (Inactive Account) | ITC-07-07 | **[Điều kiện]** Account có `isActive=false`. **[Thao tác]** Đăng nhập với tài khoản bị vô hiệu hóa | email=`inactive@test.ats`, password=`Test@1234` | Lỗi "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ admin". Cookie không set. | POST `/api/auth/login` → 403. Kiểm tra `users.isActive` logic. | | | | Module B - Sheet 07 |
| 8 | AUTH / ME | ITC-07-08 | **[Điều kiện]** User đã đăng nhập (có session cookie). **[Thao tác]** Gọi GET `/api/auth/me` | Session cookie hợp lệ | Trả về thông tin user: id, email, fullName, role, emailVerified. Không trả về passwordHash. | GET `/api/auth/me` → 200. Response có `{id, email, fullName, role}`. Không có `passwordHash` trong response. | | | | Module B - Sheet 09 |
| 9 | AUTH / ME (No Session) | ITC-07-09 | **[Điều kiện]** Không có session cookie. **[Thao tác]** Gọi GET `/api/auth/me` | Không có cookie | 401 Unauthorized. | GET `/api/auth/me` → 401. | | | | Module B - Sheet 09 |
| 10 | AUTH / LOGOUT | ITC-07-10 | **[Điều kiện]** User đang đăng nhập. **[Thao tác]** Click "Đăng xuất" hoặc gọi POST `/api/auth/logout` | Session cookie hợp lệ | Session cookie bị xóa (Set-Cookie với MaxAge=0 hoặc expires trong quá khứ). Redirect về `/` hoặc trang login. | POST `/api/auth/logout` → 200. Response header `Set-Cookie` clear session. Gọi lại GET `/api/auth/me` → 401. | | | | Module B - Sheet 07 |
| 11 | PROTECTED ROUTE (Candidate → Dashboard) | ITC-07-11 | **[Điều kiện]** Đăng nhập với role=candidate. **[Thao tác]** Candidate cố truy cập `/dashboard` (route chỉ dành cho HR/Admin/Interviewer) | Candidate session cookie | Redirect về `/candidate` hoặc trả về 403. Không cho phép truy cập dashboard. | Truy cập `/dashboard` với candidate session → redirect hoặc 403. | | | | Module B - Sheet 04 |
| 12 | PROTECTED ROUTE (HR → Candidate) | ITC-07-12 | **[Điều kiện]** Đăng nhập với role=hr. **[Thao tác]** HR cố truy cập `/candidate` (route chỉ dành cho candidate) | HR session cookie | Redirect về `/dashboard` hoặc trả về 403. | Truy cập `/candidate` với HR session → redirect hoặc 403. | | | | Module B - Sheet 04 |
| 13 | PROTECTED ROUTE (No Session) | ITC-07-13 | **[Điều kiện]** Guest không có session. **[Thao tác]** Truy cập route được bảo vệ `/candidate` hoặc `/dashboard` | Không có session cookie | Redirect về trang login `/(auth)/login`. | Truy cập protected route → redirect đến login. URL login có query param `?redirect=...` (optional). | | | | Module B - Sheet 04 |

---

## Scenario ITC-08: Forgot Password & Reset - Luồng Quên Mật Khẩu

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-08 |
| **Giải thích scenario** | Kiểm tra luồng quên mật khẩu: nhập email → nhận OTP → xác minh OTP → đặt mật khẩu mới → đăng nhập lại. Bao gồm các trường hợp OTP sai, hết hạn, email không tồn tại. |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 11 |
| **Số bug** | |
| **Luồng chính** | User vào trang quên mật khẩu → Nhập email → Nhận OTP → Nhập OTP → Nhập mật khẩu mới → Đặt lại thành công → Đăng nhập với mật khẩu mới |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | AUTH / FORGOT PASSWORD | ITC-08-01 | **[Điều kiện]** Guest truy cập trang quên mật khẩu `/(auth)/forgot-password`. **[Thao tác]** Nhập email tồn tại, nhấn "Gửi OTP" | email=`candidate@test.ats` | OTP password_reset được tạo và gửi đến email. Thông báo "Mã OTP đã được gửi đến email của bạn". | POST `/api/auth/otp/send` (type=`password_reset`) → 200. DB: `otp_tokens` có record mới type=`password_reset`. Resend API được gọi. | | | | Module B - Sheet 07 |
| 2 | AUTH / FORGOT PASSWORD (Email Not Exist) | ITC-08-02 | **[Điều kiện]** Form quên mật khẩu. **[Thao tác]** Nhập email không tồn tại | email=`notexist@nowhere.com` | Để bảo mật: hiển thị thông báo trung tính "Nếu email tồn tại, OTP sẽ được gửi". Không tiết lộ email có tồn tại hay không. | POST `/api/auth/otp/send` → 200 (với message trung tính) hoặc 404 (tùy policy). Kiểm tra behavior. | | | | Module B - Sheet 07 |
| 3 | AUTH / RESET PASSWORD (Valid OTP) | ITC-08-03 | **[Điều kiện]** OTP password_reset đã gửi đến email. **[Thao tác]** Nhập OTP đúng + mật khẩu mới | email=`candidate@test.ats`, code=`<OTP 6 số hợp lệ>`, newPassword=`NewPass@5678` | Mật khẩu đặt lại thành công. `users.passwordHash` cập nhật. OTP đánh dấu usedAt. Thông báo thành công. Redirect đến login. | POST `/api/auth/otp/reset-password` → 200. DB: `users.passwordHash` thay đổi (bcrypt hash mới). `otp_tokens.usedAt` != null. | | | | Module B - Sheet 07 |
| 4 | AUTH / RESET PASSWORD (Wrong OTP) | ITC-08-04 | **[Điều kiện]** OTP đã gửi. **[Thao tác]** Nhập OTP sai | code=`999999`, email=`candidate@test.ats`, newPassword=`NewPass@5678` | Lỗi "Mã OTP không đúng". Password không thay đổi. `attempts` tăng. | POST `/api/auth/otp/reset-password` → 400. DB: `users.passwordHash` không đổi. `otp_tokens.attempts` tăng. | | | | Module B - Sheet 07 |
| 5 | AUTH / RESET PASSWORD (Expired OTP) | ITC-08-05 | **[Điều kiện]** OTP đã hết hạn. **[Thao tác]** Dùng OTP hết hạn để reset mật khẩu | code=`<OTP expired>`, email=`candidate@test.ats`, newPassword=`NewPass@5678` | Lỗi "Mã OTP đã hết hạn". Redirect hoặc cho phép gửi lại OTP. | POST → 400. Logic kiểm tra `expiresAt < now()`. | | | | Module B - Sheet 07 |
| 6 | AUTH / RESET PASSWORD (New Password Too Short) | ITC-08-06 | **[Điều kiện]** OTP hợp lệ. **[Thao tác]** Đặt mật khẩu mới dưới 8 ký tự | code=`<valid OTP>`, newPassword=`Short1` (6 chars) | Validation lỗi "Mật khẩu mới phải có ít nhất 8 ký tự". Không thực hiện reset. | Client-side hoặc POST → 400. `users.passwordHash` không đổi. | | | | Module B - Sheet 04, 07 |
| 7 | AUTH / LOGIN (With New Password) | ITC-08-07 | **[Điều kiện]** Mật khẩu đã reset thành công. **[Thao tác]** Đăng nhập với mật khẩu mới | email=`candidate@test.ats`, password=`NewPass@5678` | Đăng nhập thành công với mật khẩu mới. Session được tạo. | POST `/api/auth/login` → 200. Cookie set. Redirect đến `/candidate`. | | | | Module B - Sheet 07 |
| 8 | AUTH / LOGIN (With Old Password After Reset) | ITC-08-08 | **[Điều kiện]** Mật khẩu đã reset thành công. **[Thao tác]** Đăng nhập với mật khẩu cũ | email=`candidate@test.ats`, password=`Test@1234` (mật khẩu cũ) | Đăng nhập thất bại. Mật khẩu cũ không còn hiệu lực. | POST `/api/auth/login` → 401. | | | | Module B - Sheet 07 |
| 9 | AUTH / RESET PASSWORD (Used OTP) | ITC-08-09 | **[Điều kiện]** OTP đã dùng để reset. **[Thao tác]** Dùng lại cùng OTP lần 2 | code=`<OTP đã usedAt>` | Lỗi "Mã OTP đã được sử dụng". | POST → 400. `usedAt` != null check. | | | | Module B - Sheet 07 |
| 10 | AUTH / FORGOT PASSWORD (Invalid Email Format) | ITC-08-10 | **[Điều kiện]** Form quên mật khẩu. **[Thao tác]** Nhập email sai format | email=`bademail` | Validation lỗi "Email không hợp lệ". Không gọi API. | Client-side Zod validation. | | | | Module B - Sheet 04 |
| 11 | AUTH / RESET PASSWORD (Type Mismatch) | ITC-08-11 | **[Điều kiện]** Có OTP type=`email_verify` cho user. **[Thao tác]** Dùng OTP email_verify để reset mật khẩu | code=`<OTP email_verify>`, type context = `password_reset` | Lỗi "OTP không hợp lệ cho thao tác này". Phân biệt type OTP. | POST `/api/auth/otp/reset-password` → 400. Logic kiểm tra `otp_tokens.type`. | | | | Module B - Sheet 07 |

---

## Scenario ITC-09: Change Password - Luồng Đổi Mật Khẩu

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-09 |
| **Giải thích scenario** | Kiểm tra luồng đổi mật khẩu khi đã đăng nhập: xác nhận mật khẩu cũ → nhập mật khẩu mới → cập nhật. Bao gồm trường hợp mật khẩu cũ sai, mật khẩu mới không đủ mạnh, chưa đăng nhập. |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 10 |
| **Số bug** | |
| **Luồng chính** | User đã đăng nhập → Vào trang cài đặt/đổi mật khẩu → Nhập mật khẩu cũ và mới → Cập nhật thành công → Có thể đăng nhập với mật khẩu mới |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | SETTINGS / CHANGE PASSWORD (Happy Path) | ITC-09-01 | **[Điều kiện]** Candidate đã đăng nhập. **[Thao tác]** Nhập đúng mật khẩu cũ và mật khẩu mới hợp lệ | currentPassword=`Test@1234`, newPassword=`NewSecure@5678` | Mật khẩu cập nhật thành công. Toast "Đổi mật khẩu thành công". | PATCH `/api/auth/password` → 200. DB: `users.passwordHash` thay đổi. | | | | Module B - Sheet 07 |
| 2 | SETTINGS / CHANGE PASSWORD (Wrong Current) | ITC-09-02 | **[Điều kiện]** Candidate đã đăng nhập. **[Thao tác]** Nhập sai mật khẩu hiện tại | currentPassword=`WrongOld`, newPassword=`NewSecure@5678` | Lỗi "Mật khẩu hiện tại không đúng". | PATCH `/api/auth/password` → 401 hoặc 400. | | | | Module B - Sheet 07 |
| 3 | SETTINGS / CHANGE PASSWORD (Weak New Password) | ITC-09-03 | **[Điều kiện]** Candidate đã đăng nhập. **[Thao tác]** Nhập mật khẩu mới < 8 ký tự | currentPassword=`Test@1234`, newPassword=`short` | Validation lỗi "Mật khẩu mới phải có ít nhất 8 ký tự". | Client-side hoặc PATCH → 400. | | | | Module B - Sheet 04 |
| 4 | SETTINGS / CHANGE PASSWORD (Same Password) | ITC-09-04 | **[Điều kiện]** Candidate đã đăng nhập. **[Thao tác]** Nhập mật khẩu mới giống mật khẩu cũ | currentPassword=`Test@1234`, newPassword=`Test@1234` | Tùy business rule: lỗi "Mật khẩu mới không được giống mật khẩu cũ" hoặc cho phép. Ghi nhận behavior. | PATCH → 400 hoặc 200 tùy quy định. | | | | Module B - Sheet 07 |
| 5 | SETTINGS / CHANGE PASSWORD (Unauthenticated) | ITC-09-05 | **[Điều kiện]** Không có session. **[Thao tác]** Gọi API đổi mật khẩu trực tiếp không có cookie | Không có session cookie | 401 Unauthorized. | PATCH `/api/auth/password` → 401. | | | | Module B - Sheet 07 |
| 6 | SETTINGS / CHANGE PASSWORD (Boundary - Min 8) | ITC-09-06 | **[Điều kiện]** Candidate đã đăng nhập. **[Thao tác]** Nhập mật khẩu mới đúng 8 ký tự | newPassword=`Exactly8` (8 chars) | Mật khẩu được chấp nhận nếu đủ điều kiện. | PATCH → 200 nếu pass validation. Boundary test: 8 ký tự = hợp lệ. | | | | Module B - Sheet 04 |
| 7 | SETTINGS / CHANGE PASSWORD (Boundary - 7 chars) | ITC-09-07 | **[Điều kiện]** Candidate đã đăng nhập. **[Thao tác]** Nhập mật khẩu mới đúng 7 ký tự | newPassword=`Only7ch` (7 chars) | Validation lỗi. 7 ký tự không hợp lệ. | PATCH → 400 hoặc client validation error. | | | | Module B - Sheet 04 |
| 8 | AUTH / ME (After Password Change) | ITC-09-08 | **[Điều kiện]** Mật khẩu vừa được đổi. **[Thao tác]** Kiểm tra session còn hợp lệ không sau khi đổi mật khẩu | Session cookie cũ (trước khi đổi mật khẩu) | Tùy policy: session vẫn hợp lệ (không invalidate) hoặc bị invalidate. Ghi nhận behavior thực tế. | GET `/api/auth/me` → 200 hoặc 401. Ghi lại kết quả. | | | | Module B - Sheet 07 |
| 9 | AUTH / LOGIN (HR - Change Password) | ITC-09-09 | **[Điều kiện]** HR đã đổi mật khẩu. **[Thao tác]** Đăng nhập lại với mật khẩu mới | email=`hr@test.ats`, password=`NewSecure@5678` | Đăng nhập thành công. Redirect `/dashboard`. | POST `/api/auth/login` → 200. | | | | Module B |
| 10 | AUTH / LOGIN (After Change - Old Pass) | ITC-09-10 | **[Điều kiện]** HR đã đổi mật khẩu. **[Thao tác]** Đăng nhập với mật khẩu cũ | email=`hr@test.ats`, password=`Test@1234` (cũ) | Đăng nhập thất bại. | POST `/api/auth/login` → 401. | | | | Module B |

---

## Scenario ITC-10: Role-Based Authorization - Luồng Phân Quyền Theo Role

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-10 |
| **Giải thích scenario** | Kiểm tra phân quyền: mỗi role chỉ được truy cập đúng API và trang của mình. Kiểm tra các trường hợp cross-role access bị chặn đúng. |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 14 |
| **Số bug** | |
| **Luồng chính** | Test matrix: mỗi role thử gọi API không được phép → nhận 401/403 đúng |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | API / DASHBOARD (Candidate) | ITC-10-01 | **[Điều kiện]** Đăng nhập candidate. **[Thao tác]** Candidate gọi GET `/api/dashboard/applications` | Candidate session | 401 hoặc 403. Endpoint dashboard chỉ cho admin/hr/interviewer. | GET `/api/dashboard/applications` với candidate session → 401/403. | | | | Module E |
| 2 | API / DASHBOARD / JOBS POST (Candidate) | ITC-10-02 | **[Điều kiện]** Đăng nhập candidate. **[Thao tác]** Candidate gọi POST `/api/dashboard/jobs` để tạo job | Candidate session | 403 Forbidden. | POST `/api/dashboard/jobs` với candidate session → 403. | | | | Module G |
| 3 | API / CANDIDATE (HR) | ITC-10-03 | **[Điều kiện]** Đăng nhập HR. **[Thao tác]** HR gọi GET `/api/candidate/profile` - endpoint cá nhân của candidate | HR session | Tuỳ thiết kế: 403 nếu chỉ dành cho candidate, hoặc 200 nếu HR được phép xem profile của mình. Ghi nhận behavior. | GET `/api/candidate/profile` với HR session → kiểm tra response. | | | | Module C |
| 4 | API / CANDIDATE / APPLY (HR) | ITC-10-04 | **[Điều kiện]** Đăng nhập HR. **[Thao tác]** HR thử nộp đơn ứng tuyển vào job | POST `/api/jobs/[slug]/apply` với HR session | 403 Forbidden. HR không thể nộp đơn ứng tuyển. | POST `/api/jobs/[slug]/apply` với HR session → 403. | | | | Module C, E |
| 5 | API / INTERVIEWS / SCORE (Candidate) | ITC-10-05 | **[Điều kiện]** Đăng nhập candidate. **[Thao tác]** Candidate thử chấm điểm phỏng vấn | POST `/api/dashboard/interviews/[id]/score` với candidate session | 403 Forbidden. Chỉ interviewer/hr/admin mới được chấm điểm. | POST với candidate session → 403. | | | | Module F |
| 6 | API / INTERVIEWS / SCORE (HR) | ITC-10-06 | **[Điều kiện]** Đăng nhập HR. **[Thao tác]** HR thử chấm điểm phỏng vấn (HR tạo PV, không phải người chấm) | HR session, interview không giao cho HR | Tuỳ policy: 403 (chỉ interviewer được giao mới chấm) hoặc 200 (HR có quyền admin). Ghi nhận. | POST → kiểm tra policy. | | | | Module F |
| 7 | API / STATUS CHANGE (Interviewer) | ITC-10-07 | **[Điều kiện]** Đăng nhập Interviewer. **[Thao tác]** Interviewer cố đổi status đơn ứng tuyển | POST `/api/dashboard/applications/[id]/status` với interviewer session | 403 Forbidden. Chỉ HR/Admin đổi status đơn. | POST → 403. | | | | Module E |
| 8 | API / JOBS CREATE (Interviewer) | ITC-10-08 | **[Điều kiện]** Đăng nhập Interviewer. **[Thao tác]** Interviewer thử tạo job | POST `/api/dashboard/jobs` với interviewer session | 403 Forbidden. Chỉ HR/Admin tạo job. | POST → 403. | | | | Module G |
| 9 | API / ME (Valid Token) | ITC-10-09 | **[Điều kiện]** User đã đăng nhập (bất kỳ role). **[Thao tác]** Gọi GET `/api/auth/me` | Session hợp lệ | 200 với thông tin user đúng role. | GET → 200, `role` field khớp với role khi đăng nhập. | | | | Module B |
| 10 | API / ME (Expired Token) | ITC-10-10 | **[Điều kiện]** Token JWT đã hết hạn (giả lập hoặc dùng token cũ). **[Thao tác]** Gọi GET `/api/auth/me` với token hết hạn | Token hết hạn trong cookie | 401 Unauthorized. Token không còn hiệu lực. | GET `/api/auth/me` → 401. | | | | Module B |
| 11 | API / ME (Tampered Token) | ITC-10-11 | **[Điều kiện]** Token JWT bị giả mạo (thay đổi payload). **[Thao tác]** Gọi GET `/api/auth/me` với token giả | Cookie `session` với token bị thay đổi payload | 401 Unauthorized. JWT signature không khớp. | GET `/api/auth/me` → 401. Hệ thống phát hiện token bị tamper. | | | | Module B |
| 12 | API / CANDIDATE / FILES (Other User) | ITC-10-12 | **[Điều kiện]** Candidate A đã đăng nhập. **[Thao tác]** Candidate A cố xóa file của Candidate B | DELETE `/api/candidate/files/[id_of_B_file]` với session của A | 403 Forbidden hoặc 404. A không được xóa file của B. | DELETE → 403 hoặc 404. Logic ownership check. | | | | Module C |
| 13 | API / APPLICATIONS (Candidate - Other User) | ITC-10-13 | **[Điều kiện]** Candidate A đã đăng nhập. **[Thao tác]** Candidate A gọi API xem đơn của mình, kiểm tra không thấy đơn của Candidate B | GET `/api/candidate/applications` | Response chỉ chứa đơn của Candidate A. Không lộ data của user khác. | GET → 200. Mỗi item trong response có `candidate_id` = ID của Candidate A. | | | | Module C |
| 14 | API / PUBLIC (No Auth Required) | ITC-10-14 | **[Điều kiện]** Guest không có session. **[Thao tác]** Gọi các API public: GET `/api/jobs`, GET `/api/jobs/[slug]` | Không có session cookie | 200 OK. Không yêu cầu xác thực cho API public. | GET `/api/jobs` → 200. GET `/api/jobs/[slug]` → 200. Không redirect đến login. | | | | Module A |

---

*Tổng số test case trong file ITC_02: 62 test cases thuộc 5 scenario (ITC-06 đến ITC-10)*  
*Cập nhật: 2026-05-17 — QA Team*
