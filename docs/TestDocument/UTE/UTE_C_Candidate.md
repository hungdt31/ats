# UTE - Unit Test Evidence
# Module C - Khu vực Ứng viên (Candidate)

| Thông tin | Nội dung |
|-----------|----------|
| **Tên hệ thống** | ATS - Applicant Tracking System |
| **ID chức năng** | C-01 đến C-04 |
| **Tên chức năng** | Candidate Area |
| **Người tạo** | QA Team |
| **Ngày tạo** | 2026-05-17 |
| **Người test lần 1** | |
| **Người test lần 2** | |
| **Người test lần 3** | |
| **Tổng số item test** | 58 |
| **Tổng số bug** | |

> **Quy ước kết quả:** ○: OK | ×: NG chưa giải quyết | ×→○: NG đã giải quyết | －: Không test

---

## C-01 · Dashboard Ứng viên (`/candidate`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 1 | Bảo vệ route – Guest chưa đăng nhập | Xóa cookie, truy cập `/candidate` | Redirect về `/login` | | | | |
| 2 | Bảo vệ route – Role không phải candidate | Đăng nhập role=hr, truy cập `/candidate` | Trả về 403 hoặc redirect về `/dashboard` | | | | |
| 3 | Bảo vệ route – Role không phải candidate (admin) | Đăng nhập role=admin, truy cập `/candidate` | Trả về 403 hoặc redirect về `/dashboard` | | | | |
| 4 | Khởi tạo – Candidate đã login, chưa có đơn nào | Đăng nhập candidate, chưa nộp đơn nào | Dashboard load HTTP 200, thống kê đơn ứng tuyển hiển thị tất cả = 0 | | | | |
| 5 | Khởi tạo – Candidate có nhiều đơn | Candidate đã nộp đơn vào nhiều job với trạng thái khác nhau | Dashboard hiển thị số đơn đúng theo từng trạng thái | | | | |
| 6 | Layout – Thống kê đơn ứng tuyển | Candidate có đơn ở nhiều trạng thái | Hiển thị card đếm số đơn theo từng trạng thái: Applied, Screening, Interviewing, Offered, Hired, Rejected | | | | |
| 7 | Layout – Lịch phỏng vấn sắp tới | Candidate có interview `status=scheduled` và `scheduled_at > NOW()` | Hiển thị danh sách lịch phỏng vấn sắp tới với đầy đủ: tên job, thời gian, hình thức | | | | |
| 8 | Layout – Không có lịch phỏng vấn | Candidate không có interview nào scheduled | Hiển thị "Không có lịch phỏng vấn sắp tới" | | | | |
| 9 | Layout – Trạng thái hồ sơ (chưa tạo) | Candidate chưa tạo candidate_profile | Hiển thị cảnh báo/banner "Hoàn thiện hồ sơ để tăng cơ hội trúng tuyển", có link đến trang profile | | | | |
| 10 | Layout – Trạng thái hồ sơ (đã tạo) | Candidate đã có candidate_profile đầy đủ | Hiển thị tỉ lệ hoàn thiện hồ sơ (%) | | | | |
| 11 | Điều hướng – Link xem đơn ứng tuyển | Click "Xem tất cả đơn ứng tuyển" | Chuyển đến `/candidate/applications` | | | | |
| 12 | Điều hướng – Link xem lịch phỏng vấn | Click "Xem lịch phỏng vấn" | Chuyển đến `/candidate/interviews` | | | | |
| 13 | API – GET /api/candidate/applications | Dashboard load | Gọi đúng API, trả về array applications của candidate hiện tại | | | | |
| 14 | API – GET /api/candidate/interviews | Dashboard load | Gọi đúng API, trả về interviews `status=scheduled` và `scheduled_at > NOW()` | | | | |
| 15 | Boundary – Candidate xem đơn của candidate khác | Cố tình truyền candidate_id khác vào query | API chỉ trả về đơn của candidate đang đăng nhập (lọc theo JWT) | | | | |

---

## C-02 · Cập nhật hồ sơ ứng viên (`/candidate/profile`)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 16 | Bảo vệ route | Guest truy cập `/candidate/profile` | Redirect về `/login` | | | | |
| 17 | Khởi tạo – Chưa có profile | Candidate chưa có bản ghi `candidate_profiles` | Trang hiển thị form trống, cho phép tạo mới | | | | |
| 18 | Khởi tạo – Đã có profile | Candidate đã có profile | Trang load form với dữ liệu hiện tại đã điền sẵn | | | | |
| 19 | Layout – Form profile | Truy cập `/candidate/profile` | Hiển thị các field: Title (chức danh), Bio, Location, Năm kinh nghiệm, Skills, LinkedIn URL, GitHub URL | | | | |
| 20 | Validate – Title quá dài | Nhập title hơn 255 ký tự | Hiển thị lỗi validation về độ dài | | | | |
| 21 | Validate – LinkedIn URL sai format | Nhập `not-a-url` vào linkedin_url | Hiển thị lỗi "URL không hợp lệ" | | | | |
| 22 | Validate – GitHub URL sai format | Nhập `ftp://github.com/user` | Hiển thị lỗi "URL không hợp lệ" | | | | |
| 23 | Validate – Years experience âm | Nhập `years_experience = -1` | Hiển thị lỗi "Số năm kinh nghiệm phải lớn hơn hoặc bằng 0" | | | | |
| 24 | Cập nhật – Thay đổi Title | Sửa field title, click Lưu | PATCH `/api/candidate/profile` trả 200, dữ liệu cập nhật trong DB và trên UI | | | | |
| 25 | Cập nhật – Thêm nhiều Skill | Nhập các skill vào field skills (dạng tags hoặc text), click Lưu | Skills lưu đúng dạng JSON trong DB, hiển thị lại đúng trên form | | | | |
| 26 | Cập nhật – Bio nhiều ký tự | Nhập bio dài, click Lưu | Lưu thành công, hiển thị đầy đủ bio | | | | |
| 27 | Cập nhật – Location | Thay đổi location, click Lưu | Cập nhật thành công | | | | |
| 28 | Cập nhật – LinkedIn URL hợp lệ | Nhập `https://linkedin.com/in/username`, click Lưu | Lưu thành công | | | | |
| 29 | Cập nhật thành công | Submit form hợp lệ | Toast "Cập nhật hồ sơ thành công", dữ liệu phản ánh ngay trên UI | | | | |
| 30 | API – PATCH lỗi 401 | Gọi API không có cookie | Trả về 401 | | | | |
| 31 | API – PATCH lỗi 403 | Gọi API với role=hr | Trả về 403 | | | | |
| 32 | API – PATCH lỗi 500 | Giả lập lỗi DB | Toast "Đã xảy ra lỗi, vui lòng thử lại" | | | | |

---

## C-03 · Upload CV (`/candidate/profile` hoặc widget upload)

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 33 | Bảo vệ API | Guest gọi POST `/api/candidate/files` | Trả về 401 Unauthorized | | | | |
| 34 | Hiển thị danh sách file | Candidate có file CV đã upload | GET `/api/candidate/files` trả về danh sách files, hiển thị: tên file, loại, ngày upload | | | | |
| 35 | Hiển thị – Chưa có file | Candidate chưa upload file nào | Hiển thị empty state "Chưa có file nào được tải lên" | | | | |
| 36 | Upload CV – file PDF hợp lệ | Chọn file `.pdf` < 5MB, click Upload | API POST `/api/candidate/files` gọi Appwrite lưu file, tạo bản ghi trong bảng `files` với `file_type=cv`, toast "Upload thành công" | | | | |
| 37 | Upload CV – file DOCX hợp lệ | Chọn file `.docx`, click Upload | Upload thành công, bản ghi tạo đúng | | | | |
| 38 | Upload CV – file DOC hợp lệ | Chọn file `.doc`, click Upload | Upload thành công | | | | |
| 39 | Upload – Sai định dạng file | Chọn file `.png` hoặc `.exe` | Hiển thị lỗi "Chỉ chấp nhận file PDF, DOC, DOCX" | | | | |
| 40 | Upload – File quá lớn | Chọn file > giới hạn dung lượng cho phép (vd: 10MB) | Hiển thị lỗi "File vượt quá kích thước cho phép" | | | | |
| 41 | Upload – Bản ghi DB chính xác | Upload thành công, kiểm tra DB | Bảng `files` có bản ghi: `user_id` đúng, `file_type=cv`, `appwrite_id` có giá trị, `file_url` hợp lệ | | | | |
| 42 | Xóa file | Click nút xóa trên 1 file | API DELETE `/api/candidate/files/[id]` gọi Appwrite xóa file, xóa bản ghi DB, toast "Đã xóa file" | | | | |
| 43 | Xóa file – Xác nhận trước khi xóa | Click xóa | Hiển thị dialog xác nhận "Bạn có chắc muốn xóa file này?" | | | | |
| 44 | Xóa file – id không tồn tại | Gọi DELETE với id không có trong DB | Trả về 404 | | | | |
| 45 | Xóa file – file của candidate khác | Gọi DELETE với id thuộc candidate khác | Trả về 403 Forbidden | | | | |

---

## C-04 · Nộp đơn ứng tuyển từ trang job detail

| No. | Item test | Điều kiện test | Kết quả mong đợi / Cách xác nhận | Kết quả test 1st | Kết quả test 2nd | Kết quả test 3rd | Note |
|-----|-----------|----------------|----------------------------------|-----------------|-----------------|-----------------|------|
| 46 | Nút "Nộp đơn" – Guest | Guest xem `/jobs/[slug]` | Nút "Nộp đơn" hiển thị; khi click, redirect về `/login` | | | | |
| 47 | Nút "Nộp đơn" – Candidate chưa nộp | Candidate đã đăng nhập, chưa nộp job này | Nút "Nộp đơn ngay" active | | | | |
| 48 | Nút "Đã nộp đơn" – Candidate đã nộp | Candidate đã có application cho job này | Nút hiển thị "Đã nộp đơn" (disabled), không thể submit thêm | | | | |
| 49 | Form apply – Validate CV required | Submit form không chọn file CV | Lỗi "CV là bắt buộc" | | | | |
| 50 | Form apply – Cover letter optional | Submit form không nhập cover letter | Không có lỗi; nộp đơn thành công với cover_letter = null | | | | |
| 51 | Form apply – Source channel | Chọn source_channel từ dropdown: linkedin/itviec/topcv/vietnamworks/website | Giá trị được lưu đúng vào DB | | | | |
| 52 | Nộp đơn thành công | Candidate submit form hợp lệ | POST `/api/jobs/[slug]/apply` trả 201, tạo bản ghi `applications` với `status=applied`, `UNIQUE(job_id, candidate_id)` đảm bảo, toast "Nộp đơn thành công!" | | | | |
| 53 | Nộp đơn – Trùng (409) | Candidate nộp đơn lần 2 vào cùng job | API trả 409, toast "Bạn đã nộp đơn vào vị trí này rồi" | | | | |
| 54 | Nộp đơn – Job đã đóng | Job có `status=closed`, candidate submit | API trả 400/422, toast "Tin tuyển dụng này đã đóng" | | | | |
| 55 | Nộp đơn – Role không phải candidate | HR gọi API apply | API trả 403 Forbidden | | | | |
| 56 | Xem đơn sau khi nộp | Candidate vào `/candidate/applications` sau khi nộp | Đơn mới xuất hiện với `status=applied`, tên job và ngày nộp đúng | | | | |
| 57 | Dữ liệu đơn trong DB | Nộp đơn thành công, kiểm tra DB | Bảng `applications`: đúng `job_id`, `candidate_id`, `cv_file_url`, `cover_letter`, `source_channel`, `status=applied` | | | | |
| 58 | Xem lịch sử ứng tuyển – Phân trang | Candidate có hơn 10 đơn ứng tuyển | `/candidate/applications` hiển thị phân trang, dữ liệu đúng trên từng trang | | | | |
