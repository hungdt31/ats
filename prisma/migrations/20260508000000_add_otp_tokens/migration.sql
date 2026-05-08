-- AlterTable: thêm cột email_verified vào users
ALTER TABLE `users` ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: bảng lưu mã OTP
CREATE TABLE `otp_tokens` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `email` VARCHAR(255) NOT NULL,
    `code` CHAR(60) NOT NULL,
    `type` ENUM('email_verify', 'password_reset') NOT NULL,
    `attempts` TINYINT NOT NULL DEFAULT 0,
    `expires_at` DATETIME(0) NOT NULL,
    `used_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_otp_email_type`(`email`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
