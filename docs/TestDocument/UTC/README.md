# UTC - User Test Case

Tài liệu test case dạng bảng cho từng module của hệ thống **ATS (Applicant Tracking System)**.  
Mỗi file chứa bảng test case dành cho manual testing, sinh từ tài liệu Detail Design tương ứng.

---

## Danh sách module

| Module | Tên module | File | Số TC |
|--------|-----------|------|-------|
| A | Khu vực Công khai (Public & Landing) | [UTC_A_Public_Landing.md](./UTC_A_Public_Landing.md) | 40+ |
| B | Xác thực (Authentication) | [UTC_B_Authentication.md](./UTC_B_Authentication.md) | 60+ |
| C | Khu vực của Ứng viên (Candidate) | [UTC_C_Candidate.md](./UTC_C_Candidate.md) | 50+ |
| D | Quản trị chung (Dashboard Admin / HR) | [UTC_D_Dashboard.md](./UTC_D_Dashboard.md) | 40+ |
| E | Quản lý Đơn ứng tuyển | [UTC_E_Applications.md](./UTC_E_Applications.md) | 75 |
| F | Quản lý Phỏng vấn | [UTC_F_Interviews.md](./UTC_F_Interviews.md) | 80 |
| G | Quản lý Công việc | [UTC_G_Jobs.md](./UTC_G_Jobs.md) | 72 |

---

## Cấu trúc bảng test case

| Cột | Mô tả |
|-----|-------|
| **No.** | Số thứ tự tăng dần |
| **Item test** | Tên màn hình / action + nội dung kiểm tra |
| **Điều kiện test** | Trạng thái / dữ liệu trước khi test |
| **Kết quả mong đợi / cách xác nhận** | Hành vi và message kỳ vọng |
| **Kết quả test - 1st** | Kết quả lần test 1 |
| **Kết quả test - 2nd** | Kết quả lần test 2 |
| **Kết quả test - 3rd** | Kết quả lần test 3 |
| **Note** | Ghi chú cho tester |

---

## Nhóm test case chuẩn (mỗi module)

1. Khởi tạo màn hình / giá trị mặc định
2. Validation input (required, maxlength, kiểu dữ liệu, biên)
3. Phân quyền / điều hướng (role-based access)
4. Button / action chính
5. Xử lý API thất bại (401, 403, 404, 409, 500)
6. Xử lý API thành công
7. Filter / Table / Search / Pagination (nếu có)
8. Message / toast / popup

---

## Tài liệu liên quan

| Loại | Đường dẫn |
|------|----------|
| Detail Design | [../DetailDesign/](../DetailDesign/) |
| UTE (Unit Test Evidence) | [../UTE/](../UTE/) |
| ITC (Integration Test Case) | [../ITC/](../ITC/) |
| ITE (Test Data) | [../ITE/](../ITE/) |
| Kiến trúc hệ thống | [../../ARCHITECTURE.md](../../ARCHITECTURE.md) |

---

*Cập nhật: 2026-05-17*
