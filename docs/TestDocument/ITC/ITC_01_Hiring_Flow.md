# ITC - Integration Test Case
# ITC_01 - Luồng Tuyển Dụng, Ứng Tuyển & Phỏng Vấn

> **Hệ thống:** ATS (Applicant Tracking System)  
> **Phạm vi:** Luồng tuyển dụng đầy đủ (E2E), Luồng ứng viên nộp đơn, Luồng phỏng vấn, Luồng quản lý job  
> **Người tạo:** QA Team  
> **Ngày tạo:** 2026-05-17  
> **Tham chiếu:** Detail Design Module C, E, F, G

---

## Scenario ITC-01: E2E Full Hiring Flow - Luồng Tuyển Dụng Đầy Đủ (Happy Path)

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-01 |
| **Giải thích scenario** | Kiểm tra toàn bộ luồng tuyển dụng từ đầu đến cuối: HR tạo job → Ứng viên nộp đơn → HR xét duyệt → Lên lịch phỏng vấn → Chấm điểm → Quyết định tuyển dụng |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 15 |
| **Số bug** | |
| **Luồng chính** | HR (hr@test.ats) đăng nhập → Tạo job mới → Chuyển trạng thái active → Candidate (candidate@test.ats) đăng nhập → Nộp đơn → HR chuyển trạng thái đơn → HR tạo lịch phỏng vấn → Interviewer chấm điểm → HR quyết định hired |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | LOGIN | ITC-01-01 | **[Điều kiện]** Hệ thống đang chạy, DB đã seed dữ liệu HR account. **[Thao tác]** HR truy cập `/(auth)/login`, nhập email + password, nhấn "Đăng nhập" | email=`hr@test.ats`, password=`Test@1234` | HR được redirect đến `/dashboard`. Cookie `session` httpOnly được set. | Kiểm tra URL = `/dashboard`. Kiểm tra response header `Set-Cookie` có `session`. Network tab: POST `/api/auth/login` → 200. | | | | Module B - Sheet 07 |
| 2 | DASHBOARD / JOBS | ITC-01-02 | **[Điều kiện]** HR đã đăng nhập, ở màn hình `/dashboard`. **[Thao tác]** HR điều hướng đến trang quản lý job `/dashboard/jobs`, nhấn nút "Tạo job mới" | — | Hiển thị form tạo job với các trường: title, description, employment_type, headcount, expires_at | Kiểm tra form render đúng. GET `/api/dashboard/jobs` → 200. | | | | Module G - Sheet 05 |
| 3 | DASHBOARD / JOBS / CREATE | ITC-01-03 | **[Điều kiện]** Form tạo job đang mở. **[Thao tác]** HR điền đầy đủ thông tin job và nhấn "Lưu nháp" | title=`Senior Frontend Developer`, description=`Mô tả chi tiết...`, employment_type=`full_time`, headcount=`2`, expires_at=`2026-08-31`, status=`draft` | Job được tạo thành công với status=`draft`. Hiển thị toast "Tạo job thành công". Redirect về danh sách jobs. | DB: `jobs` table có record mới với status=`draft`. POST `/api/dashboard/jobs` → 201. Job xuất hiện trong danh sách. | | | | Module G - Sheet 07 |
| 4 | DASHBOARD / JOBS / [ID] | ITC-01-04 | **[Điều kiện]** Job vừa tạo ở trạng thái `draft`. **[Thao tác]** HR mở job detail, đổi status từ `draft` → `active`, nhấn "Lưu" | job_id=`<id vừa tạo>`, status=`active` | Job chuyển sang status=`active`. Toast "Cập nhật thành công". Job xuất hiện trên trang public `/jobs`. | DB: `jobs.status = 'active'`. PATCH `/api/dashboard/jobs/[id]` → 200. GET `/api/jobs` public trả về job này. | | | | Module G - Sheet 07 |
| 5 | PUBLIC / JOBS | ITC-01-05 | **[Điều kiện]** Job đã active. **[Thao tác]** Logout HR. Candidate (chưa đăng nhập) truy cập `/jobs`, tìm kiếm job vừa tạo | Truy cập public, không có session cookie | Danh sách job hiển thị job `Senior Frontend Developer`. Có thể xem chi tiết job. | GET `/api/jobs` → 200, response chứa job mới. Trang `/jobs` render job card. | | | | Module A - Sheet 07 |
| 6 | PUBLIC / JOBS / [SLUG] | ITC-01-06 | **[Điều kiện]** Candidate chưa đăng nhập, đang xem danh sách jobs. **[Thao tác]** Click vào job `Senior Frontend Developer`, xem trang chi tiết | slug=`senior-frontend-developer` | Trang chi tiết job hiển thị đúng title, mô tả, employment_type, headcount. Nút "Ứng tuyển" hiển thị. | GET `/api/jobs/[slug]` → 200. Trang render đầy đủ thông tin job. | | | | Module A - Sheet 07 |
| 7 | AUTH / LOGIN | ITC-01-07 | **[Điều kiện]** Candidate chưa đăng nhập, nhấn "Ứng tuyển" → bị redirect đến login hoặc chủ động login. **[Thao tác]** Đăng nhập bằng candidate account | email=`candidate@test.ats`, password=`Test@1234` | Candidate đăng nhập thành công, redirect đến `/candidate`. Cookie session set với role=`candidate`. | POST `/api/auth/login` → 200. URL = `/candidate`. | | | | Module B - Sheet 07 |
| 8 | CANDIDATE / APPLY | ITC-01-08 | **[Điều kiện]** Candidate đã đăng nhập, có CV file trong hệ thống. **[Thao tác]** Candidate quay lại trang job detail, nhấn "Ứng tuyển", chọn CV, nhập cover letter, submit | job_slug=`senior-frontend-developer`, cv_file_url=`<url cv đã upload>`, cover_letter=`Tôi rất muốn ứng tuyển vị trí này...` | Đơn ứng tuyển tạo thành công với status=`applied`. Toast "Nộp đơn thành công". | DB: `applications` có record mới, status=`applied`. POST `/api/jobs/[slug]/apply` → 201. Candidate xem được đơn ở `/candidate/applications`. | | | | Module C, E - Sheet 07 |
| 9 | CANDIDATE / APPLICATIONS | ITC-01-09 | **[Điều kiện]** Candidate đã nộp đơn. **[Thao tác]** Candidate vào `/candidate/applications`, kiểm tra đơn vừa nộp | — | Đơn hiển thị với status=`applied`, tên job đúng, ngày nộp đúng. | GET `/api/candidate/applications` → 200. Đơn hiển thị trong danh sách. | | | | Module C - Sheet 07 |
| 10 | DASHBOARD / APPLICATIONS | ITC-01-10 | **[Điều kiện]** Logout candidate. Đăng nhập lại bằng HR. **[Thao tác]** HR vào `/dashboard/applications`, tìm đơn của candidate vừa nộp | HR đã đăng nhập | Danh sách đơn hiển thị đơn của `candidate@test.ats` với status=`applied` cho job `Senior Frontend Developer`. | GET `/api/dashboard/applications` → 200. Đơn xuất hiện trong danh sách. | | | | Module E - Sheet 07 |
| 11 | DASHBOARD / APPLICATIONS / [ID] | ITC-01-11 | **[Điều kiện]** HR đang xem danh sách đơn. **[Thao tác]** HR mở đơn ứng tuyển, đổi status → `screening`, nhập ghi chú, lưu | application_id=`<id>`, to_status=`screening`, note=`CV ổn, tiến hành screening` | Status đơn cập nhật thành `screening`. `application_status_history` có bản ghi mới. Email thông báo gửi đến candidate (nếu cấu hình). | DB: `applications.status = 'screening'`. `application_status_history` thêm record. POST `/api/dashboard/applications/[id]/status` → 200. | | | | Module E - Sheet 07 |
| 12 | DASHBOARD / APPLICATIONS / [ID] | ITC-01-12 | **[Điều kiện]** Đơn đang ở status=`screening`. **[Thao tác]** HR chuyển trạng thái → `interviewing` | to_status=`interviewing`, note=`Đủ điều kiện, xếp lịch phỏng vấn` | Status đổi thành `interviewing`. History ghi nhận đủ. | DB: `applications.status = 'interviewing'`. Lịch sử có 2 bản ghi thay đổi. | | | | Module E - Sheet 07 |
| 13 | DASHBOARD / INTERVIEWS / CREATE | ITC-01-13 | **[Điều kiện]** Đơn ở `interviewing`. **[Thao tác]** HR tạo lịch phỏng vấn: chọn đơn, chọn interviewer, điền thời gian, loại, link meeting | application_id=`<id>`, interviewer_id=`interviewer@test.ats`, scheduled_at=`2026-06-01T09:00:00`, duration_minutes=`60`, type=`video`, meeting_link=`https://meet.google.com/xxx` | Lịch phỏng vấn được tạo với status=`scheduled`. Email mời phỏng vấn gửi đến interviewer và candidate. | DB: `interviews` có record mới, status=`scheduled`. POST `/api/dashboard/interviews` → 201. `email_logs` có bản ghi type=`invite`. | | | | Module F - Sheet 07 |
| 14 | DASHBOARD / INTERVIEWS / [ID] / SCORE | ITC-01-14 | **[Điều kiện]** Logout HR. Đăng nhập Interviewer. Lịch phỏng vấn đã được tạo. **[Thao tác]** Interviewer xem lịch PV, submit scorecard sau khi phỏng vấn xong | interviewer đăng nhập, interview_id=`<id>`, technical_score=`8`, communication_score=`7`, cultural_fit_score=`8`, overall_score=`8`, result=`pass`, is_final=`true` | Scorecard lưu thành công. Interview status cập nhật thành `completed`. | DB: `interview_scores` có record mới. `interviews.status = 'completed'`. POST `/api/dashboard/interviews/[id]/score` → 201. | | | | Module F - Sheet 07 |
| 15 | DASHBOARD / APPLICATIONS / [ID] | ITC-01-15 | **[Điều kiện]** Logout Interviewer. Đăng nhập HR. **[Thao tác]** HR xem scorecard, quyết định chuyển trạng thái đơn → `offered` → `hired` | to_status=`offered`, note=`Pass phỏng vấn, gửi offer`; sau đó to_status=`hired` | Đơn chuyển qua `offered` rồi `hired`. Email offer gửi candidate. Lịch sử đầy đủ. | DB: `applications.status = 'hired'`. History có đủ các bước: applied→screening→interviewing→offered→hired. `email_logs` có type=`offer`. | | | | Module E, F - Sheet 07 |

---

## Scenario ITC-02: Candidate Application Flow - Luồng Ứng Viên Nộp Đơn

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-02 |
| **Giải thích scenario** | Kiểm tra toàn bộ luồng từ phía ứng viên: duyệt job công khai → đăng nhập → upload CV → nộp đơn → xem trạng thái. Bao gồm các trường hợp lỗi: ứng tuyển trùng, job đã đóng, thiếu CV |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 13 |
| **Số bug** | |
| **Luồng chính** | Guest xem jobs → Click vào job active → Login candidate → Upload CV → Nộp đơn → Xem dashboard đơn ứng tuyển → Kiểm tra trạng thái |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | PUBLIC / JOBS | ITC-02-01 | **[Điều kiện]** Guest (không có session). Có ít nhất 1 job active trong DB. **[Thao tác]** Truy cập `/jobs` | Không có cookie session | Danh sách job active hiển thị. Không yêu cầu đăng nhập để xem. | GET `/api/jobs` → 200. Trang render danh sách job. Không có redirect đến login. | | | | Module A |
| 2 | PUBLIC / JOBS | ITC-02-02 | **[Điều kiện]** Guest đang xem danh sách job. **[Thao tác]** Kiểm tra job có status=`closed` và status=`draft` có hiển thị không | DB có job draft, closed, active | Chỉ job status=`active` (và chưa hết hạn) hiển thị trên trang public | GET `/api/jobs` → response chỉ chứa active jobs. Draft/closed không xuất hiện. | | | | Module A, G |
| 3 | PUBLIC / JOBS / [SLUG] | ITC-02-03 | **[Điều kiện]** Guest xem chi tiết job active. **[Thao tác]** Click vào job, xem trang chi tiết | slug=`<job active slug>` | Hiển thị đầy đủ: title, description, employment_type, headcount. Nút "Ứng tuyển ngay" hiển thị. | GET `/api/jobs/[slug]` → 200. Trang render đầy đủ. | | | | Module A |
| 4 | PUBLIC / JOBS / [SLUG] | ITC-02-04 | **[Điều kiện]** Guest truy cập URL của job đã closed. **[Thao tác]** Truy cập `/jobs/closed-job-slug` | slug=`closed-job-slug` (job status=`closed` trong DB) | Trả về 404 hoặc thông báo "Job không còn tuyển dụng". Không cho phép apply. | GET `/api/jobs/[slug]` → 404 hoặc response với thông báo lỗi phù hợp. | | | | Module A |
| 5 | AUTH / LOGIN | ITC-02-05 | **[Điều kiện]** Guest nhấn "Ứng tuyển" khi chưa đăng nhập. **[Thao tác]** Hệ thống redirect hoặc candidate chủ động login | email=`candidate@test.ats`, password=`Test@1234` | Sau đăng nhập redirect về trang job hoặc `/candidate`. Session được thiết lập. | POST `/api/auth/login` → 200. Cookie session set. | | | | Module B |
| 6 | CANDIDATE / FILES | ITC-02-06 | **[Điều kiện]** Candidate đã đăng nhập, chưa có CV. **[Thao tác]** Candidate vào `/candidate/files`, upload file CV | file=`cv_test.pdf` (PDF, < 5MB), file_type=`cv` | File upload thành công lên Appwrite. Bản ghi trong `files` table được tạo. CV hiển thị trong danh sách. | POST `/api/candidate/files` → 201. DB: `files` có record với file_type=`cv`. File URL hợp lệ. | | | | Module C |
| 7 | CANDIDATE / APPLY | ITC-02-07 | **[Điều kiện]** Candidate đã đăng nhập, đã có CV. **[Thao tác]** Candidate nộp đơn vào job active | job_slug=`<active job>`, cv_file_url=`<url cv>`, cover_letter=`Tôi ứng tuyển vị trí này...` | Đơn nộp thành công. status=`applied`. Toast thành công. | POST `/api/jobs/[slug]/apply` → 201. DB: `applications` có record. | | | | Module C, E |
| 8 | CANDIDATE / APPLY (Duplicate) | ITC-02-08 | **[Điều kiện]** Candidate đã nộp đơn vào job. **[Thao tác]** Candidate cố tình nộp đơn vào cùng job lần 2 | Cùng job_id + candidate_id đã tồn tại trong `applications` | Hệ thống trả về lỗi "Bạn đã nộp đơn cho vị trí này rồi". Không tạo bản ghi mới. | POST `/api/jobs/[slug]/apply` → 409 Conflict. DB: không có record trùng. Unique constraint `(job_id, candidate_id)` hoạt động đúng. | | | | Module C, E |
| 9 | CANDIDATE / APPLY (Closed Job) | ITC-02-09 | **[Điều kiện]** Candidate đã đăng nhập. **[Thao tác]** Cố tình gửi POST request apply vào job có status=`closed` | job_id=`<closed job id>` | API từ chối với lỗi "Job không còn nhận đơn". status 400 hoặc 422. | POST `/api/jobs/[slug]/apply` với closed job → 400/422. DB không có record mới. | | | | Module C, E |
| 10 | CANDIDATE / APPLICATIONS | ITC-02-10 | **[Điều kiện]** Candidate đã nộp ít nhất 1 đơn. **[Thao tác]** Candidate vào `/candidate/applications` | — | Hiển thị danh sách đơn với tên job, trạng thái, ngày nộp. Không hiển thị đơn của người khác. | GET `/api/candidate/applications` → 200. Response chỉ chứa đơn của candidate đang đăng nhập. | | | | Module C |
| 11 | CANDIDATE / APPLICATIONS (Apply no CV) | ITC-02-11 | **[Điều kiện]** Candidate đã đăng nhập nhưng chưa upload CV. **[Thao tác]** Thử nộp đơn không có CV | job_slug=`<active>`, cv_file_url=`null` hoặc bỏ trống | Form validation báo lỗi "CV là bắt buộc". Không submit được. | Client-side validation hiển thị lỗi trước khi gọi API. Hoặc API → 400 "CV is required". | | | | Module C |
| 12 | CANDIDATE / APPLICATIONS (Unauthorized) | ITC-02-12 | **[Điều kiện]** Không có session (guest). **[Thao tác]** Gửi POST request trực tiếp đến `/api/candidate/applications` | Không có cookie session | API trả về 401 Unauthorized. Không trả về dữ liệu. | GET `/api/candidate/applications` (no cookie) → 401. | | | | Module C |
| 13 | CANDIDATE / FILES (Delete) | ITC-02-13 | **[Điều kiện]** Candidate đã đăng nhập, có file CV. **[Thao tác]** Candidate xóa file CV | file_id=`<id của file>` | File bị xóa khỏi Appwrite và DB. Danh sách file cập nhật. Nếu file đang được dùng trong đơn, hiển thị cảnh báo. | DELETE `/api/candidate/files/[id]` → 200. DB: `files` record bị xóa hoặc đánh dấu. Appwrite file bị xóa. | | | | Module C |

---

## Scenario ITC-03: Interview Management Flow - Luồng Quản Lý Phỏng Vấn

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-03 |
| **Giải thích scenario** | Kiểm tra luồng tạo, quản lý và chấm điểm phỏng vấn: HR tạo lịch → Email thông báo → Interviewer xem lịch → Interviewer chấm điểm → HR xem kết quả → Hủy/rescheduled phỏng vấn |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 12 |
| **Số bug** | |
| **Luồng chính** | HR tạo lịch phỏng vấn → Interviewer nhận email mời → Interviewer đăng nhập xem lịch → Phỏng vấn diễn ra → Interviewer submit scorecard → HR xem scorecard → HR quyết định |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | DASHBOARD / INTERVIEWS | ITC-03-01 | **[Điều kiện]** HR đã đăng nhập. Có đơn với status=`interviewing`. **[Thao tác]** HR vào trang tạo phỏng vấn, điền thông tin | application_id=`<id đơn interviewing>`, interviewer_id=`<id interviewer>`, scheduled_at=`2026-06-15T10:00:00`, duration_minutes=`60`, type=`video`, meeting_link=`https://meet.google.com/abc123` | Phỏng vấn được tạo với status=`scheduled`. Email invite gửi đi. | POST `/api/dashboard/interviews` → 201. DB: `interviews` có record mới. `email_logs` có record type=`invite`, status=`sent`. | | | | Module F |
| 2 | DASHBOARD / INTERVIEWS | ITC-03-02 | **[Điều kiện]** HR đã tạo phỏng vấn. **[Thao tác]** HR xem danh sách phỏng vấn, lọc theo ngày | — | Danh sách phỏng vấn hiển thị đúng. Phỏng vấn vừa tạo xuất hiện với thông tin đầy đủ. | GET `/api/dashboard/interviews` → 200. Interview vừa tạo có trong danh sách. | | | | Module F |
| 3 | CANDIDATE / INTERVIEWS | ITC-03-03 | **[Điều kiện]** Logout HR. Đăng nhập Candidate. **[Thao tác]** Candidate xem lịch phỏng vấn của mình | — | Candidate thấy lịch phỏng vấn sắp tới với thông tin: ngày giờ, type, meeting_link. | GET `/api/candidate/interviews` → 200. Chỉ trả về phỏng vấn của candidate này. | | | | Module C |
| 4 | DASHBOARD / INTERVIEWS (Interviewer) | ITC-03-04 | **[Điều kiện]** Logout Candidate. Đăng nhập Interviewer. **[Thao tác]** Interviewer xem danh sách phỏng vấn được giao | — | Interviewer thấy lịch phỏng vấn với status=`scheduled`. Thông tin ứng viên và job hiển thị. | GET `/api/dashboard/interviews` (filtered by interviewer) → 200. Chỉ trả về PV của interviewer này. | | | | Module F |
| 5 | DASHBOARD / INTERVIEWS / [ID] / SCORE | ITC-03-05 | **[Điều kiện]** Interviewer đã xem chi tiết phỏng vấn. **[Thao tác]** Interviewer submit scorecard với điểm đầy đủ | interview_id=`<id>`, technical_score=`9`, communication_score=`8`, cultural_fit_score=`7`, overall_score=`8`, result=`pass`, is_final=`true` | Scorecard lưu thành công. Interview status → `completed`. | POST `/api/dashboard/interviews/[id]/score` → 201. DB: `interview_scores` có record. `interviews.status = 'completed'`. | | | | Module F |
| 6 | DASHBOARD / INTERVIEWS / [ID] / SCORE (Duplicate) | ITC-03-06 | **[Điều kiện]** Interviewer đã submit scorecard. **[Thao tác]** Interviewer cố tình submit scorecard lần 2 cho cùng phỏng vấn | Cùng interview_id + evaluator_id đã tồn tại | Hệ thống trả về lỗi. Unique constraint `(interview_id, evaluator_id)` ngăn chặn. | POST `/api/dashboard/interviews/[id]/score` → 409 Conflict. DB không có record trùng. | | | | Module F |
| 7 | DASHBOARD / INTERVIEWS / [ID] / SCORE (Invalid) | ITC-03-07 | **[Điều kiện]** Interviewer đang chấm điểm. **[Thao tác]** Submit scorecard với điểm ngoài range 1-10 | technical_score=`11`, overall_score=`0` | Validation lỗi, không lưu được. Thông báo "Điểm phải trong khoảng 1-10". | POST `/api/dashboard/interviews/[id]/score` → 400. Zod validation báo lỗi. | | | | Module F |
| 8 | DASHBOARD / INTERVIEWS / [ID] (HR - View Score) | ITC-03-08 | **[Điều kiện]** Logout Interviewer. Đăng nhập HR. **[Thao tác]** HR xem chi tiết phỏng vấn, xem scorecard | interview_id=`<id đã có score>` | HR thấy scorecard với điểm từng hạng mục, kết quả pass/fail. | GET `/api/dashboard/interviews/[id]` → 200. Response chứa score data. | | | | Module F |
| 9 | DASHBOARD / INTERVIEWS / [ID] (Reschedule) | ITC-03-09 | **[Điều kiện]** HR xem phỏng vấn status=`scheduled`. **[Thao tác]** HR cập nhật lịch phỏng vấn sang ngày khác | interview_id=`<id>`, scheduled_at=`2026-06-20T14:00:00`, status=`rescheduled` | Phỏng vấn cập nhật thành công. Status → `rescheduled`. Email thông báo rescheduled gửi đi. | PATCH `/api/dashboard/interviews/[id]` → 200. DB: scheduled_at cập nhật, status=`rescheduled`. `email_logs` thêm record. | | | | Module F |
| 10 | DASHBOARD / INTERVIEWS / [ID] (Cancel) | ITC-03-10 | **[Điều kiện]** Phỏng vấn status=`scheduled`. **[Thao tác]** HR hủy phỏng vấn | interview_id=`<id>`, status=`cancelled` | Phỏng vấn chuyển status=`cancelled`. Email thông báo hủy gửi đến interviewer và candidate. | PATCH `/api/dashboard/interviews/[id]` → 200. DB: status=`cancelled`. `email_logs` thêm record. | | | | Module F |
| 11 | DASHBOARD / INTERVIEWS / [ID] / SCORE (Candidate - Unauthorized) | ITC-03-11 | **[Điều kiện]** Đăng nhập bằng Candidate account. **[Thao tác]** Candidate cố tình gọi API submit scorecard | Candidate session, interview_id=`<id>` | API từ chối với 403 Forbidden. Candidate không có quyền chấm điểm. | POST `/api/dashboard/interviews/[id]/score` với candidate session → 403. | | | | Module F |
| 12 | DASHBOARD / INTERVIEWS (metadata) | ITC-03-12 | **[Điều kiện]** HR đã đăng nhập. **[Thao tác]** HR lấy metadata (danh sách interviewer, loại phỏng vấn) để tạo form | — | Response trả về danh sách interviewer active, các loại type phỏng vấn. | GET `/api/dashboard/interviews/metadata` → 200. Response có `interviewers` array, `types` array. | | | | Module F |

---

## Scenario ITC-04: Job Management Flow - Luồng Quản Lý Công Việc (HR)

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-04 |
| **Giải thích scenario** | Kiểm tra toàn bộ vòng đời quản lý job: tạo draft → chỉnh sửa → active → đăng kênh → theo dõi ứng viên → đóng job. Bao gồm các trường hợp validation lỗi và permission. |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 12 |
| **Số bug** | |
| **Luồng chính** | HR tạo job draft → Chỉnh sửa → Active → Đăng lên kênh LinkedIn/TopCV → Xem số lượng ứng viên → Close job → Archive |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | DASHBOARD / JOBS / CREATE (Validation) | ITC-04-01 | **[Điều kiện]** HR đã đăng nhập. **[Thao tác]** HR mở form tạo job, submit form với title trùng với job đã tồn tại | title=`<title đã có trong DB>` (UNIQUE constraint) | Lỗi "Tiêu đề job đã tồn tại". Không tạo bản ghi mới. | POST `/api/dashboard/jobs` → 409 Conflict. DB unique constraint trên `jobs.title` và `jobs.slug`. | | | | Module G |
| 2 | DASHBOARD / JOBS / CREATE (Success) | ITC-04-02 | **[Điều kiện]** HR đã đăng nhập. **[Thao tác]** Tạo job mới với title hợp lệ, status=`draft` | title=`Backend Java Developer`, description=`...`, employment_type=`full_time`, headcount=`3`, expires_at=`2026-09-30` | Job tạo thành công. Tự động tạo slug từ title. Status=`draft`. Không hiện trên public. | POST `/api/dashboard/jobs` → 201. DB: `jobs.slug = 'backend-java-developer'`. GET `/api/jobs` public không có job này. | | | | Module G |
| 3 | DASHBOARD / JOBS / [ID] (Edit) | ITC-04-03 | **[Điều kiện]** Job status=`draft`. **[Thao tác]** HR chỉnh sửa description và headcount | job_id=`<id>`, description=`Mô tả cập nhật...`, headcount=`5` | Cập nhật thành công. Toast "Lưu thành công". Dữ liệu mới hiển thị. | PATCH `/api/dashboard/jobs/[id]` → 200. DB: `jobs.headcount = 5`. | | | | Module G |
| 4 | DASHBOARD / JOBS / [ID] (Activate) | ITC-04-04 | **[Điều kiện]** Job status=`draft`. **[Thao tác]** HR chuyển status → `active` | status=`active` | Job active. Hiển thị trên trang public `/jobs`. Slug được dùng để truy cập. | PATCH `/api/dashboard/jobs/[id]` → 200. DB: `status = 'active'`. GET `/api/jobs` public trả về job này. | | | | Module G |
| 5 | DASHBOARD / JOBS / [ID] / CHANNELS | ITC-04-05 | **[Điều kiện]** Job đã active. **[Thao tác]** HR thêm kênh đăng tuyển LinkedIn | job_id=`<id>`, channel=`linkedin`, status=`pending` | Kênh được thêm với status=`pending`. Hiển thị trong danh sách kênh của job. | POST `/api/dashboard/jobs/[id]/channels` → 201. DB: `job_channels` có record `channel=linkedin, status=pending`. | | | | Module G |
| 6 | DASHBOARD / JOBS / [ID] / CHANNELS (Duplicate) | ITC-04-06 | **[Điều kiện]** Đã có kênh LinkedIn cho job. **[Thao tác]** HR cố thêm kênh LinkedIn lần 2 | Cùng job_id + channel=`linkedin` | Lỗi "Kênh đã được thêm". Không tạo bản ghi trùng. | POST `/api/dashboard/jobs/[id]/channels` → 409. DB unique constraint `(job_id, channel)` hoạt động đúng. | | | | Module G |
| 7 | DASHBOARD / JOBS / [ID] / CHANNELS | ITC-04-07 | **[Điều kiện]** Job đã có kênh. **[Thao tác]** HR xem danh sách kênh, cập nhật status kênh TopCV → `posted` | channel=`topcv`, status=`posted` | Status kênh cập nhật thành `posted`. Hiển thị đúng trên UI. | GET `/api/dashboard/jobs/[id]/channels` → 200. Kênh có status=`posted`. | | | | Module G |
| 8 | DASHBOARD / JOBS / [ID] (Close) | ITC-04-08 | **[Điều kiện]** Job active, có ứng viên đang apply. **[Thao tác]** HR đóng job bằng cách chuyển status → `closed` | status=`closed` | Job đóng thành công. Không hiển thị trên public. Các đơn hiện tại vẫn giữ nguyên trạng thái. | PATCH `/api/dashboard/jobs/[id]` → 200. DB: `status = 'closed'`. GET `/api/jobs` public không còn job này. Các `applications` không bị ảnh hưởng. | | | | Module G |
| 9 | DASHBOARD / JOBS / [ID] (Edit Closed) | ITC-04-09 | **[Điều kiện]** Job status=`closed`. **[Thao tác]** HR cố gắng chuyển trạng thái job closed → active lại | status=`active` | Nếu logic không cho phép reactivate, trả về lỗi. Nếu cho phép, job active lại và xuất hiện public. | Kiểm tra business rule. PATCH → 200 hoặc 400 tùy quy định. | | | | Module G |
| 10 | DASHBOARD / JOBS (Candidate Role - Unauthorized) | ITC-04-10 | **[Điều kiện]** Đăng nhập bằng candidate account. **[Thao tác]** Candidate cố gọi API tạo job | POST `/api/dashboard/jobs` với candidate session | 401 hoặc 403. Candidate không có quyền tạo job. | POST `/api/dashboard/jobs` → 401/403. | | | | Module G |
| 11 | DASHBOARD / JOBS (Expired Job) | ITC-04-11 | **[Điều kiện]** HR đăng nhập. DB có job với `expires_at` trong quá khứ. **[Thao tác]** HR xem job đã hết hạn | job có `expires_at < now()` | Job hết hạn không hiển thị trên public (hoặc hiển thị với badge "Hết hạn"). Không nhận đơn mới. | GET `/api/jobs` không trả về job hết hạn. Hoặc có status expired. | | | | Module G, A |
| 12 | DASHBOARD / JOBS / [ID] (Archive) | ITC-04-12 | **[Điều kiện]** Job đang ở status=`closed`. **[Thao tác]** HR chuyển job sang `archived` | status=`archived` | Job archive thành công. Không hiển thị trong danh sách jobs thường. Chỉ hiển thị khi filter archived. | PATCH `/api/dashboard/jobs/[id]` → 200. DB: `status = 'archived'`. Danh sách default không hiển thị. | | | | Module G |

---

## Scenario ITC-05: Application Status Flow - Luồng Chuyển Trạng Thái Đơn & Email

| Thông tin | Nội dung |
|-----------|----------|
| **Scenario ID** | ITC-05 |
| **Giải thích scenario** | Kiểm tra luồng chuyển trạng thái đơn ứng tuyển: applied→screening→interviewing→offered→hired và rejected. Kiểm tra email log, history. |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Số test case** | 11 |
| **Số bug** | |
| **Luồng chính** | HR xem đơn → Chuyển status từng bước → Kiểm tra email được gửi → Kiểm tra history đầy đủ → Kiểm tra rejected flow |

| Step | Màn hình ID | No | Điều kiện test / Step thao tác | Data / Điều kiện đầu vào | Kết quả mong muốn | Cách xác nhận | Kết quả test lần 1 | Kết quả test lần 2 | Kết quả test lần 3 | Tài liệu tham khảo |
|------|------------|-----|-------------------------------|--------------------------|-------------------|---------------|-------------------|-------------------|-------------------|--------------------|
| 1 | DASHBOARD / APPLICATIONS | ITC-05-01 | **[Điều kiện]** HR đã đăng nhập. Có nhiều đơn với các trạng thái khác nhau. **[Thao tác]** HR xem danh sách đơn, lọc theo status=`applied` | filter: status=`applied` | Chỉ hiển thị đơn với status=`applied`. Filter hoạt động đúng. | GET `/api/dashboard/applications?status=applied` → 200. Response chỉ chứa đơn applied. | | | | Module E |
| 2 | DASHBOARD / APPLICATIONS / [ID] | ITC-05-02 | **[Điều kiện]** HR đang xem đơn. **[Thao tác]** HR xem chi tiết đơn: thông tin ứng viên, CV, cover letter, lịch sử trạng thái | application_id=`<id>` | Hiển thị đầy đủ: tên ứng viên, job title, CV link, cover letter, lịch sử status. | GET `/api/dashboard/applications/[id]` → 200. Response chứa application + history. | | | | Module E |
| 3 | DASHBOARD / APPLICATIONS / [ID] / STATUS | ITC-05-03 | **[Điều kiện]** Đơn status=`applied`. **[Thao tác]** HR chuyển → `screening` | to_status=`screening`, note=`CV phù hợp, mời screening call` | Status cập nhật. History thêm bản ghi. | POST `/api/dashboard/applications/[id]/status` → 200. DB: `applications.status = 'screening'`. `application_status_history` có record mới. | | | | Module E |
| 4 | DASHBOARD / APPLICATIONS / [ID] / STATUS | ITC-05-04 | **[Điều kiện]** Đơn status=`screening`. **[Thao tác]** HR chuyển → `interviewing` | to_status=`interviewing`, note=`Pass screening` | Status cập nhật thành `interviewing`. | POST → 200. DB cập nhật. History đầy đủ. | | | | Module E |
| 5 | DASHBOARD / APPLICATIONS / [ID] / EMAIL | ITC-05-05 | **[Điều kiện]** Đơn ở `interviewing`. **[Thao tác]** HR gửi email mời phỏng vấn thủ công | type=`invite`, application_id=`<id>` | Email được tạo và gửi. `email_logs` ghi nhận với status=`sent`. | POST `/api/dashboard/applications/[id]/email` → 200. DB: `email_logs.status = 'sent'`. Resend API được gọi thành công. | | | | Module E |
| 6 | DASHBOARD / APPLICATIONS / [ID] / EMAILS | ITC-05-06 | **[Điều kiện]** Đã gửi nhiều email cho đơn. **[Thao tác]** HR xem lịch sử email của đơn | application_id=`<id>` | Danh sách email logs hiển thị đúng: subject, type, status, thời gian gửi. | GET `/api/dashboard/applications/[id]/emails` → 200. Response là array email_logs. | | | | Module E |
| 7 | DASHBOARD / APPLICATIONS / [ID] / STATUS (Reject) | ITC-05-07 | **[Điều kiện]** Đơn ở `screening`. **[Thao tác]** HR từ chối đơn, chuyển → `rejected` | to_status=`rejected`, note=`Không đủ kinh nghiệm yêu cầu` | Status đổi `rejected`. Email từ chối tự động gửi candidate. | POST → 200. DB: `applications.status = 'rejected'`. `email_logs` thêm record type=`rejection`. | | | | Module E |
| 8 | DASHBOARD / APPLICATIONS / [ID] / STATUS (Offered) | ITC-05-08 | **[Điều kiện]** Đơn ở `interviewing`, PV đã `completed`. **[Thao tác]** HR chuyển → `offered` | to_status=`offered`, note=`Kết quả PV tốt, gửi offer` | Status đổi `offered`. Email offer gửi candidate. | POST → 200. DB update. `email_logs` type=`offer`. | | | | Module E |
| 9 | DASHBOARD / APPLICATIONS / [ID] / STATUS (Invalid Transition) | ITC-05-09 | **[Điều kiện]** Đơn ở `applied`. **[Thao tác]** Cố tình skip trạng thái, nhảy thẳng applied → `hired` | to_status=`hired` | Nếu có kiểm tra transition rules: lỗi "Không thể chuyển từ applied sang hired". Nếu không có: cập nhật bình thường (ghi nhận behavior). | POST → 400 hoặc 200 (tùy business rule). Ghi lại kết quả thực tế. | | | | Module E |
| 10 | DASHBOARD / APPLICATIONS / [ID] / STATUS (API Error) | ITC-05-10 | **[Điều kiện]** Giả lập lỗi DB (ngắt kết nối hoặc dùng mock). **[Thao tác]** HR chuyển status khi DB lỗi | Simulate DB connection error | Hệ thống trả về 500 Internal Server Error. Hiển thị toast lỗi. Status không thay đổi. | POST → 500. DB rollback. UI không thay đổi status. | | | | Module E |
| 11 | DASHBOARD / APPLICATIONS (Role Check) | ITC-05-11 | **[Điều kiện]** Đăng nhập bằng interviewer account. **[Thao tác]** Interviewer cố gọi API thay đổi status đơn | Interviewer session, application_id=`<id>` | 403 Forbidden. Chỉ HR/Admin mới được đổi status đơn. | POST `/api/dashboard/applications/[id]/status` với interviewer session → 403. | | | | Module E |

---

*Tổng số test case trong file ITC_01: 63 test cases thuộc 5 scenario*  
*Cập nhật: 2026-05-17 — QA Team*
