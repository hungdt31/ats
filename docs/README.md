# Test Case Documents — ATS System

Tài liệu test case cho hệ thống **ATS (Applicant Tracking System)**.

## Cấu trúc thư mục

| Thư mục | Loại tài liệu | Mô tả |
|---------|--------------|-------|
| [`UTC/`](./UTC_A_Public_Landing.md) | UTC (User Test Case) | Test case dạng bảng đơn giản theo module (legacy format) |
| [`UTE/`](./UTE/) | UTE (Unit Test Evidence) | Test evidence chi tiết từng màn hình, có header tracking |
| [`ITC/`](./ITC/) | ITC (Integration Test Case) | Test case theo luồng nghiệp vụ đầu-cuối |
| [`ITE/`](./ITE/) | ITE (Integration Test Evidence) | Dữ liệu chuẩn bị cho integration test |

---

## UTC - Danh sách module (format cũ)

| Module | Tên module | File | Số TC tối thiểu |
|--------|-----------|------|-----------------|
| A | Khu vực Công khai (Public & Landing) | [UTC_A_Public_Landing.md](./UTC_A_Public_Landing.md) | 40 |
| B | Xác thực (Authentication) | [UTC_B_Authentication.md](./UTC_B_Authentication.md) | 60 |
| C | Khu vực của Ứng viên (Candidate) | [UTC_C_Candidate.md](./UTC_C_Candidate.md) | 50 |
| D | Quản trị chung (Dashboard Admin / HR) | [UTC_D_Dashboard.md](./UTC_D_Dashboard.md) | 40 |
| E | Quản lý Đơn ứng tuyển | [UTC_E_Applications.md](./UTC_E_Applications.md) | 60 |
| F | Quản lý Phỏng vấn | [UTC_F_Interviews.md](./UTC_F_Interviews.md) | 60 |
| G | Quản lý Công việc | [UTC_G_Jobs.md](./UTC_G_Jobs.md) | 60 |

---

## Cấu trúc bảng test case

| Cột | Mô tả |
|-----|-------|
| No. | Số thứ tự tăng dần |
| Item test | Tên action / màn hình + nội dung kiểm tra |
| Điều kiện test | Trạng thái trước khi test |
| Kết quả mong đợi/cách xác nhận | Hành vi / message kỳ vọng |
| Kết quả test - 1st | Kết quả lần test 1 (○ pass / × fail / — chưa test) |
| Kết quả test - 2nd | Kết quả lần test 2 |
| Kết quả test - 3rd | Kết quả lần test 3 |
| Note | Ghi chú cho tester |

---

## Nhóm test case chuẩn (mỗi module)

1. Khởi tạo màn hình / giá trị mặc định
2. Validation input (bắt buộc, maxlength, kiểu dữ liệu, biên)
3. Phân quyền / điều hướng (role-based access)
4. Button / action chính
5. Xử lý API thất bại (401, 403, 404, 500)
6. Xử lý API thành công
7. Filter / Table / Search (nếu có)
8. CRUD (nếu có)
9. Message / toast / popup

---

## Tham chiếu

- Detail Design: [../DetailDesign/](../DetailDesign/)
- Kiến trúc: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- Template UTC Prompt: [../../PromptTemplate/TestDocument/Prompt/UTCPrompt](../../PromptTemplate/TestDocument/Prompt/UTCPrompt)

---

*Cập nhật: 2026-05-17*
