-- AlterTable: thêm cột slug vào bảng jobs
-- Bước 1: thêm cột nullable để tránh lỗi với dữ liệu cũ
ALTER TABLE `jobs` ADD COLUMN `slug` VARCHAR(300) NULL;

-- Bước 2: điền slug tạm = id cho các bản ghi cũ
--   (admin có thể cập nhật slug qua dashboard sau khi deploy)
UPDATE `jobs` SET `slug` = `id` WHERE `slug` IS NULL;

-- Bước 3: đổi thành NOT NULL
ALTER TABLE `jobs` MODIFY COLUMN `slug` VARCHAR(300) NOT NULL;

-- Bước 4: thêm unique constraint
ALTER TABLE `jobs` ADD UNIQUE INDEX `uq_jobs_slug`(`slug`);

-- Bước 5: thêm index tìm kiếm nhanh theo slug
ALTER TABLE `jobs` ADD INDEX `idx_jobs_slug`(`slug`);
