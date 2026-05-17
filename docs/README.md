# Tài liệu dự án — ATS (Applicant Tracking System)

Thư mục **`docs/`** tập trung tài liệu kỹ thuật và tài liệu test cho hệ thống **ATS** (Next.js App Router, JWT + RBAC, Prisma, React Query). Dùng README này để định hướng nhanh — chi tiết nằm trong từng file hoặc các `README.md` con.

---

## Tài liệu nền (đọc đầu tiên)

| Tài liệu | Mô tả |
|----------|--------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Kiến trúc, stack, auth, cấu trúc thư mục, API, React Query, RBAC |
| [DATABASE.md](./DATABASE.md) | Mô tả mô hình dữ liệu (theo Prisma schema) |
| [roadmap-trang-ats.md](./roadmap-trang-ats.md) | Roadmap route, trang, bảng DB theo module |

---

## Thiết kế chi tiết (Detail Design)

Tài liệu thiết kế theo **10 Sheet** cho 7 module **A–G**; hình ảnh wireframe/màn hình đặt trong `DetailDesign/images/`.

| Module | Nội dung | File |
|--------|-----------|------|
| A | Khu vực Công khai (Public & Landing) | [DetailDesign/Module_A_Public_Landing.md](./DetailDesign/Module_A_Public_Landing.md) |
| B | Xác thực (Authentication) | [DetailDesign/Module_B_Authentication.md](./DetailDesign/Module_B_Authentication.md) |
| C | Khu vực Ứng viên (Candidate) | [DetailDesign/Module_C_Candidate.md](./DetailDesign/Module_C_Candidate.md) |
| D | Quản trị chung (Dashboard Admin / HR) | [DetailDesign/Module_D_Dashboard.md](./DetailDesign/Module_D_Dashboard.md) |
| E | Quản lý Đơn ứng tuyển | [DetailDesign/Module_E_Applications.md](./DetailDesign/Module_E_Applications.md) |
| F | Quản lý Phỏng vấn | [DetailDesign/Module_F_Interviews.md](./DetailDesign/Module_F_Interviews.md) |
| G | Quản lý Công việc | [DetailDesign/Module_G_Jobs.md](./DetailDesign/Module_G_Jobs.md) |

**Mục lục & cấu trúc chi tiết:** [DetailDesign/README.md](./DetailDesign/README.md)

---

## Test document (`TestDocument/`)

Tất cả tài liệu test đặt dưới **[`./TestDocument/`](./TestDocument/)**. Cấu trúc gồm bốn loại sau (mỗi loại có `README.md` riêng nếu có).

| Thư mục | Viết tắt | Mô tả | Index |
|---------|----------|--------|-------|
| `TestDocument/UTC/` | UTC (User Test Case) | User test case dạng bảng theo module (định dạng cũ/thích hợp trace nhanh) | [UTC/README.md](./TestDocument/UTC/README.md) |
| `TestDocument/UTE/` | UTE (Unit Test Evidence) | Evidence / test case chi tiết theo màn hình (theo codebase) | [UTE/README.md](./TestDocument/UTE/README.md) |
| `TestDocument/ITC/` | ITC (Integration Test Case) | Test theo luồng E2E nghiệp vụ | [ITC/README.md](./TestDocument/ITC/README.md) |
| `TestDocument/ITE/` | ITE (Integration Test Evidence) | Chuẩn bị test data / bằng chứng tích hợp | [ITE/README.md](./TestDocument/ITE/README.md) |

### Ánh xạ UTC theo module (A–G)

| Module | Tên module | File UTC |
|--------|-----------|----------|
| A | Public & Landing | [TestDocument/UTC/UTC_A_Public_Landing.md](./TestDocument/UTC/UTC_A_Public_Landing.md) |
| B | Authentication | [TestDocument/UTC/UTC_B_Authentication.md](./TestDocument/UTC/UTC_B_Authentication.md) |
| C | Candidate | [TestDocument/UTC/UTC_C_Candidate.md](./TestDocument/UTC/UTC_C_Candidate.md) |
| D | Dashboard Admin / HR | [TestDocument/UTC/UTC_D_Dashboard.md](./TestDocument/UTC/UTC_D_Dashboard.md) |
| E | Đơn ứng tuyển | [TestDocument/UTC/UTC_E_Applications.md](./TestDocument/UTC/UTC_E_Applications.md) |
| F | Phỏng vấn | [TestDocument/UTC/UTC_F_Interviews.md](./TestDocument/UTC/UTC_F_Interviews.md) |
| G | Công việc | [TestDocument/UTC/UTC_G_Jobs.md](./TestDocument/UTC/UTC_G_Jobs.md) |

**Lưu ý:** các file **UTE_*_*.md**, **ITC_*.md**, **ITE_*_*.md** nằm trực tiếp trong thư mục con tương ứng; xem các `README.md` trong từng thư mục để liệ kê đầy đủ.

---

## Xuất PDF cho tài liệu Markdown

Script chuyển toàn bộ `.md` trong `docs/` sang PDF (điều chỉnh bố cục bảng, hướng trang Detail Design / TestDocument).

**File:** [`scripts/export-docs-pdf.mjs`](../scripts/export-docs-pdf.mjs)  
**Dependency:** dev dependency `md-to-pdf` (đã liệt kê trong `package.json` của repo).

Từ thư mục gốc dự án, sau `npm install`:

```bash
node scripts/export-docs-pdf.mjs
```

---

## Prompt template & nguồn chuẩn

Để tái sinh hoặc mở rộng tài liệu theo form chuẩn dự án:

| Nội dung | Thư mục |
|---------|---------|
| Template Detail Design & Test | **`PromptTemplate/`** (ngoài `docs/`, ở root repo) |

---

## Bảo trì tài liệu

- Ưu tiên căn chỉnh **Detail Design** và **UTE/ITC** với **source thật** (route, hooks, API) khi codebase thay đổi.
- Khi thêm module / loại test mới, cập nhật **README của thư mục con** tương ứng rồi bổ sung dòng vào **bảng trong file này** nếu cần thiết để onboarding nhanh.

---

*Cập nhật: 2026-05-17*
