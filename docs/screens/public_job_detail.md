# Tài liệu Đặc tả Màn hình: Chi Tiết Việc Làm (Public Job Detail)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Chi tiết Việc làm & Ứng tuyển |
| **Đường dẫn file** | `app/jobs/[id]/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 06/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 06/05/2026 | AI | Tạo đặc tả luồng Nộp hồ sơ (Apply), Popup Dialog và Upload CV File tích hợp Appwrite. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Hiển thị chi tiết nội dung của một bài viết tuyển dụng (JD - Job Description) cho ứng viên đọc. Đồng thời, cung cấp giao diện Popup an toàn để ứng viên gửi hồ sơ (Upload file CV, viết thư giới thiệu) ngay tại trang mà không bị chuyển hướng.
- **User Flow:** 
  1. Truy cập vào trang chi tiết thông qua liên kết Job Card hoặc đường dẫn `/jobs/[id]`.
  2. Đọc thông tin: Mức lương, Địa điểm, Yêu cầu, Kỹ năng...
  3. Ứng viên bấm nút **"Ứng tuyển ngay"** (Nút này sẽ thay đổi tuỳ vào việc ứng viên đã đăng nhập chưa, và đã nộp đơn cho vị trí này trước đó hay chưa).
  4. Nếu bấm ứng tuyển, Popup (Dialog) sẽ bật lên.
  5. Upload CV file (Lưu vào Appwrite Cloud) và gửi Cover Letter.
  6. Hồ sơ được lưu thành công, hệ thống tự động redirect về trang Quản lý Cá nhân (`/candidate`).

### IPO Tổng quan
- **Input:** URL Param `[id]`. Thông tin ứng tuyển: File CV (PDF/Doc) và Cover Letter.
- **Process:** 
  - Gọi Data Fetching: `useMe()` để check session, `useJob(id)` để load JD.
  - Component `CVUpload`: Đẩy file vật lý lên Cloud (Appwrite), lấy URL trực tiếp.
  - Gọi POST `/api/candidate/applications` (thông qua mutation) kèm theo URL của CV và Cover Letter.
  - Nếu ứng tuyển thành công, gọi tiếp 1 API ngầm để đăng ký File CV đó vào Kho Lưu Trữ Tài Liệu cá nhân của user.
- **Output:** Toast/Error message. Màn hình tự động chuyển sang trang `/candidate`.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Chi tiết Công việc & Popup Apply]`

### Chi tiết điều khiển
**Phần Content JD (Cột trái):**
| STT | Tên thành phần | Chi tiết |
| :--- | :--- | :--- |
| 1 | Nút Quay lại | Nút "Danh sách việc làm" nằm trên cùng. |
| 2 | Header JD | Chứa Tựa đề, Ngày đăng, Số lượng tuyển (Badge), Mức lương. |
| 3 | Body Text | Các cụm văn bản lớn: Mô tả, Yêu cầu, Quyền lợi (Whitespace pre-wrap). |
| 4 | Nút Hành động | **Chưa login:** Link dắt qua `/login?callbackUrl=...`.<br>**Đã login + Đã nộp:** Nút "Xem đơn ứng tuyển".<br>**Đã login + Chưa nộp:** Mở Popup Dialog "Ứng tuyển ngay". |

**Phần Sidebar (Cột phải):**
| STT | Tên thành phần | Chi tiết |
| :--- | :--- | :--- |
| 5 | Card Thông tin chung | Các trường: Hình thức, Địa điểm, Phòng ban, Ngày hết hạn. |
| 6 | Card Kỹ năng | Render ra các thẻ Badge từ mảng Kỹ năng. |

**Phần Popup Apply (Dialog):**
| STT | Tên thành phần | Loại UI | Ràng buộc |
| :--- | :--- | :--- | :--- |
| 7 | Upload CV | Component `CVUpload` | Bắt buộc. Phải up lên thành công để lấy File URL. |
| 8 | Cover Letter | Textarea | Tùy chọn. Viết tự do. |
| 9 | Lỗi | Error Block | Hiển thị thông báo thất bại từ API. |
| 10 | Nút Gửi | Button | Trạng thái Disabled khi đang Pending upload/gửi form. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| HTTP 404 | Chuyển hướng sang màn hình Error `notFound()` Next.js | System Redirect |
| Trống CV | "Vui lòng cung cấp link CV của bạn." | Error Block (Đỏ) |
| Lỗi API Apply | Bắt Error message từ Backend hoặc fallback "Không thể gửi đơn..." | Error Block (Đỏ) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Dynamic Buttons (Nút Bấm Thông Minh):**
   - API lấy chi tiết Job trả về thêm cờ `hasApplied` (true/false) (Backend kiểm tra trùng khớp Session ID và Job ID).
   - Dựa vào giá trị `user` session và `hasApplied` để React Render ra 1 trong 3 nút khác nhau ở cuối bài (Nút đăng nhập, Nút ứng tuyển, Nút xem đơn cũ).
   - Nếu ứng viên chưa login, bấm vào dắt tới màn `/login` kèm theo params `callbackUrl`. Sau khi login xong, hệ thống Login sẽ vòng ngược lại đúng trang Job này.
2. **Luồng Upload CV Cloud (`handleApply`):**
   - Khi bấm Nộp đơn, hệ thống chờ Component `CVUpload` thao tác xong (Upload file vào Appwrite Storage bucket và bóc URL ra `cvFileUrl`).
   - Mutation Hook gửi URL và Cover Letter này đi.
   - **Xử lý ngầm kép (Double Submit):** Nếu Apply thành công, React gửi thêm một POST Request phụ (ngầm) chọc vào API `/api/candidate/files` để ném cái CV File Info đó vào "Thư viện quản lý File" của ứng viên. Nếu lỗi phần này thì Ignore log ra console, không làm hỏng trải nghiệm nộp đơn chính.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan Hook & API
| Hook / Component | Chức năng |
| :--- | :--- |
| `useJob(id)` | Lấy Object JD và cờ `hasApplied`. Nếu Job bị ẩn/xóa, ném lỗi 404. |
| `useApplyJob(id)` | Khởi tạo Mutation POST gửi thông tin đơn (Application) xuống DB. |
| `CVUpload` | Component tự trị đảm nhiệm kết nối thư viện Appwrite Storage (Client-side upload). |
