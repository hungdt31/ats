# Tài liệu Đặc tả Màn hình: Bảng điều khiển Ứng viên (Không gian ứng viên)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Không gian ứng viên (Candidate Dashboard) |
| **Đường dẫn file** | `app/candidate/page.tsx`, `components/candidate/profile.tsx`, `components/candidate/applications.tsx`, `components/candidate/interviews.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 05/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 05/05/2026 | AI | Tạo tài liệu đặc tả ban đầu |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là trang trung tâm (hub) dành riêng cho ứng viên (Candidate) sau khi đăng nhập. Tại đây, ứng viên có thể quản lý lịch sử ứng tuyển (applications), theo dõi các lịch phỏng vấn, cập nhật hồ sơ cá nhân và quản lý file đính kèm (CV, Portfolio).
- **User Flow:** 
  1. Ứng viên đăng nhập, hệ thống tự động đưa đến `/candidate`.
  2. Mặc định hiển thị tab "Đơn ứng tuyển" chứa danh sách các đơn đã nộp.
  3. Người dùng có thể chuyển sang tab "Lịch phỏng vấn" để xem lịch hẹn.
  4. Hoặc chuyển sang tab "Hồ sơ cá nhân" để chỉnh sửa thông tin liên hệ, đổi mật khẩu và upload tệp tin (CV) mới.

### IPO Tổng quan
- **Input:** Token người dùng (để gọi API tương ứng), thao tác click tab, thao tác nhập dữ liệu form chỉnh sửa profile, thao tác tải tệp tin (file input).
- **Process:** 
  - Gọi song song các hook lấy dữ liệu (`useMe`, `useCandidateApplications`, `useCandidateProfile`, `useCandidateInterviews`).
  - Phân luồng hiển thị qua hệ thống Tab (Shadcn Tabs).
  - Validation dữ liệu (Đổi mật khẩu: khớp mật khẩu, Upload: File config Appwrite).
- **Output:** Giao diện gồm 3 tab độc lập. Thông báo cập nhật thành công/thất bại, các thay đổi được lưu trực tiếp vào cơ sở dữ liệu và Storage của Appwrite.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Candidate Dashboard]`

### Chi tiết điều khiển
**Phần chung (Tab Navigation):**
| STT | Tên thành phần | Loại | Ràng buộc (Validation) | Trạng thái mặc định |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Tab Đơn ứng tuyển | Tab Trigger | Bắt buộc hiển thị số lượng đơn | Active (Mặc định) |
| 2 | Tab Lịch phỏng vấn | Tab Trigger | Bắt buộc hiển thị số lượng | Inactive |
| 3 | Tab Hồ sơ cá nhân | Tab Trigger | Không | Inactive |

**Tab "Hồ sơ cá nhân" (Profile):**
| STT | Tên thành phần | Loại | Ràng buộc (Validation) | Trạng thái mặc định | Disable/Enable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 4 | Nút "Chỉnh sửa hồ sơ" | Button | Không | Enable | Bật form chỉnh sửa khi click |
| 5 | Tên / Email | Textbox | Bắt buộc nhập | Dữ liệu cũ | Enable khi ở chế độ sửa |
| 6 | Kinh nghiệm (năm) | Number | Số dương (>=0) | Dữ liệu cũ | Enable khi ở chế độ sửa |
| 7 | Nút "Lưu thay đổi" | Button | Không | Disable khi đang load (Pending) | - |
| 8 | Quản lý tệp cá nhân | File Input | Định dạng: .pdf, .doc, .docx | Cho phép upload | Disable khi đang upload file |
| 9 | Mật khẩu mới | Password Input | Khớp với Xác nhận mật khẩu | Trống | - |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Upload thiếu config .env | "Cấu hình Appwrite chưa đầy đủ trong file .env" | Alert đỏ (Trong khu vực File) |
| Upload thành công | "Tải tệp lên thành công" | Alert xanh (Trong khu vực File) |
| Lỗi xóa/đổi tên tệp | "Không thể xóa tệp" / "Không thể đổi tên tệp" | Alert đỏ |
| Mật khẩu không khớp | "Xác nhận mật khẩu mới không khớp" | Alert đỏ (Khu vực đổi mật khẩu) |
| Đổi mật khẩu thành công | "Đổi mật khẩu thành công!" | Alert xanh |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Mount (Khởi tạo):**
   - Lấy dữ liệu qua các custom hooks (`useMe`, `useCandidateProfile`, `useCandidateApplications`, v.v.). Các hook này tương tác với React Query. 
   - Trong `CandidateProfile`, fetch riêng danh sách file qua API `/api/candidate/files`.
   - Hiển thị Text Skeleton ("Đang tải...") nếu dữ liệu đang loading.
2. **Logic Cập nhật Profile:**
   - Người dùng điền form -> Submit.
   - Hàm `handleUpdateProfile` gọi `updateProfileMutation`.
   - Lưu thành công -> Tắt chế độ `isEditMode`.
3. **Logic Quản lý File (Upload Appwrite):**
   - File input bắt sự kiện `onChange`. Nếu có file, khóa input (`isFilesUploading = true`).
   - Push file lên `Appwrite Storage` sử dụng `storage.createFile`. Lấy Appwrite file ID và URL public.
   - Gửi file metadata (Tên file, URL, ID) xuống API `/api/candidate/files` (POST) để lưu vào Database hệ thống.
   - Refresh lại danh sách files.

### Yêu cầu thêm/Ngoại lệ (Edge Cases)
- **File Upload Lỗi Giữa Chừng:** Nếu tải file lên Appwrite thành công nhưng lưu vào Database thất bại, sẽ hiển thị lỗi "Không thể lưu tệp vào hệ thống". Có thể để lại file rác trên Appwrite, tuy nhiên thao tác này tránh việc frontend lưu sai DB.
- **Dữ liệu Null/Undefined:** Nếu profile chưa hoàn thiện, các thông tin trống (như Title, Phone) sẽ hiển thị ký tự thay thế `—` để giữ bố cục thiết kế.
- **Appwrite Not Configured:** Nếu biến môi trường Appwrite không đầy đủ, sẽ chặn tải lên để tránh crash app.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

### Tổng quan API
| Endpoint | Method | Chức năng |
| :--- | :--- | :--- |
| `/api/candidate/profile` | GET / PUT | Lấy/Cập nhật thông tin profile ứng viên. |
| `/api/auth/password` | POST | Thay đổi mật khẩu người dùng. |
| `/api/candidate/files` | GET / POST | Lấy danh sách tệp đính kèm hoặc Lưu metadata tệp mới. |
| `/api/candidate/files/[id]` | PUT / DELETE | Đổi tên tệp hoặc xóa tệp. |

### Đặc tả Request / Response
**1. Request Cập nhật Profile (PUT `/api/candidate/profile`):**
```json
{
  "fullName": "Nguyen Van A",
  "email": "a@gmail.com",
  "phone": "0123456789",
  "title": "Frontend Dev",
  "years_experience": 2
}
```

**2. Request Xóa Tệp (DELETE `/api/candidate/files/[id]`):**
- Method: `DELETE`
- Logic Backend kỳ vọng:
  1. Lấy thông tin tệp từ DB (tìm Appwrite ID).
  2. Xóa metadata tệp trong DB.
  3. *(Lý tưởng)* Xóa tệp thực tế trên Appwrite bucket.

**3. Response Chung (Thành công):**
```json
{
  "success": true,
  "data": { ... } // Tuỳ API trả về dữ liệu tương ứng
}
```
