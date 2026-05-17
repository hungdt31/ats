# ITE - Integration Test Evidence / Test Data
# ATS - Master Test Data

> **Hệ thống:** ATS (Applicant Tracking System)  
> **Mục đích:** Chuẩn bị toàn bộ dữ liệu cần thiết để thực thi các test case ITC và UTC  
> **Người tạo:** QA Team  
> **Ngày tạo:** 2026-05-17  
> **Tham chiếu:** ITC_01_Hiring_Flow.md, ITC_02_Auth_Flow.md, UTC_B/C/D/E/F/G

---

## Nhóm 1: User Accounts — Tài Khoản Người Dùng

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 1.1 | User - Candidate (Verified) | Bảng: `users` / API: `POST /api/auth/login` | `id`: UUID tự sinh<br>`email`: `candidate@test.ats`<br>`passwordHash`: bcrypt(`Test@1234`)<br>`fullName`: `Nguyen Van Candidate`<br>`phone`: `0901234567`<br>`role`: `candidate`<br>`isActive`: `true`<br>`emailVerified`: `true` | Tài khoản đã kích hoạt, mật khẩu đã hash bcrypt | ITC-01-07, ITC-02-05, ITC-07-01, ITC-10-01 đến ITC-10-05 | **Bắt buộc.** Tài khoản candidate chính dùng trong hầu hết test case |
| 1.2 | User - HR (Verified) | Bảng: `users` / API: `POST /api/auth/login` | `email`: `hr@test.ats`<br>`passwordHash`: bcrypt(`Test@1234`)<br>`fullName`: `Tran Thi HR`<br>`phone`: `0912345678`<br>`role`: `hr`<br>`isActive`: `true`<br>`emailVerified`: `true` | Tài khoản HR đã kích hoạt | ITC-01-01, ITC-04, ITC-05, ITC-07-02 | **Bắt buộc.** Tài khoản HR chính |
| 1.3 | User - Admin (Verified) | Bảng: `users` / API: `POST /api/auth/login` | `email`: `admin@test.ats`<br>`passwordHash`: bcrypt(`Test@1234`)<br>`fullName`: `Le Van Admin`<br>`role`: `admin`<br>`isActive`: `true`<br>`emailVerified`: `true` | Tài khoản Admin đã kích hoạt | ITC-07-03, kiểm tra quyền admin | **Bắt buộc.** |
| 1.4 | User - Interviewer (Verified) | Bảng: `users` / API: `POST /api/auth/login` | `email`: `interviewer@test.ats`<br>`passwordHash`: bcrypt(`Test@1234`)<br>`fullName`: `Pham Van Interviewer`<br>`role`: `interviewer`<br>`isActive`: `true`<br>`emailVerified`: `true` | Tài khoản Interviewer đã kích hoạt | ITC-01-14, ITC-03-04, ITC-03-05, ITC-07-04, ITC-10-07 | **Bắt buộc.** |
| 1.5 | User - Candidate (Unverified) | Bảng: `users` | `email`: `unverified@test.ats`<br>`passwordHash`: bcrypt(`Test@1234`)<br>`fullName`: `Unverified User`<br>`role`: `candidate`<br>`isActive`: `true`<br>`emailVerified`: `false` | `emailVerified = false` | ITC-06-14: kiểm tra đăng nhập tài khoản chưa xác thực email | **Bắt buộc.** |
| 1.6 | User - Inactive | Bảng: `users` | `email`: `inactive@test.ats`<br>`passwordHash`: bcrypt(`Test@1234`)<br>`fullName`: `Inactive User`<br>`role`: `candidate`<br>`isActive`: `false`<br>`emailVerified`: `true` | `isActive = false` | ITC-07-07: kiểm tra đăng nhập tài khoản bị vô hiệu hóa | **Bắt buộc.** |
| 1.7 | User - Candidate B (Secondary) | Bảng: `users` | `email`: `candidate2@test.ats`<br>`passwordHash`: bcrypt(`Test@1234`)<br>`fullName`: `Second Candidate`<br>`role`: `candidate`<br>`isActive`: `true`<br>`emailVerified`: `true` | Tài khoản candidate thứ 2 | ITC-10-12, ITC-10-13: kiểm tra cross-user access | **Bắt buộc cho security tests.** |

---

## Nhóm 2: OTP Data — Dữ Liệu OTP

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 2.1 | OTP - Hợp lệ (email_verify) | Bảng: `otp_tokens` / API: `POST /api/auth/otp/verify-email` | `email`: `newuser@test.ats`<br>`code`: `123456`<br>`type`: `email_verify`<br>`attempts`: `0`<br>`expiresAt`: `[now + 15 phút]`<br>`usedAt`: `null` | OTP còn hiệu lực, chưa dùng | ITC-06-08: xác minh email hợp lệ | **Tạo fresh trước khi test.** Code phải còn trong hiệu lực |
| 2.2 | OTP - Hết hạn (email_verify) | Bảng: `otp_tokens` | `email`: `newuser@test.ats`<br>`code`: `654321`<br>`type`: `email_verify`<br>`attempts`: `0`<br>`expiresAt`: `[2026-01-01T00:00:00]` (quá khứ)<br>`usedAt`: `null` | `expiresAt` trong quá khứ | ITC-06-10: kiểm tra OTP hết hạn | Insert trực tiếp vào DB với thời gian quá khứ |
| 2.3 | OTP - Đã dùng (email_verify) | Bảng: `otp_tokens` | `email`: `used_otp@test.ats`<br>`code`: `111111`<br>`type`: `email_verify`<br>`attempts`: `1`<br>`expiresAt`: `[now + 15 phút]`<br>`usedAt`: `2026-05-17T00:00:00` | `usedAt != null` | ITC-06-11: kiểm tra OTP đã dùng | Insert với `usedAt` đã có giá trị |
| 2.4 | OTP - Hợp lệ (password_reset) | Bảng: `otp_tokens` | `email`: `candidate@test.ats`<br>`code`: `789012`<br>`type`: `password_reset`<br>`attempts`: `0`<br>`expiresAt`: `[now + 15 phút]`<br>`usedAt`: `null` | OTP reset mật khẩu còn hiệu lực | ITC-08-03: reset mật khẩu thành công | Tạo fresh trước khi test |
| 2.5 | OTP - Hết hạn (password_reset) | Bảng: `otp_tokens` | `email`: `candidate@test.ats`<br>`code`: `999888`<br>`type`: `password_reset`<br>`attempts`: `0`<br>`expiresAt`: `[2026-01-01T00:00:00]`<br>`usedAt`: `null` | `expiresAt` trong quá khứ | ITC-08-05: reset với OTP hết hạn | |
| 2.6 | OTP - Sai format (5 ký tự) | N/A (dữ liệu test input) | Input: `12345` (5 ký tự) | Không phải 6 ký tự | ITC-06-13, ITC-08-10: kiểm tra Zod validation | Không cần insert DB, đây là input test |
| 2.7 | OTP - Sai giá trị | N/A (dữ liệu test input) | Input: `000000` (6 ký tự nhưng sai) | OTP không khớp với bất kỳ record nào | ITC-06-09, ITC-08-04: kiểm tra OTP sai | |
| 2.8 | OTP - Type mismatch | Bảng: `otp_tokens` | `code`: `555666`<br>`type`: `email_verify` (nhưng dùng cho reset password endpoint) | Type không khớp với endpoint | ITC-08-11: kiểm tra type mismatch | |

---

## Nhóm 3: Jobs — Dữ Liệu Công Việc

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 3.1 | Job - Active (nhận đơn) | Bảng: `jobs` / API: `GET /api/jobs` | `id`: UUID<br>`title`: `Senior Frontend Developer`<br>`slug`: `senior-frontend-developer`<br>`description`: `Yêu cầu 5 năm kinh nghiệm React, TypeScript...`<br>`employment_type`: `full_time`<br>`headcount`: `2`<br>`status`: `active`<br>`expires_at`: `2026-12-31` | `status='active'`, `expires_at` > now | ITC-01-05, ITC-02-01, ITC-02-03, ITC-02-07 | **Bắt buộc.** Job chính cho toàn bộ E2E flow |
| 3.2 | Job - Draft | Bảng: `jobs` | `title`: `Backend Java Developer`<br>`slug`: `backend-java-developer`<br>`status`: `draft`<br>`employment_type`: `full_time`<br>`headcount`: `3` | `status='draft'` | ITC-02-02: kiểm tra draft không hiển thị public, ITC-04-03: chỉnh sửa job draft | **Bắt buộc.** |
| 3.3 | Job - Closed | Bảng: `jobs` | `title`: `Closed Position`<br>`slug`: `closed-position`<br>`status`: `closed`<br>`employment_type`: `part_time`<br>`headcount`: `1` | `status='closed'` | ITC-02-02: không hiển thị public, ITC-02-04: URL closed job, ITC-02-09: apply vào closed job | **Bắt buộc.** |
| 3.4 | Job - Active, expires tương lai xa | Bảng: `jobs` | `title`: `Product Manager Long Term`<br>`slug`: `product-manager-long-term`<br>`status`: `active`<br>`expires_at`: `2027-12-31` | `status='active'`, `expires_at` xa trong tương lai | Dùng làm job phụ trong nhiều test case cần job active | Optional |
| 3.5 | Job - Hết hạn (expires đã qua) | Bảng: `jobs` | `title`: `Expired Job Position`<br>`slug`: `expired-job-position`<br>`status`: `active`<br>`expires_at`: `2026-01-01` (quá khứ) | `expires_at < now()`, `status='active'` | ITC-04-11: kiểm tra job hết hạn không hiển thị public | Insert với `expires_at` trong quá khứ |
| 3.6 | Job - Archived | Bảng: `jobs` | `title`: `Archived Old Job`<br>`slug`: `archived-old-job`<br>`status`: `archived` | `status='archived'` | ITC-04-12: kiểm tra archive flow | |
| 3.7 | Job - Title UNIQUE constraint | N/A (dữ liệu test input) | Input title = `Senior Frontend Developer` (đã tồn tại trong 3.1) | Trùng với record 3.1 | ITC-04-01: test UNIQUE constraint | |

---

## Nhóm 4: Applications — Dữ Liệu Đơn Ứng Tuyển

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 4.1 | Application - Status: applied | Bảng: `applications` / API: `GET /api/dashboard/applications` | `id`: UUID<br>`job_id`: FK → `senior-frontend-developer`<br>`candidate_id`: FK → `candidate@test.ats`<br>`cv_file_url`: `https://appwrite.io/v1/storage/files/cv_001/view`<br>`cover_letter`: `Tôi rất muốn ứng tuyển...`<br>`status`: `applied` | `status='applied'`, UNIQUE(job_id, candidate_id) | ITC-01-08 đến ITC-01-10, ITC-05-01, ITC-05-02, ITC-05-03 | **Bắt buộc.** Đơn chính cho E2E flow |
| 4.2 | Application - Status: screening | Bảng: `applications` | `job_id`: FK → `backend-java-developer` (hoặc job khác)<br>`candidate_id`: FK → `candidate2@test.ats`<br>`status`: `screening`<br>`cv_file_url`: `https://appwrite.io/v1/storage/files/cv_002/view` | `status='screening'` | ITC-05-04, ITC-05-07 (reject từ screening) | |
| 4.3 | Application - Status: interviewing | Bảng: `applications` | `job_id`: FK → job active<br>`candidate_id`: FK → candidate2<br>`status`: `interviewing` | `status='interviewing'` | ITC-03-01: tạo phỏng vấn, ITC-05-08 (offered) | |
| 4.4 | Application - Status: offered | Bảng: `applications` | `status`: `offered` | — | ITC-05-08: kiểm tra sau khi offered | |
| 4.5 | Application - Status: hired | Bảng: `applications` | `status`: `hired` | — | ITC-01-15: kết thúc E2E flow | |
| 4.6 | Application - Status: rejected | Bảng: `applications` | `status`: `rejected`<br>`cover_letter`: null | Đơn bị từ chối, không có cover letter | ITC-05-07: reject flow | |
| 4.7 | Application - Duplicate (same job + candidate) | Bảng: `applications` | Đã có record: `job_id = senior-frontend-developer`, `candidate_id = candidate@test.ats` | Đã tồn tại trong UNIQUE(job_id, candidate_id) | ITC-02-08: test duplicate application | Dùng chính record 4.1 |
| 4.8 | Application - Không có cover letter | Bảng: `applications` | `cover_letter`: `null`<br>`status`: `applied` | `cover_letter IS NULL` | Kiểm tra đơn không bắt buộc cover letter | |

---

## Nhóm 5: Application Status History — Lịch Sử Trạng Thái Đơn

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 5.1 | History - Đầy đủ E2E (5 bước) | Bảng: `application_status_history` / API: `GET /api/dashboard/applications/[id]` | 5 records cho application 4.5 (hired):<br>Record 1: `from_status=null`, `to_status='applied'`, `changed_by=candidate_id`, `note='Ứng viên nộp đơn'`, `changed_at=2026-05-10`<br>Record 2: `from_status='applied'`, `to_status='screening'`, `changed_by=hr_id`, `note='CV phù hợp'`, `changed_at=2026-05-11`<br>Record 3: `from_status='screening'`, `to_status='interviewing'`, `changed_by=hr_id`, `note='Pass screening'`, `changed_at=2026-05-12`<br>Record 4: `from_status='interviewing'`, `to_status='offered'`, `changed_by=hr_id`, `note='Gửi offer'`, `changed_at=2026-05-14`<br>Record 5: `from_status='offered'`, `to_status='hired'`, `changed_by=hr_id`, `note='Đã ký hợp đồng'`, `changed_at=2026-05-15` | Đầy đủ lịch sử cho 1 đơn từ applied → hired | ITC-05-02: xem chi tiết đơn có history đầy đủ, ITC-01-15 | Dữ liệu tham khảo để verify sau khi chạy test |
| 5.2 | History - Đơn bị reject | Bảng: `application_status_history` | 3 records: applied → screening → rejected | Lịch sử reject | ITC-05-07: verify reject history | |

---

## Nhóm 6: Email Logs — Nhật Ký Email

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 6.1 | Email Log - Sent (invite) | Bảng: `email_logs` / API: `GET /api/dashboard/applications/[id]/emails` | `application_id`: FK<br>`recipient_id`: FK → `candidate@test.ats`<br>`sender_id`: FK → `hr@test.ats`<br>`subject`: `Thư mời phỏng vấn - Senior Frontend Developer`<br>`type`: `invite`<br>`status`: `sent` | `status='sent'` | ITC-03-01, ITC-05-05, ITC-05-06 | |
| 6.2 | Email Log - Failed | Bảng: `email_logs` | `type`: `rejection`<br>`status`: `failed`<br>`subject`: `Thông báo kết quả ứng tuyển` | `status='failed'` | Kiểm tra xử lý khi email gửi thất bại | Simulate bằng cách set status trực tiếp |
| 6.3 | Email Log - Pending | Bảng: `email_logs` | `type`: `result`<br>`status`: `pending` | `status='pending'` | Kiểm tra email đang chờ gửi | |
| 6.4 | Email Log - Offer | Bảng: `email_logs` | `type`: `offer`<br>`status`: `sent` | `status='sent'`, `type='offer'` | ITC-05-08: kiểm tra email offer gửi khi chuyển status | |
| 6.5 | Email Log - Rejection | Bảng: `email_logs` | `type`: `rejection`<br>`status`: `sent` | `status='sent'`, `type='rejection'` | ITC-05-07: kiểm tra email từ chối gửi tự động | |

---

## Nhóm 7: Interviews — Dữ Liệu Phỏng Vấn

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 7.1 | Interview - Scheduled (tương lai) | Bảng: `interviews` / API: `GET /api/dashboard/interviews` | `id`: UUID<br>`application_id`: FK → application 4.3 (interviewing)<br>`interviewer_id`: FK → `interviewer@test.ats`<br>`scheduled_at`: `2026-06-15T10:00:00`<br>`duration_minutes`: `60`<br>`type`: `video`<br>`status`: `scheduled`<br>`meeting_link`: `https://meet.google.com/abc-defg-hij` | `status='scheduled'`, `scheduled_at` tương lai | ITC-03-04, ITC-03-05, ITC-03-09, ITC-03-10 | **Bắt buộc.** |
| 7.2 | Interview - Completed (có score) | Bảng: `interviews` | `status`: `completed`<br>`scheduled_at`: `2026-05-10T10:00:00`<br>`notes`: `Phỏng vấn diễn ra tốt` | `status='completed'`, có `interview_scores` | ITC-03-08: HR xem scorecard | |
| 7.3 | Interview - Cancelled | Bảng: `interviews` | `status`: `cancelled`<br>`scheduled_at`: `2026-05-05T14:00:00` | `status='cancelled'` | ITC-03-10: kiểm tra cancel flow | Tạo trước hoặc là kết quả của test ITC-03-10 |
| 7.4 | Interview - Chưa có scorecard | Bảng: `interviews` | `status`: `scheduled`<br>Không có record trong `interview_scores` | Không có bản ghi trong `interview_scores` | ITC-03-05: submit scorecard lần đầu | Là record 7.1 trước khi test |
| 7.5 | Interview - Rescheduled | Bảng: `interviews` | `status`: `rescheduled`<br>`scheduled_at`: ngày đã cập nhật | `status='rescheduled'` | ITC-03-09: reschedule flow | Kết quả sau khi chạy test ITC-03-09 |
| 7.6 | Interview - Type: onsite | Bảng: `interviews` | `type`: `onsite`<br>`location`: `Văn phòng HCM, Tầng 5`<br>`meeting_link`: `null`<br>`status`: `scheduled` | `type='onsite'` với location thay vì meeting_link | Kiểm tra interview type đa dạng | |

---

## Nhóm 8: Interview Scores — Dữ Liệu Chấm Điểm

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 8.1 | Score - Đầy đủ, is_final=true | Bảng: `interview_scores` / API: `GET /api/dashboard/interviews/[id]` | `interview_id`: FK → interview 7.2<br>`evaluator_id`: FK → `interviewer@test.ats`<br>`technical_score`: `8`<br>`communication_score`: `7`<br>`cultural_fit_score`: `8`<br>`overall_score`: `8`<br>`result`: `pass`<br>`is_final`: `true` | `is_final=true`, tất cả điểm trong range 1-10 | ITC-03-08: HR xem scorecard đã hoàn thành | |
| 8.2 | Score - Chưa final | Bảng: `interview_scores` | `technical_score`: `6`<br>`overall_score`: `6`<br>`result`: `hold`<br>`is_final`: `false` | `is_final=false` | Kiểm tra scorecard chưa final | |
| 8.3 | Score - Điểm biên: min (1) | N/A (input test) | `technical_score=1`, `communication_score=1`, `cultural_fit_score=1`, `overall_score=1` | Điểm = 1 (minimum) | ITC-03-07 boundary test: score=1 | |
| 8.4 | Score - Điểm biên: max (10) | N/A (input test) | `technical_score=10`, `communication_score=10`, `cultural_fit_score=10`, `overall_score=10` | Điểm = 10 (maximum) | ITC-03-07 boundary test: score=10 | |
| 8.5 | Score - Điểm ngoài range | N/A (input test) | `technical_score=11`, `overall_score=0` | Score ngoài range 1-10 | ITC-03-07: kiểm tra validation từ chối | |
| 8.6 | Score - Duplicate (cùng interview + evaluator) | Bảng: `interview_scores` | Đã có record với `interview_id=X` + `evaluator_id=interviewer_id` | Trùng UNIQUE(interview_id, evaluator_id) | ITC-03-06: test duplicate score | Dùng record 8.1 |

---

## Nhóm 9: Candidate Profiles — Hồ Sơ Ứng Viên

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 9.1 | Profile - Đầy đủ | Bảng: `candidate_profiles` / API: `GET /api/candidate/profile` | `user_id`: FK → `candidate@test.ats`<br>`title`: `Senior React Developer`<br>`bio`: `6 năm kinh nghiệm lập trình...`<br>`location`: `Hồ Chí Minh`<br>`years_experience`: `6`<br>`skills`: `["React","TypeScript","Node.js","PostgreSQL"]`<br>`education`: `[{"school":"ĐH Bách Khoa","degree":"Kỹ sư","year":2018}]`<br>`linkedin_url`: `https://linkedin.com/in/candidate-test`<br>`github_url`: `https://github.com/candidate-test` | Profile đầy đủ, không có trường NULL | Kiểm tra GET profile đầy đủ | |
| 9.2 | Profile - Không có (no profile) | Bảng: `candidate_profiles` | User `candidate2@test.ats` không có record trong `candidate_profiles` | Không có FK trỏ đến | Kiểm tra trường hợp user chưa tạo profile | GET `/api/candidate/profile` → 404 hoặc empty |
| 9.3 | Profile - Tối giản | Bảng: `candidate_profiles` | `user_id`: FK → `candidate2@test.ats`<br>`title`: `Fresher Developer`<br>Các trường còn lại = null | Chỉ có trường bắt buộc | Kiểm tra PATCH update profile một phần | |

---

## Nhóm 10: Files — Dữ Liệu File Upload

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 10.1 | File - CV hợp lệ | Bảng: `files` / API: `GET /api/candidate/files` | `user_id`: FK → `candidate@test.ats`<br>`file_name`: `cv_nguyen_van_candidate.pdf`<br>`file_url`: `https://cloud.appwrite.io/v1/storage/buckets/ats/files/cv_001/view`<br>`file_type`: `cv`<br>`appwrite_id`: `cv_001` | File tồn tại trên Appwrite, URL hợp lệ | ITC-02-06, ITC-02-07: upload và apply với CV | **Bắt buộc.** |
| 10.2 | File - Portfolio | Bảng: `files` | `file_type`: `portfolio`<br>`file_name`: `portfolio_2026.pdf`<br>`appwrite_id`: `portfolio_001` | `file_type='portfolio'` | Kiểm tra upload portfolio | |
| 10.3 | File - Certificate | Bảng: `files` | `file_type`: `certificate`<br>`file_name`: `aws_certificate.pdf`<br>`appwrite_id`: `cert_001` | `file_type='certificate'` | Kiểm tra upload certificate | |
| 10.4 | File - Không tồn tại (404) | N/A | `file_id=non_existent_file_id` (ID không có trong DB) | ID không tồn tại | Kiểm tra DELETE file không tồn tại → 404, GET file không tồn tại → 404 | Không cần insert, dùng ID giả |
| 10.5 | File - Của Candidate B | Bảng: `files` | `user_id`: FK → `candidate2@test.ats`<br>`appwrite_id`: `cv_002`<br>`file_type`: `cv` | Thuộc candidate khác | ITC-10-12: Candidate A cố xóa file của Candidate B | |
| 10.6 | File upload test data | N/A (binary file) | File vật lý: `cv_test.pdf` (< 5MB, valid PDF)<br>File test: `large_file.pdf` (> 5MB để test size limit)<br>File test: `test.exe` (wrong type) | Các file để upload trong test | ITC-02-06: test upload file | Chuẩn bị file local trước khi test |

---

## Nhóm 11: Job Channels — Dữ Liệu Kênh Đăng Tuyển

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 11.1 | Channel - Pending | Bảng: `job_channels` / API: `GET /api/dashboard/jobs/[id]/channels` | `job_id`: FK → senior-frontend-developer<br>`channel`: `linkedin`<br>`status`: `pending` | `status='pending'` | ITC-04-05: thêm kênh mới | |
| 11.2 | Channel - Posted | Bảng: `job_channels` | `job_id`: FK → senior-frontend-developer<br>`channel`: `topcv`<br>`status`: `posted` | `status='posted'` | ITC-04-07: xem kênh đã posted | |
| 11.3 | Channel - Failed | Bảng: `job_channels` | `channel`: `vietnamworks`<br>`status`: `failed` | `status='failed'` | Kiểm tra xử lý khi đăng kênh thất bại | |
| 11.4 | Channel - Expired | Bảng: `job_channels` | `channel`: `itviec`<br>`status`: `expired` | `status='expired'` | Kiểm tra kênh hết hạn | |
| 11.5 | Channel - Duplicate (UNIQUE constraint) | Bảng: `job_channels` | Đã có `job_id=X, channel='linkedin'` trong DB | Trùng UNIQUE(job_id, channel) | ITC-04-06: test duplicate channel | Dùng record 11.1 |
| 11.6 | Channel - All channels | N/A (reference data) | Danh sách kênh hợp lệ: `linkedin`, `itviec`, `topcv`, `vietnamworks`, `website` | Theo ENUM trong schema | Dùng khi tạo/test đầy đủ kênh | |

---

## Nhóm 12: Boundary Data — Dữ Liệu Biên

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 12.1 | Password - Đúng 8 ký tự (min valid) | API: `POST /api/auth/register` | `password`: `Exact@8!` (8 chars) | Đúng min length = 8 | ITC-09-06: boundary min password | Pass validation |
| 12.2 | Password - 7 ký tự (invalid) | API: `POST /api/auth/register` | `password`: `Short@7` (7 chars) | Dưới min length | ITC-09-07: boundary fail | Fail validation |
| 12.3 | fullName - 2 ký tự (min valid) | API: `POST /api/auth/register` | `fullName`: `Ab` (2 chars) | Đúng min length = 2 | Boundary test fullName | Pass validation |
| 12.4 | fullName - 1 ký tự (invalid) | API: `POST /api/auth/register` | `fullName`: `A` (1 char) | Dưới min length | Boundary test fullName | Fail validation |
| 12.5 | phone - Đúng 20 ký tự (max valid) | API: `POST /api/auth/register` | `phone`: `01234567890123456789` (20 chars) | Đúng max length = 20 | Boundary test phone max | Pass validation |
| 12.6 | phone - 21 ký tự (invalid) | API: `POST /api/auth/register` | `phone`: `012345678901234567890` (21 chars) | Trên max length | Boundary test phone | Fail validation |
| 12.7 | OTP code - Đúng 6 ký tự | API: `POST /api/auth/otp/verify-email` | `code`: `123456` (6 chars) | Đúng length | Valid OTP format | |
| 12.8 | OTP code - 5 ký tự (invalid) | API: `POST /api/auth/otp/verify-email` | `code`: `12345` (5 chars) | Dưới min | ITC-06-13: fail Zod validation | |
| 12.9 | OTP code - 7 ký tự (invalid) | API: `POST /api/auth/otp/verify-email` | `code`: `1234567` (7 chars) | Trên max | Boundary test OTP | Fail validation |
| 12.10 | Interview score - Min 1 | API: `POST /api/dashboard/interviews/[id]/score` | `technical_score=1`, `overall_score=1` | Điểm = 1 (min valid) | ITC-03-07: boundary test | Pass validation |
| 12.11 | Interview score - Max 10 | API: `POST /api/dashboard/interviews/[id]/score` | `technical_score=10`, `overall_score=10` | Điểm = 10 (max valid) | ITC-03-07: boundary test | Pass validation |
| 12.12 | Interview score - 0 (invalid) | API: `POST /api/dashboard/interviews/[id]/score` | `technical_score=0` | Dưới min | ITC-03-07: boundary fail | Fail validation |
| 12.13 | Interview score - 11 (invalid) | API: `POST /api/dashboard/interviews/[id]/score` | `technical_score=11` | Trên max | ITC-03-07: boundary fail | Fail validation |
| 12.14 | Job title - 200 ký tự (large) | API: `POST /api/dashboard/jobs` | `title`: `A` × 200 chars | 200 ký tự (kiểm tra DB column limit) | Boundary test cho title field | Cần kiểm tra DB schema column max length |

---

## Nhóm 13: Invalid Data — Dữ Liệu Không Hợp Lệ

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 13.1 | Email - Sai format (thiếu @) | API: `POST /api/auth/register` / `login` | `email`: `notanemail.com` | Không có ký tự `@` | ITC-06-03, ITC-08-10: email validation | Zod reject |
| 13.2 | Email - Sai format (thiếu domain) | API: `POST /api/auth/register` | `email`: `user@` | Có @ nhưng thiếu domain | Kiểm tra Zod email pattern | Zod reject |
| 13.3 | Email - Empty | API: `POST /api/auth/register` | `email`: `` (empty string) | Trường rỗng | ITC-06-02: required validation | Zod reject |
| 13.4 | Password - Empty | API: `POST /api/auth/register` | `password`: `` (empty) | Trường rỗng | ITC-06-02: required validation | Zod reject |
| 13.5 | Password - 7 ký tự | API: `POST /api/auth/register` | `password`: `Short@7` | Min 8 không đạt | ITC-06-04: password too short | Zod reject |
| 13.6 | fullName - 1 ký tự | API: `POST /api/auth/register` | `fullName`: `X` | Min 2 không đạt | ITC-06-05: fullName too short | Zod reject |
| 13.7 | OTP - Sai (6 ký tự nhưng sai giá trị) | API: `POST /api/auth/otp/verify-email` | `code`: `000000` | Format đúng nhưng giá trị sai | ITC-06-09, ITC-08-04: wrong OTP | API reject |
| 13.8 | OTP - 5 ký tự | API: `POST /api/auth/otp/verify-email` | `code`: `12345` | Format sai | ITC-06-13: OTP format invalid | Zod reject |
| 13.9 | Interview score - Null | API: `POST /api/dashboard/interviews/[id]/score` | `technical_score=null` | Required field null | Validation fail | API/Zod reject |
| 13.10 | Application - Missing cv_file_url | API: `POST /api/jobs/[slug]/apply` | `cv_file_url=null` hoặc bỏ trống | Required field missing | ITC-02-11: apply không có CV | API/Zod reject |
| 13.11 | Job - Missing required fields | API: `POST /api/dashboard/jobs` | Body: `{}` (tất cả trống) | Thiếu title, description, employment_type | Validation reject tạo job | API/Zod reject |
| 13.12 | Token - Tampered JWT | API: `GET /api/auth/me` | Cookie với JWT payload bị sửa đổi | JWT signature invalid | ITC-10-11: tampered token | Server reject, 401 |
| 13.13 | Token - Expired JWT | API: `GET /api/auth/me` | JWT với `exp` trong quá khứ | `exp < now` | ITC-10-10: expired token | Server reject, 401 |

---

## Nhóm 14: API Endpoints — Danh Sách Endpoint Cần Test

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| **AUTH ENDPOINTS** | | | | | | |
| 14.1 | POST /api/auth/register | Bảng: `users`, `otp_tokens` | Body: `{fullName, email, password, phone?}` | Không cần auth | Đăng ký tài khoản mới | |
| 14.2 | POST /api/auth/login | Bảng: `users` | Body: `{email, password}` | Không cần auth | Đăng nhập, nhận JWT cookie | |
| 14.3 | POST /api/auth/logout | — | Không cần body | Cookie session bắt buộc | Xóa session cookie | |
| 14.4 | GET /api/auth/me | Bảng: `users` | Không cần body | Cookie session bắt buộc | Lấy thông tin user hiện tại | |
| 14.5 | POST /api/auth/otp/send | Bảng: `otp_tokens` | Body: `{email, type}` | Không cần auth | Gửi OTP email_verify hoặc password_reset | |
| 14.6 | POST /api/auth/otp/verify-email | Bảng: `users`, `otp_tokens` | Body: `{email, code}` | Không cần auth | Xác minh email bằng OTP | |
| 14.7 | POST /api/auth/otp/reset-password | Bảng: `users`, `otp_tokens` | Body: `{email, code, newPassword}` | Không cần auth | Đặt lại mật khẩu bằng OTP | |
| 14.8 | PATCH /api/auth/password | Bảng: `users` | Body: `{currentPassword, newPassword}` | Cookie session bắt buộc | Đổi mật khẩu khi đã đăng nhập | |
| **PUBLIC ENDPOINTS** | | | | | | |
| 14.9 | GET /api/jobs | Bảng: `jobs` | Query: `?page=1&limit=10&search=...` | Không cần auth | Lấy danh sách job public (active, chưa hết hạn) | |
| 14.10 | GET /api/jobs/[slug] | Bảng: `jobs` | Path: `slug` | Không cần auth | Xem chi tiết 1 job public | |
| 14.11 | POST /api/jobs/[slug]/apply | Bảng: `applications` | Body: `{cv_file_url, cover_letter?}` | Cookie session, role=candidate | Ứng viên nộp đơn | |
| **CANDIDATE ENDPOINTS** | | | | | | |
| 14.12 | GET /api/candidate/profile | Bảng: `candidate_profiles` | Không cần body | Cookie session, role=candidate | Lấy hồ sơ cá nhân | |
| 14.13 | PATCH /api/candidate/profile | Bảng: `candidate_profiles` | Body: `{title?, bio?, location?, ...}` | Cookie session, role=candidate | Cập nhật hồ sơ cá nhân | |
| 14.14 | GET /api/candidate/applications | Bảng: `applications` | Không cần body | Cookie session, role=candidate | Lấy danh sách đơn của candidate | |
| 14.15 | GET /api/candidate/interviews | Bảng: `interviews` | Không cần body | Cookie session, role=candidate | Lấy lịch phỏng vấn của candidate | |
| 14.16 | GET /api/candidate/files | Bảng: `files` | Không cần body | Cookie session, role=candidate | Lấy danh sách file đã upload | |
| 14.17 | POST /api/candidate/files | Bảng: `files`, Appwrite | Body: multipart/form-data với file | Cookie session, role=candidate | Upload file lên Appwrite | |
| 14.18 | DELETE /api/candidate/files/[id] | Bảng: `files`, Appwrite | Path: `id` | Cookie session, role=candidate, chỉ xóa file của mình | Xóa file | |
| **DASHBOARD ENDPOINTS** | | | | | | |
| 14.19 | GET /api/dashboard/applications | Bảng: `applications` | Query: `?status=&job_id=&page=&limit=` | Cookie session, role=hr/admin/interviewer | Lấy danh sách tất cả đơn | |
| 14.20 | POST /api/dashboard/applications | Bảng: `applications` | Body: tạo đơn từ dashboard | Cookie session, role=hr/admin | Tạo đơn từ phía HR (nếu có) | Kiểm tra nếu feature này tồn tại |
| 14.21 | GET /api/dashboard/applications/[id] | Bảng: `applications`, `application_status_history` | Path: `id` | Cookie session, role=hr/admin/interviewer | Xem chi tiết đơn + history | |
| 14.22 | POST /api/dashboard/applications/[id]/status | Bảng: `applications`, `application_status_history` | Body: `{to_status, note}` | Cookie session, role=hr/admin | Thay đổi trạng thái đơn | |
| 14.23 | POST /api/dashboard/applications/[id]/email | Bảng: `email_logs` | Body: `{type}` | Cookie session, role=hr/admin | Gửi email cho candidate | |
| 14.24 | GET /api/dashboard/applications/[id]/emails | Bảng: `email_logs` | Path: `id` | Cookie session, role=hr/admin | Xem lịch sử email của đơn | |
| 14.25 | GET /api/dashboard/applications/[id]/interviews | Bảng: `interviews` | Path: `id` | Cookie session, role=hr/admin/interviewer | Xem lịch phỏng vấn của đơn | |
| 14.26 | GET /api/dashboard/interviews | Bảng: `interviews` | Query: filter params | Cookie session, role=hr/admin/interviewer | Lấy danh sách phỏng vấn | |
| 14.27 | POST /api/dashboard/interviews | Bảng: `interviews`, `email_logs` | Body: `{application_id, interviewer_id, scheduled_at, ...}` | Cookie session, role=hr/admin | Tạo lịch phỏng vấn | |
| 14.28 | GET /api/dashboard/interviews/[id] | Bảng: `interviews`, `interview_scores` | Path: `id` | Cookie session, role=hr/admin/interviewer | Xem chi tiết phỏng vấn + score | |
| 14.29 | PATCH /api/dashboard/interviews/[id] | Bảng: `interviews` | Body: `{scheduled_at?, status?, ...}` | Cookie session, role=hr/admin | Cập nhật lịch phỏng vấn | |
| 14.30 | POST /api/dashboard/interviews/[id]/score | Bảng: `interview_scores` | Body: `{technical_score, communication_score, ...}` | Cookie session, role=hr/admin/interviewer | Submit scorecard | |
| 14.31 | GET /api/dashboard/interviews/metadata | Bảng: `users` (interviewers) | Không cần body | Cookie session, role=hr/admin | Lấy danh sách interviewer + types | ITC-03-12 |
| 14.32 | GET /api/dashboard/jobs | Bảng: `jobs` | Query: `?status=&page=&limit=` | Cookie session, role=hr/admin/interviewer | Lấy danh sách job (bao gồm draft, closed) | |
| 14.33 | POST /api/dashboard/jobs | Bảng: `jobs` | Body: `{title, description, employment_type, headcount, expires_at}` | Cookie session, role=hr/admin | Tạo job mới | |
| 14.34 | GET /api/dashboard/jobs/[id] | Bảng: `jobs` | Path: `id` | Cookie session, role=hr/admin/interviewer | Xem chi tiết job | |
| 14.35 | PATCH /api/dashboard/jobs/[id] | Bảng: `jobs` | Body: `{title?, description?, status?, ...}` | Cookie session, role=hr/admin | Cập nhật job | |
| 14.36 | GET /api/dashboard/jobs/[id]/channels | Bảng: `job_channels` | Path: `id` | Cookie session, role=hr/admin | Xem kênh đăng tuyển của job | |
| 14.37 | POST /api/dashboard/jobs/[id]/channels | Bảng: `job_channels` | Body: `{channel, status?}` | Cookie session, role=hr/admin | Thêm kênh đăng tuyển mới | |

---

## Nhóm 15: Environment & Configuration — Cấu Hình Môi Trường Test

| No | Nhóm dữ liệu | Bảng/API/Module liên quan | Dữ liệu cần chuẩn bị | Điều kiện dữ liệu | Mục đích sử dụng | Ghi chú |
|----|-------------|--------------------------|----------------------|-------------------|-----------------|---------|
| 15.1 | Database seed script | Tất cả bảng | SQL/Prisma seed script tạo tất cả dữ liệu nhóm 1-14 | DB phải sạch trước khi seed | Setup trước khi bắt đầu test suite | Tạo file `seed-ite.sql` hoặc `seed.ts` |
| 15.2 | Base URL | — | `BASE_URL=http://localhost:3000` (local)<br>Hoặc staging URL | Server đang chạy | Cấu hình cho tất cả API requests | |
| 15.3 | Auth headers | — | Mỗi test case cần set cookie: `Cookie: session=<jwt_token>` | JWT token hợp lệ cho từng role | Dùng trong API request manual testing | Lấy token bằng cách login trước |
| 15.4 | Resend Email (test mode) | `email_logs` | Cấu hình Resend API key test hoặc mock | Email không gửi thực, chỉ log | Kiểm tra email logs mà không spam inbox | Dùng Resend test API key |
| 15.5 | Appwrite (test bucket) | `files` | Cấu hình Appwrite test bucket | Bucket riêng cho test, không ảnh hưởng production | Upload file test | Xóa files sau khi test |
| 15.6 | Cleanup script | Tất cả bảng | Script xóa dữ liệu test sau khi chạy xong | Chạy sau mỗi test session | Giữ DB sạch | Tránh ảnh hưởng test lần sau |

---

## Tóm Tắt Số Lượng Dữ Liệu Cần Chuẩn Bị

| Nhóm | Tên | Số records/items | Ưu tiên |
|------|-----|-----------------|---------|
| 1 | User Accounts | 7 users | Bắt buộc |
| 2 | OTP Data | 8 items (5 DB records + 3 input test) | Bắt buộc |
| 3 | Jobs | 7 jobs | Bắt buộc |
| 4 | Applications | 8 records | Bắt buộc |
| 5 | Status History | 2 sets (7 records) | Bắt buộc |
| 6 | Email Logs | 5 records | Khuyến nghị |
| 7 | Interviews | 6 records | Bắt buộc |
| 8 | Interview Scores | 6 items (2 DB records + 4 input test) | Bắt buộc |
| 9 | Candidate Profiles | 3 records | Khuyến nghị |
| 10 | Files | 5 DB records + 3 physical files | Bắt buộc |
| 11 | Job Channels | 5 records | Khuyến nghị |
| 12 | Boundary Data | 14 test inputs | Bắt buộc |
| 13 | Invalid Data | 13 test inputs | Bắt buộc |
| 14 | API Endpoints | 37 endpoints | Tham chiếu |
| 15 | Environment Config | 6 items | Bắt buộc |

---

*Tổng số: ~100+ data items cần chuẩn bị*  
*Cập nhật: 2026-05-17 — QA Team*
