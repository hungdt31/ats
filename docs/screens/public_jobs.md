# Tài liệu Đặc tả Màn hình: Danh sách Việc Làm (Public Jobs List)

## Phần 1: Quản lý tài liệu & Thông tin chung

| Thuộc tính | Chi tiết |
| :--- | :--- |
| **Tên dự án** | ATS (Applicant Tracking System) |
| **Tên màn hình** | Danh sách Việc Làm (Công khai) |
| **Đường dẫn file** | `app/jobs/page.tsx` |
| **Người viết** | Antigravity AI |
| **Ngày tạo** | 06/05/2026 |

### Lịch sử chỉnh sửa
| Version | Ngày sửa | Người sửa | Tóm tắt nội dung sửa |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 06/05/2026 | AI | Tạo đặc tả luồng tính năng Tìm kiếm, Filter động (Dynamic Options), và Phân trang Client-side. |

---

## Phần 2: Đặc tả Nghiệp vụ (Business Specification)

### Khái quát chức năng
- **Mục đích:** Là trang cho phép ứng viên xem toàn bộ các tin tuyển dụng đang "Active" của công ty. Ứng viên có thể sử dụng các bộ lọc để tìm được vị trí phù hợp nhất với bản thân.
- **User Flow:** 
  1. Ứng viên truy cập `/jobs`.
  2. Màn hình tự động tải danh sách Jobs.
  3. Ứng viên sử dụng 4 bộ lọc (Tìm kiếm text, Địa điểm, Phòng ban, Hình thức).
  4. Xem kết quả trả về dạng Grid, theo dõi phân trang.
  5. Bấm vào một Job Card để đi vào chi tiết công việc.

### IPO Tổng quan
- **Input:** Từ khoá tìm kiếm, giá trị Filter của người dùng chọn trên giao diện.
- **Process:** 
  - Gọi API fetch toàn bộ `jobs` qua hook `useJobs()`.
  - Từ dữ liệu gốc, hệ thống **tự động phân tích (Memoize)** để tạo ra các Option List lấp vào các bộ lọc Dropdown (Không hardcode).
  - Kết hợp 4 điều kiện lọc để thu gọn danh sách (Client-side filtering).
  - Cắt mảng (Slice) dựa vào Trang hiện tại (Page size = 9).
- **Output:** Giao diện lưới Card (`JobCardPreview`), thanh Phân trang (Pagination) và các thẻ báo hiệu Empty State.

---

## Phần 3: Đặc tả Giao diện màn hình (UI/UX Specification)

### Bản vẽ giao diện
*(Chèn Mockup/Figma/Wireframe của màn hình vào đây)*
`[Hình ảnh giao diện Danh sách Public Jobs]`

### Chi tiết điều khiển
**Phần Filter Bar (Thanh công cụ lọc):**
| STT | Tên thành phần | Loại UI | Logic hoạt động |
| :--- | :--- | :--- | :--- |
| 1 | Tìm kiếm tiêu đề | Text Input | Nhập Text -> Gọi filter `toLowerCase()`. Reset Page về 1. |
| 2 | Dropdown Địa điểm | Select | Các Option được sinh tự động bằng hàm `new Set(jobs.map(j => j.location))`. |
| 3 | Dropdown Phòng ban | Select | Sinh tự động tương tự Địa điểm. |
| 4 | Dropdown Loại công việc | Select | Dịch nhãn Enum (Ví dụ: `full_time` -> "Toàn thời gian"). |
| 5 | Nút Xóa lọc | Button | Chỉ kích hoạt khi có ít nhất 1 filter thay đổi. Bấm vào reset cả 4 biến về "all" / rỗng. |

**Phần Hiển thị (Grid & Pagination):**
| STT | Tên thành phần | Loại UI | Ghi chú |
| :--- | :--- | :--- | :--- |
| 6 | Nhãn số lượng | Text | Text: "Hiển thị x-y / tổng z vị trí". |
| 7 | Job Card Preview | Component | Render thông tin Job. Click Card sẽ router sang `/jobs/[id]`. |
| 8 | Thanh Phân trang | Component | Có dấu `...` (Ellipsis) ở giữa nếu vượt quá 7 trang. |

### Danh sách thông báo (Messages)
| Mã lỗi / Tình huống | Câu thông báo | Loại |
| :--- | :--- | :--- |
| Loading | "Đang tải..." | Text |
| Lỗi mạng (API Error) | "Không thể tải danh sách việc làm. Vui lòng thử lại." | Error Block (Đỏ) |
| Server chưa có data | "Hiện chưa có tin tuyển dụng đang hoạt động." | Empty Block (Xám) |
| Lọc không ra kết quả | "Không tìm thấy việc làm phù hợp với bộ lọc." | Empty Block (Xám) |

---

## Phần 4: Đặc tả Logic & Xử lý chi tiết (Detailed Processing)

### Chi tiết IPO
1. **Logic Dynamic Options (Trích xuất Filter động):**
   - Thay vì Hard-code địa điểm "Hà Nội, HCM", hệ thống dùng `useMemo` duyệt qua toàn bộ Data API trả về.
   - Nhặt `location` ra, ném vào `new Set()` để loại bỏ trùng lặp, sau đó convert về Array -> Set thẳng vào thẻ `<SelectItem>`. Giúp Filter luôn khớp chính xác 100% với Data thực tế.
2. **Logic Phân trang thuật toán (Ellipsis Pagination):**
   - Nếu tổng trang `<= 7`: Hiển thị full `[1, 2, 3, 4, 5, 6, 7]`.
   - Nếu người dùng đang đứng ở gần đầu (Trang `<= 4`): Hiện `[1, 2, 3, 4, 5, "...", Total]`.
   - Nếu đang đứng gần cuối: Hiện `[1, "...", Total-4, Total-3, Total-2, Total-1, Total]`.
   - Ở giữa: Hiện `[1, "...", Current-1, Current, Current+1, "...", Total]`.
   - Thuật toán giúp UI thanh chuyển trang gọn gàng, không bị tràn trên Mobile.

---

## Phần 5: Đặc tả Kỹ thuật (Technical/Backend Specification)

| Khối Logic | Tham chiếu | Chức năng |
| :--- | :--- | :--- |
| **Fetch Hooks** | `useJobs()` (`@/hooks/use-jobs`) | Gọi API lấy Array chứa các Jobs có trạng thái `active`. Cache dữ liệu bằng React Query. |
| **Format Utils** | `employmentTypeLabel()` | Hàm Helper nhận mã Enum của hệ thống (`full_time`) và trả về chuỗi hiển thị thân thiện (Việt hóa). |
