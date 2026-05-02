# ATS - Applicant Tracking System

Hệ thống quản lý tin tuyển dụng và ứng tuyển dành cho ứng viên và nhà tuyển dụng.

## Tính năng nổi bật

### 1. Dành cho Ứng viên
- **Xem tin tuyển dụng**: Tìm kiếm và lọc các công việc phù hợp.
- **Quản lý hồ sơ & tệp cá nhân (CRUD)**:
  - Tải lên CV, Portfolio, hay chứng chỉ trực tiếp lên bộ lưu trữ **Appwrite**.
  - Xem, đổi tên hoặc xóa các tệp tin cá nhân của mình.
- **Đổi mật khẩu**: Hỗ trợ đổi mật khẩu an toàn với hashing `bcrypt`.
- **Ứng tuyển công việc**:
  - Gửi thư giới thiệu và chọn CV từ tệp cá nhân hoặc tải lên tệp mới.
  - Tên tệp đính kèm tự động được trích xuất từ tệp đã tải lên.

### 2. Dành cho Nhà tuyển dụng / Quản trị viên
- **Đăng tải và quản lý công việc**: Tạo mới, chỉnh sửa thông tin việc làm.
- **Duyệt và theo dõi hồ sơ ứng viên**.

---

## Công nghệ sử dụng

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: TailwindCSS v4
- **Database ORM**: [Prisma](https://www.prisma.io/) (kết nối MariaDB/MySQL)
- **File Storage SDK**: [Appwrite](https://appwrite.io/)
- **Icon Pack**: [@hugeicons/react](https://hugeicons.com/)

---

## Hướng dẫn cài đặt và chạy dự án

### 1. Thiết lập biến môi trường
Tạo file `.env` tại thư mục gốc với các cấu hình sau:

```env
# Database connection string
DATABASE_URL="mysql://username:password@localhost:3306/ats_db"

# Appwrite configurations
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT="YOUR_PROJECT_ID"
NEXT_PUBLIC_APPWRITE_BUCKET_ID="YOUR_BUCKET_ID"
```

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 3. Đồng bộ hóa cơ sở dữ liệu
Chạy các câu lệnh Prisma để khởi tạo và sinh client:
```bash
npx prisma generate
npx prisma db push
```

### 4. Khởi chạy máy chủ phát triển
```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt để sử dụng ứng dụng.
