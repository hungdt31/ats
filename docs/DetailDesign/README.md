# Detail Design Documents — ATS System

Tài liệu thiết kế chi tiết hệ thống **ATS (Applicant Tracking System)**.  
Mỗi file tương ứng một module, được xây dựng theo cấu trúc 10 Sheet chuẩn.

---

## Danh sách module

| Module | Tên module | File |
|--------|-----------|------|
| A | Khu vực Công khai (Public & Landing) | [Module_A_Public_Landing.md](./Module_A_Public_Landing.md) |
| B | Xác thực (Authentication) | [Module_B_Authentication.md](./Module_B_Authentication.md) |
| C | Khu vực của Ứng viên (Candidate) | [Module_C_Candidate.md](./Module_C_Candidate.md) |
| D | Quản trị chung (Dashboard Admin / HR) | [Module_D_Dashboard.md](./Module_D_Dashboard.md) |
| E | Quản lý Đơn ứng tuyển | [Module_E_Applications.md](./Module_E_Applications.md) |
| F | Quản lý Phỏng vấn | [Module_F_Interviews.md](./Module_F_Interviews.md) |
| G | Quản lý Công việc | [Module_G_Jobs.md](./Module_G_Jobs.md) |

---

## Cấu trúc mỗi file (10 Sheet)

| Sheet | Nội dung |
|-------|---------|
| Sheet 01 | Khái quát chức năng — danh sách chức năng, table CRUD, đối tượng sử dụng |
| Sheet 02 | IPO — nhóm chức năng, Input / Process / Output tổng quát |
| Sheet 03 | IPO Chi tiết — từng method: init, search, create, update, delete |
| Sheet 04 | Chi tiết điều khiển — toàn bộ controls: textbox, dropdown, button, table… |
| Sheet 05 | Giao diện màn hình — route, loại, tác vụ, rule hiển thị, validation |
| Sheet 06 | Thông báo — MessageCD, Success/Error/Warning/Validation/Empty Data |
| Sheet 07 | API — danh sách + chi tiết API endpoint, auth, validation, xử lý lỗi |
| Sheet 08 | Request — Header, Path/Query Params, Body, JSON example |
| Sheet 09 | Response — Items, success/error JSON example |
| Sheet 10 | SQL — câu SQL, table, tham số, kết quả, ghi chú transaction |

---

## Tham chiếu

- Kiến trúc hệ thống: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- Roadmap trang: [../roadmap-trang-ats.md](../roadmap-trang-ats.md)
- Test cases: [../TestDocument/](../TestDocument/)
- Template gốc: [../../PromptTemplate/DetailDesign/](../../PromptTemplate/DetailDesign/)

---

*Cập nhật: 2026-05-17*
