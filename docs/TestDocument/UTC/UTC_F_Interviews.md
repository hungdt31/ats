# TEST CASE DOCUMENT
# Module F - Quản lý Phỏng vấn (Interviews)

| Thông tin | Nội dung |
|-----------|----------|
| **Module** | F - Interviews (`/dashboard/interviews`, `/dashboard/interviews/new`, `/dashboard/interviews/[id]`, `/dashboard/interviews/[id]/score`) |
| **Ngày tạo** | 2026-05-17 |
| **Người tạo** | AI Agent |
| **Phiên bản** | 1.0 |

---

| No. | Item test | Điều kiện test | Kết quả mong đợi/cách xác nhận | Kết quả test - 1st | Kết quả test - 2nd | Kết quả test - 3rd | Note |
|-----|-----------|----------------|-------------------------------|-------------------|-------------------|-------------------|------|
| 1 | Phân quyền - Truy cập<br>・/dashboard/interviews chưa đăng nhập | ・Chưa đăng nhập<br>・Truy cập trực tiếp URL | Redirect đến `/login` | | | | |
| 2 | Phân quyền - Truy cập<br>・/dashboard/interviews với role candidate | ・Đăng nhập role candidate<br>・Truy cập `/dashboard/interviews` | Redirect đến `/candidate` hoặc `/unauthorized` | | | | |
| 3 | Phân quyền - Truy cập<br>・/dashboard/interviews với role admin | ・Đăng nhập role admin | Trang hiển thị đúng<br>・Thấy tất cả lịch PV<br>・Có nút "Tạo PV mới" | | | | |
| 4 | Phân quyền - Truy cập<br>・/dashboard/interviews với role hr | ・Đăng nhập role hr | Trang hiển thị đúng<br>・Thấy tất cả lịch PV<br>・Có nút "Tạo PV mới" | | | | |
| 5 | Phân quyền - Truy cập<br>・/dashboard/interviews với role interviewer | ・Đăng nhập role interviewer | Trang hiển thị nhưng chỉ thấy lịch PV của mình<br>・Không có nút "Tạo PV mới" | | | | |
| 6 | Phân quyền - Truy cập<br>・/dashboard/interviews/new với role interviewer | ・Đăng nhập role interviewer<br>・Truy cập trực tiếp URL | Redirect hoặc hiển thị 403 | | | | |
| 7 | Interviews List - Khởi tạo<br>・Layout | ・Đăng nhập admin<br>・Có ≥3 lịch PV trong DB | Trang hiển thị:<br>・Bảng danh sách: Ứng viên, Vị trí, Interviewer, Ngày giờ, Hình thức, Trạng thái<br>・Bộ lọc status và ngày<br>・Nút Tạo PV mới | | | | |
| 8 | Interviews List - Khởi tạo<br>・Không có dữ liệu | ・DB chưa có interview nào | Hiển thị "Chưa có lịch phỏng vấn nào."<br>・Nút "Tạo PV mới" (hr/admin) | | | | |
| 9 | Interviews List - Filter<br>・Filter theo status=scheduled | ・Chọn status "scheduled" | Chỉ hiển thị PV có status=scheduled | | | | |
| 10 | Interviews List - Filter<br>・Filter theo status=completed | ・Chọn status "completed" | Chỉ hiển thị PV đã hoàn thành | | | | |
| 11 | Interviews List - Filter<br>・Filter theo status=cancelled | ・Chọn status "cancelled" | Chỉ hiển thị PV đã hủy | | | | |
| 12 | Interviews List - Filter<br>・Filter theo status=rescheduled | ・Chọn status "rescheduled" | Chỉ hiển thị PV đã dời lịch | | | | |
| 13 | Interviews List - Filter<br>・Filter theo ngày | ・Nhập ngày hôm nay dạng YYYY-MM-DD | Chỉ hiển thị PV ngày hôm nay<br>・scheduled_at = ngày đó | | | | |
| 14 | Interviews List - Filter<br>・Filter ngày không hợp lệ | ・Nhập ngày sai format "abc" | Bỏ qua filter ngày<br>・Hiển thị toàn bộ hoặc reset về mặc định | | | | |
| 15 | Interviews List - Filter<br>・Kết hợp status + ngày | ・status=scheduled, ngày=ngày mai | Hiển thị PV scheduled vào ngày mai | | | | |
| 16 | Interviews List - Filter<br>・Không có kết quả | ・Filter combination không có data | Hiển thị "Không có lịch phỏng vấn nào phù hợp" | | | | |
| 17 | Interviews List - Badge màu<br>・Kiểm tra màu theo trạng thái | ・Có đủ 4 trạng thái trong danh sách | Badge màu đúng:<br>・scheduled=xanh, completed=xanh đậm, cancelled=đỏ, rescheduled=cam | | | | Cần confirm màu theo design |
| 18 | Interviews List - Phân trang<br>・>20 bản ghi | ・Có >20 PV trong DB | Phân trang hiển thị đúng<br>・Chuyển trang đúng dữ liệu<br>・Mặc định 20/trang | | | | |
| 19 | Interviews List - Interviewer scope<br>・Chỉ thấy PV của mình | ・Đăng nhập interviewer A<br>・Có PV của interviewer A và B trong DB | Chỉ hiển thị PV của interviewer A<br>・Không thấy PV của B | | | | |
| 20 | Interviews List - Navigation<br>・Click vào row | ・Click row PV bất kỳ | Redirect đến `/dashboard/interviews/[id]` | | | | |
| 21 | Interviews List - API<br>・GET /api/dashboard/interviews thành công | ・Gọi API với session hợp lệ (admin) | Response 200:<br>・`{ success: true, data: { items: [...], total, page, limit } }`<br>・Mỗi item có: id, candidate info, interviewer, scheduled_at, type, status | | | | |
| 22 | Interviews List - API<br>・GET với filter query string | ・GET /api/dashboard/interviews?status=scheduled&date=2026-05-17 | Chỉ trả về PV thỏa điều kiện | | | | |
| 23 | Interviews List - API<br>・401 chưa đăng nhập | ・Gọi API không có cookie | Response 401 | | | | |
| 24 | Interviews List - API<br>・403 role candidate | ・Gọi API với role candidate | Response 403 | | | | |
| 25 | Create Interview - Khởi tạo form<br>・Load metadata | ・Truy cập `/dashboard/interviews/new`<br>・Có ≥1 interviewer trong DB | Form hiển thị đầy đủ fields<br>・Dropdown interviewer load được danh sách<br>・Dropdown hồ sơ ứng tuyển load được | | | | |
| 26 | Create Interview - Khởi tạo form<br>・Không có interviewer | ・DB không có user role=interviewer | Dropdown interviewer rỗng hoặc thông báo "Chưa có interviewer" | | | | |
| 27 | Create Interview - Validation<br>・Bỏ trống hồ sơ ứng tuyển | ・Không chọn application<br>・Click Tạo phỏng vấn | Lỗi F-VAL-001: "Vui lòng chọn hồ sơ ứng tuyển."<br>・Không gọi API | | | | |
| 28 | Create Interview - Validation<br>・Bỏ trống interviewer | ・Không chọn interviewer<br>・Click Tạo phỏng vấn | Lỗi F-VAL-002: "Vui lòng chọn người phỏng vấn."<br>・Không gọi API | | | | |
| 29 | Create Interview - Validation<br>・Bỏ trống ngày giờ | ・Không nhập scheduled_at<br>・Click Tạo phỏng vấn | Lỗi F-VAL-003: "Ngày giờ phỏng vấn phải trong tương lai."<br>・Không gọi API | | | | |
| 30 | Create Interview - Validation<br>・Ngày giờ trong quá khứ | ・Nhập scheduled_at = hôm qua 10:00<br>・Click Tạo | Lỗi F-VAL-003: "Ngày giờ phỏng vấn phải trong tương lai." | | | | |
| 31 | Create Interview - Validation<br>・Bỏ trống hình thức | ・Không chọn type<br>・Click Tạo | Lỗi F-VAL-004: "Vui lòng chọn hình thức phỏng vấn." | | | | |
| 32 | Create Interview - Validation<br>・Thời lượng = 0 | ・Nhập duration_minutes = 0<br>・Click Tạo | Lỗi F-VAL-005: "Thời lượng phỏng vấn phải lớn hơn 0 phút." | | | | |
| 33 | Create Interview - Validation<br>・Thời lượng âm | ・Nhập duration_minutes = -30 | Lỗi F-VAL-005 | | | | |
| 34 | Create Interview - Validation<br>・Link họp không hợp lệ | ・Nhập meeting_link = "abc not url"<br>・Click Tạo | Lỗi F-VAL-006: "Link họp phải là URL hợp lệ." | | | | |
| 35 | Create Interview - Submit<br>・Tạo thành công (video) | ・Điền đủ: application, interviewer, datetime tương lai, type=video, link hợp lệ<br>・Click Tạo phỏng vấn | API POST /api/dashboard/interviews trả 201<br>・Record mới trong bảng interviews với status=scheduled<br>・Redirect đến /dashboard/interviews/[id] mới<br>・Toast: "Lịch phỏng vấn đã được tạo thành công." (F-SUC-001) | | | | |
| 36 | Create Interview - Submit<br>・Tạo thành công (onsite) | ・type=onsite, điền location<br>・Click Tạo | API 201; record đúng với type=onsite và location | | | | |
| 37 | Create Interview - Submit<br>・Tạo thành công (phone) | ・type=phone, không cần link/location<br>・Click Tạo | API 201; record đúng với type=phone | | | | |
| 38 | Create Interview - Submit<br>・API 500 | ・Mock API POST trả 500 | Toast lỗi F-ERR-002: "Không thể tạo lịch phỏng vấn. Vui lòng kiểm tra thông tin."<br>・Không tạo record trong DB<br>・Form không reset | | | | Cần mock API |
| 39 | Create Interview - Hủy<br>・Click Hủy | ・Đang ở form tạo PV<br>・Click Hủy | Redirect về `/dashboard/interviews`<br>・Không tạo record | | | | |
| 40 | Create Interview - Thời lượng mặc định<br>・Giá trị default | ・Mở form tạo PV<br>・Không sửa field thời lượng | Field thời lượng tự điền sẵn = 60 phút | | | | |
| 41 | Interview Detail - Khởi tạo<br>・Layout đầy đủ | ・Truy cập `/dashboard/interviews/[id]`<br>・ID hợp lệ, có scorecard | Trang hiển thị:<br>・Thông tin ứng viên: tên, email, job applied<br>・Thông tin interviewer: tên, email<br>・Ngày giờ, hình thức, thời lượng, link<br>・Badge trạng thái<br>・Scorecard section (nếu đã chấm) | | | | |
| 42 | Interview Detail - Khởi tạo<br>・Chưa có scorecard | ・PV chưa được chấm điểm | Scorecard section hiển thị "Chưa có điểm đánh giá"<br>・Nút "Chấm điểm" hiển thị với interviewer của PV đó | | | | |
| 43 | Interview Detail - ID không tồn tại<br>・404 | ・Truy cập `/dashboard/interviews/99999` | Hiển thị lỗi F-ERR-003: "Phỏng vấn không tồn tại."<br>・Có link quay về danh sách | | | | |
| 44 | Interview Detail - Phân quyền<br>・Interviewer xem PV người khác | ・Đăng nhập interviewer A<br>・Truy cập PV được giao cho interviewer B | Hiển thị lỗi F-ERR-004: "Bạn không có quyền xem phỏng vấn này." | | | | |
| 45 | Interview Detail - Nút action<br>・HR/Admin thấy nút Chỉnh sửa và Đổi trạng thái | ・Đăng nhập admin<br>・Xem chi tiết PV | Nút "Chỉnh sửa" và "Đổi trạng thái" (Cancel/Complete/Reschedule) hiển thị | | | | |
| 46 | Interview Detail - Nút action<br>・Interviewer thấy nút Chấm điểm | ・Đăng nhập interviewer là người được giao<br>・Xem chi tiết PV của mình | Nút "Chấm điểm" hiển thị<br>・Không thấy nút Chỉnh sửa/Đổi trạng thái | | | | |
| 47 | Update Interview - Reschedule<br>・Đổi trạng thái sang rescheduled | ・Đăng nhập admin<br>・PV đang ở scheduled<br>・Chọn "Reschedule"<br>・Nhập ngày mới | API PATCH /api/dashboard/interviews/[id] trả 200<br>・status cập nhật = rescheduled<br>・scheduled_at cập nhật đúng<br>・Toast: "Thông tin phỏng vấn đã được cập nhật." (F-SUC-002) | | | | |
| 48 | Update Interview - Cancel<br>・Đổi trạng thái sang cancelled | ・Đăng nhập hr<br>・PV đang ở scheduled<br>・Chọn "Cancel" | API PATCH trả 200<br>・status = cancelled<br>・Badge cập nhật đúng trên UI | | | | |
| 49 | Update Interview - Complete<br>・Đổi trạng thái sang completed | ・Đăng nhập admin<br>・PV đang ở scheduled/rescheduled<br>・Chọn "Complete" | API PATCH trả 200<br>・status = completed | | | | |
| 50 | Update Interview - API lỗi<br>・PATCH 500 | ・Mock API PATCH trả 500 | Toast lỗi<br>・Trạng thái DB không thay đổi | | | | Cần mock API |
| 51 | Score Interview - Truy cập<br>・Interviewer vào form chấm điểm | ・Đăng nhập interviewer là người được giao<br>・Truy cập `/dashboard/interviews/[id]/score` | Form chấm điểm hiển thị đầy đủ:<br>・Điểm kỹ thuật, giao tiếp, văn hóa, tổng thể (1-10)<br>・Điểm mạnh, điểm yếu, nhận xét<br>・Dropdown kết luận (pass/fail/hold)<br>・Checkbox "Đánh dấu chấm điểm cuối cùng" | | | | |
| 52 | Score Interview - Truy cập<br>・HR/Admin có thể xem nhưng không chấm | ・Đăng nhập admin<br>・Truy cập `/dashboard/interviews/[id]/score` | Form hiển thị (read-only hoặc full access)<br>・Cần confirm quyền admin trên scorecard | | | | Cần confirm business rule |
| 53 | Score Interview - Truy cập<br>・Interviewer khác không được chấm | ・Đăng nhập interviewer B<br>・Truy cập PV của interviewer A | Redirect hoặc 403 | | | | |
| 54 | Score Interview - Validation<br>・Điểm kỹ thuật bỏ trống | ・Bỏ trống technical_score<br>・Click Lưu điểm | Lỗi F-VAL-007: "Điểm phải là số nguyên từ 1 đến 10." | | | | |
| 55 | Score Interview - Validation<br>・Điểm giao tiếp bỏ trống | ・Bỏ trống communication_score | Lỗi F-VAL-007 | | | | |
| 56 | Score Interview - Validation<br>・Điểm văn hóa bỏ trống | ・Bỏ trống cultural_fit_score | Lỗi F-VAL-007 | | | | |
| 57 | Score Interview - Validation<br>・Điểm tổng thể bỏ trống | ・Bỏ trống overall_score | Lỗi F-VAL-007 | | | | |
| 58 | Score Interview - Validation<br>・Điểm ngoài range (0 và 11) | ・Nhập technical_score = 0 hoặc 11 | Lỗi F-VAL-007: "Điểm phải là số nguyên từ 1 đến 10." | | | | |
| 59 | Score Interview - Validation<br>・Kết luận bỏ trống | ・Không chọn result (pass/fail/hold)<br>・Click Lưu điểm | Lỗi F-VAL-008: "Vui lòng chọn kết luận phỏng vấn (Đạt / Không đạt / Cân nhắc)." | | | | |
| 60 | Score Interview - Submit<br>・Chấm điểm lần đầu thành công | ・Điền đủ 4 điểm (đều trong 1-10)<br>・Chọn result=pass<br>・is_final = false<br>・Click Lưu điểm | API POST /api/dashboard/interviews/[id]/score trả 200/201<br>・interview_scores tạo record mới<br>・interview.status KHÔNG đổi (vì is_final=false)<br>・Toast: "Điểm phỏng vấn đã được lưu thành công." (F-SUC-003)<br>・Redirect về /dashboard/interviews/[id] | | | | |
| 61 | Score Interview - Submit<br>・Chấm điểm với is_final = true | ・Điền đủ điểm hợp lệ<br>・Tick "Đánh dấu chấm điểm cuối cùng"<br>・Click Lưu điểm | API 200<br>・interview_scores tạo/update record<br>・interview.status cập nhật = completed<br>・Toast F-SUC-003 | | | | |
| 62 | Score Interview - Submit<br>・Cập nhật điểm đã có (UPSERT) | ・PV đã có scorecard trước đó<br>・Truy cập lại form và sửa điểm<br>・Click Lưu điểm | API 200<br>・interview_scores UPDATE record cũ (không tạo duplicate)<br>・Điểm mới hiển thị trên trang chi tiết | | | | |
| 63 | Score Interview - Submit<br>・API 500 | ・Mock API trả 500 | Toast lỗi F-ERR-005: "Không thể lưu điểm. Vui lòng thử lại."<br>・Không lưu DB | | | | Cần mock API |
| 64 | Score Interview - Result options<br>・Kiểm tra 3 tùy chọn kết luận | ・Mở form chấm điểm | Dropdown hiển thị đủ 3 lựa chọn:<br>・pass (Đạt), fail (Không đạt), hold (Cân nhắc) | | | | |
| 65 | Score Interview - Các trường tùy chọn<br>・Để trống strengths, weaknesses, feedback | ・Điền đủ 4 điểm + kết luận<br>・Bỏ trống 3 field tùy chọn<br>・Click Lưu điểm | Submit thành công<br>・Không có lỗi validation | | | | |
| 66 | API - GET /api/dashboard/interviews/[id]<br>・Chi tiết PV | ・Gọi API với ID hợp lệ | Response 200:<br>・`{ success: true, data: { ...interview, application, interviewer, scores } }` | | | | |
| 67 | API - PATCH /api/dashboard/interviews/[id]<br>・401 không có session | ・Gọi API không có cookie | Response 401 | | | | |
| 68 | API - POST /api/dashboard/interviews/[id]/score<br>・403 với role hr (nếu chỉ interviewer được chấm) | ・Đăng nhập hr<br>・Gọi API chấm điểm | Response 403 hoặc cho phép (tùy business rule) | | | | Cần confirm |
| 69 | API - GET metadata /api/dashboard/interviews/metadata<br>・Lấy danh sách interviewer | ・Gọi API metadata | Response 200:<br>・`{ success: true, data: { interviewers: [{ id, full_name, email }] } }`<br>・Chỉ trả về users có role=interviewer và is_active=true | | | | |
| 70 | Loading / UX<br>・Skeleton khi tải danh sách | ・Network chậm<br>・Truy cập `/dashboard/interviews` | Skeleton table hiển thị trong khi fetching | | | | |
| 71 | Loading / UX<br>・Skeleton khi tải chi tiết | ・Network chậm<br>・Truy cập `/dashboard/interviews/[id]` | Skeleton loader hiển thị trước khi data load | | | | |
| 72 | Double submit<br>・Click Lưu điểm nhiều lần | ・Mở form chấm điểm hợp lệ<br>・Click Lưu điểm nhanh nhiều lần | Nút disabled sau click đầu tiên<br>・Chỉ gọi API 1 lần<br>・Không tạo duplicate score | | | | |
| 73 | Double submit<br>・Click Tạo phỏng vấn nhiều lần | ・Form tạo PV hợp lệ<br>・Click nhanh nhiều lần | Nút disabled sau click đầu tiên<br>・Chỉ tạo 1 record trong DB | | | | |
| 74 | Message / Toast<br>・Tất cả actions thành công | ・Tạo PV / Cập nhật / Chấm điểm thành công | Toast xanh xuất hiện với nội dung theo MessageCD<br>・Tự đóng sau ~3-5 giây | | | | |
| 75 | Message / Toast<br>・Tất cả actions lỗi | ・API lỗi cho mọi action | Toast đỏ xuất hiện với thông báo lỗi rõ ràng | | | | |
| 76 | Security<br>・Candidate không truy cập được module | ・Đăng nhập candidate<br>・Gọi trực tiếp GET /api/dashboard/interviews | Response 403<br>・Không trả về data | | | | |
| 77 | Security<br>・Interviewer không tạo PV qua API | ・Đăng nhập interviewer<br>・POST /api/dashboard/interviews | Response 403 | | | | |
| 78 | Security<br>・Interviewer không cập nhật PV qua API | ・Đăng nhập interviewer<br>・PATCH /api/dashboard/interviews/[id] | Response 403 | | | | |
| 79 | URL sync<br>・Filter phản ánh vào URL | ・Chọn filter status=completed<br>・Copy URL và mở tab mới | Tab mới tải với filter status=completed sẵn | | | | |
| 80 | Scorecard hiển thị trên Detail<br>・Điểm sau khi chấm | ・PV đã được chấm điểm (is_final=false)<br>・Xem trang chi tiết PV | Scorecard section hiển thị đủ:<br>・4 điểm thành phần<br>・Kết luận (pass/fail/hold)<br>・Điểm mạnh, yếu, nhận xét nếu có | | | | |
