# Kiểm tra API tự động (smoke) — ghi log

Script **`scripts/api-smoke-test.mjs`** gọi một số endpoint REST đại diện cho các nhóm trong **UTC / ITC / ITE** (`docs/TestDocument/`), đối chiếu **status HTTP** và **envelope JSON** (`success`, vài field), rồi **ghi kết quả ra file log** trong `docs/TestDocument/logs/`.

## Điều kiện chạy

1. Database đã migrate và **`npx prisma db seed`** (hoặc `npm run postinstall` + seed) để có user/job như `prisma/seed.ts`.
2. Ứng dụng đang chạy: **`npm run dev`** hoặc **`npm run start`** (mặc định `http://localhost:3000`).

**Lưu ý:** `ITE_Master_Test_Data.md` dùng email dạng `*@test.ats`; **seed thực tế** trong repo dùng `candidate@ats.local`, `hr@ats.local`, … và mật khẩu **`Password@123`**. Script mặc định theo **seed**.

## Chạy

```bash
npm run test:api-smoke
```

Hoặc:

```bash
node scripts/api-smoke-test.mjs
```

### Biến môi trường (tuỳ chọn)

| Biến | Mặc định | Ý nghĩa |
|------|-----------|---------|
| `ATS_BASE_URL` | `http://localhost:3000` | Origin API |
| `ATS_SEED_PASSWORD` | `Password@123` | Mật khẩu user seed |
| `ATS_CANDIDATE_EMAIL` | `candidate@ats.local` | Email candidate |
| `ATS_HR_EMAIL` | `hr@ats.local` | Email HR |
| `ATS_ADMIN_EMAIL` | `admin@ats.local` | Email admin |
| `ATS_API_LOG_FILE` | *(tự sinh trong `logs/`)* | Đường dẫn file log cố định |

## Kết quả log

Mỗi lần chạy tạo file:

`docs/TestDocument/logs/api-smoke-<ISO-timestamp>.log`

Định dạng dòng:

- `[PASS] <id> — <mô tả>`
- `[FAIL] <id> — <mô tả>` kèm lý do

Cuối file có dòng **tổng số PASS/FAIL**. Exit code `0` khi không có FAIL (phù hợp CI sau này).

## Case được cover (tham chiếu tài liệu)

| ID | Ý nghĩa | Tham chiếu |
|----|---------|------------|
| PUB-001 | Danh sách job public | UTC Module A, ITC luồng tuyển dụng |
| PUB-002 | Chi tiết job theo slug | UTC Module A |
| AUTH-001 | Đăng nhập sai mật khẩu | UTC Module B |
| AUTH-002–005 | Đăng nhập + `/api/auth/me` | ITE nhóm User Accounts |
| RBAC-001–004 | Dashboard emails/interviews + RBAC | UTC Module D/F |

Mở rộng thêm case (OTP, apply job, …) bằng cách thêm `step(...)` trong `scripts/api-smoke-test.mjs`.
