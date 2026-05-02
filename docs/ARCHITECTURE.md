# Kiến trúc dự án ATS

> Applicant Tracking System — hệ thống quản lý tuyển dụng nội bộ tích hợp job portal công khai.

---

## Công nghệ sử dụng

| Lớp | Công nghệ | Ghi chú |
|-----|-----------|---------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Server Components + Client Components |
| **Ngôn ngữ** | TypeScript 5 | Strict mode |
| **Database** | MariaDB / MySQL | Hosted riêng |
| **ORM** | Prisma 7 + `@prisma/adapter-mariadb` | Driver adapter bắt buộc với Prisma 7 |
| **Styling** | Tailwind CSS 4 | Utility-first |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI) | `components/ui/` |
| **Icons** | `@hugeicons/react` | HugeIcons free set |
| **Form** | React Hook Form + Zod | Validation schema-first |
| **Data fetching** | TanStack React Query v5 | Client-side caching & state |
| **Table** | TanStack React Table v8 | Headless table |
| **Charts** | Recharts + shadcn/chart | Biểu đồ dashboard |
| **Auth** | JWT (HS256) tự implement với `jose` | httpOnly cookie, không dùng NextAuth |
| **Toast** | Sonner | Thông báo UX |
| **Fonts** | Montserrat · Geist · Geist Mono | Google Fonts + Vercel Fonts |

---

## Luồng xác thực (Authentication Flow)

```
Client                   Next.js API Route          Database
  │                           │                         │
  ├──POST /api/auth/login──►  │                         │
  │   { email, password }     ├─── prisma.user.find ──► │
  │                           │◄── user row ────────────┤
  │                           ├─── bcrypt.compare()     │
  │                           ├─── signSessionToken()   │
  │◄── Set-Cookie: session ── │   (JWT HS256, httpOnly) │
  │                           │                         │
  ├──GET /api/auth/me ──────► │                         │
  │   (cookie tự động kèm)    ├─── verifySessionToken() │
  │◄── { user: PublicUser } ──┤                         │
```

- **JWT** ký bằng `AUTH_SECRET` (env), chứa `userId`, `email`, `fullName`, `role`
- Cookie `httpOnly; SameSite=Lax; Secure` (production)
- Không dùng database session — stateless hoàn toàn
- Server Components đọc session qua `lib/auth/session.ts → getSession()`

---

## Cấu trúc thư mục

```
ats/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — font, AppProviders
│   ├── page.tsx                  # Landing page công khai
│   ├── globals.css               # CSS variables, Tailwind base
│   │
│   ├── (auth)/                   # Route group — không thêm segment vào URL
│   │   ├── login/page.tsx        # Trang đăng nhập
│   │   └── register/page.tsx     # Trang đăng ký
│   │
│   ├── jobs/                     # Job portal công khai
│   │   ├── page.tsx              # Danh sách jobs [CLIENT]
│   │   └── [id]/
│   │       └── page.tsx          # Chi tiết job [CLIENT]
│   │
│   ├── dashboard/                # Nội bộ: admin · HR · interviewer [SERVER]
│   │   └── page.tsx
│   │
│   ├── candidate/                # Không gian ứng viên [SERVER]
│   │   └── page.tsx
│   │
│   ├── unauthorized/             # Trang 403
│   │
│   └── api/                      # Route Handlers (REST API)
│       ├── auth/
│       │   ├── login/route.ts    # POST — xác thực, phát JWT cookie
│       │   ├── logout/route.ts   # POST — xóa cookie
│       │   ├── register/route.ts # POST — tạo tài khoản mới
│       │   └── me/route.ts       # GET  — user hiện tại từ cookie
│       └── jobs/
│           ├── route.ts          # GET  — danh sách jobs active
│           └── [id]/route.ts     # GET  — chi tiết job theo id
│
├── components/
│   ├── auth/
│   │   ├── login-form.tsx        # Form đăng nhập (React Hook Form)
│   │   ├── register-form.tsx     # Form đăng ký
│   │   └── user-nav.tsx          # Avatar dropdown — logout, navigate
│   ├── landing/
│   │   └── job-card.tsx          # Thẻ preview job (danh sách & landing)
│   ├── providers/
│   │   └── app-providers.tsx     # QueryClientProvider + Toaster
│   └── ui/                       # shadcn/ui components (auto-generated)
│       ├── button.tsx
│       ├── card.tsx
│       ├── chart.tsx
│       ├── drawer.tsx
│       ├── select.tsx
│       └── ...
│
├── hooks/                        # React Query hooks (client-side)
│   ├── query-keys.ts             # Factory keys tập trung
│   ├── use-me.ts                 # useMe()   → GET /api/auth/me
│   ├── use-jobs.ts               # useJobs() → GET /api/jobs
│   └── use-job.ts                # useJob(id) → GET /api/jobs/[id]
│
├── lib/
│   ├── api-client.ts             # ApiError + apiGet/apiPost helpers
│   ├── db.ts                     # PrismaClient singleton (server-only)
│   ├── utils.ts                  # cn() — clsx + tailwind-merge
│   ├── schema.sql                # DDL gốc (tham chiếu)
│   │
│   ├── auth/
│   │   ├── constants.ts          # SESSION_COOKIE_NAME, MAX_AGE
│   │   ├── cookie-options.ts     # sessionCookieBase() — cấu hình cookie
│   │   ├── redirects.ts          # getPostLoginPath() — điều hướng sau login
│   │   ├── session.ts            # getSession() — đọc & verify JWT từ cookie
│   │   └── token.ts              # signSessionToken() / verifySessionToken()
│   │
│   ├── data/
│   │   ├── jobs.ts               # Server-only queries Prisma (getFeaturedJobs…)
│   │   └── jobs-utils.ts         # Pure utils dùng chung client+server
│   │                             # (employmentTypeLabel, formatSalaryRange)
│   │
│   ├── http/
│   │   └── json-response.ts      # jsonError() — NextResponse helper chuẩn hóa
│   │
│   └── validators/
│       └── auth.ts               # Zod schemas: loginSchema, registerSchema
│
├── prisma/
│   ├── schema.prisma             # Data model đầy đủ
│   └── seed.ts                   # Dữ liệu mẫu (tsx prisma/seed.ts)
│
├── types/
│   └── api.ts                    # Shared types: ApiSuccess, ApiErrorBody,
│                                 # PublicUser, MeResponse
│
├── public/                       # Static assets
├── .env                          # DATABASE_URL, AUTH_SECRET (không commit)
├── .env.example                  # Template biến môi trường
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Data Model (Database)

Gồm **9 model** chính:

```
users
 ├── candidate_profiles           (1-1) hồ sơ ứng viên mở rộng
 ├── jobs                         (1-N) tin tuyển dụng tạo bởi user
 │    ├── job_channels             (1-N) kênh đăng (LinkedIn, ITviec…)
 │    └── applications             (1-N) đơn ứng tuyển
 │         ├── interviews          (1-N) lịch phỏng vấn
 │         │    └── interview_scores (1-N) điểm đánh giá
 │         ├── application_status_history (1-N) lịch sử thay đổi trạng thái
 │         └── email_logs          (1-N) log email gửi đi
```

### Enum quan trọng

| Enum | Giá trị |
|------|---------|
| `UserRole` | `candidate` · `admin` · `hr` · `interviewer` |
| `jobs_status` | `draft` · `active` · `closed` · `archived` |
| `jobs_employment_type` | `full_time` · `part_time` · `contract` |
| `applications_status` | `applied` · `screening` · `interviewing` · `offered` · `hired` · `rejected` |
| `interviews_type` | `phone` · `video` · `onsite` · `technical` |
| `interviews_status` | `scheduled` · `completed` · `cancelled` · `rescheduled` |
| `interview_scores_result` | `pass` · `fail` · `hold` |

---

## API Routes

| Method | Path | Mô tả | Auth |
|--------|------|-------|------|
| `POST` | `/api/auth/login` | Đăng nhập, phát JWT cookie | Public |
| `POST` | `/api/auth/register` | Tạo tài khoản mới | Public |
| `POST` | `/api/auth/logout` | Xóa cookie session | — |
| `GET`  | `/api/auth/me` | User đang đăng nhập | Cookie |
| `GET`  | `/api/jobs` | Danh sách jobs active | Public |
| `GET`  | `/api/jobs/[id]` | Chi tiết job theo id | Public |

**Response envelope** thống nhất:

```ts
// Thành công
{ success: true, data: T }

// Lỗi
{ success: false, error: string, fieldErrors?: Record<string, string[]> }
```

---

## React Query — Caching Strategy

| Hook | Endpoint | staleTime | Retry |
|------|----------|-----------|-------|
| `useMe()` | `GET /api/auth/me` | 5 phút | false (không retry 401) |
| `useJobs()` | `GET /api/jobs` | 2 phút | mặc định |
| `useJob(id)` | `GET /api/jobs/[id]` | 5 phút | false khi 404/401 |

- **Query keys** quản lý tập trung tại `hooks/query-keys.ts`
- **DevTools** tích hợp sẵn, hiển thị chỉ ở development
- **`refetchOnWindowFocus: false`** — tắt refetch khi focus tab để tránh request thừa

---

## Phân quyền theo Role

| Route | Ai có thể vào |
|-------|---------------|
| `/` · `/jobs` · `/jobs/[id]` | Tất cả (public) |
| `/(auth)/login` · `/register` | Chưa đăng nhập |
| `/candidate` | `candidate` |
| `/dashboard` | `admin` · `hr` · `interviewer` |
| `/unauthorized` | Fallback khi truy cập sai role |

> Kiểm soát truy cập thực hiện tại **middleware** hoặc server component (đọc session từ cookie).

---

## Quy ước code

- **`server-only`** import — bảo vệ code DB/auth khỏi bị bundle vào client
- **Alias `@/`** — trỏ về root project (tsconfig paths)
- **Client Components** dùng `"use client"` + React Query hooks để fetch
- **Server Components** gọi trực tiếp Prisma hoặc `lib/data/*.ts`
- **Pure utilities** không phụ thuộc Prisma enum để ở `*-utils.ts` — dùng được ở cả hai phía
- **API route types** export từ `route.ts` để tái sử dụng ở hooks (type safety end-to-end)
