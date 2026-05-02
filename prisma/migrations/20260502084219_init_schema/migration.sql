-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `role` ENUM('candidate', 'admin', 'hr', 'interviewer') NOT NULL DEFAULT 'candidate',
    `avatar_url` TEXT NULL,
    `provider` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_users_email`(`email`),
    INDEX `idx_users_is_active`(`is_active`),
    INDEX `idx_users_role`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_status_history` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `application_id` CHAR(36) NOT NULL,
    `changed_by` CHAR(36) NOT NULL,
    `from_status` VARCHAR(50) NULL,
    `to_status` VARCHAR(50) NOT NULL,
    `note` TEXT NULL,
    `changed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_ash_changed_by`(`changed_by`),
    INDEX `idx_ash_application_id`(`application_id`),
    INDEX `idx_ash_changed_at`(`changed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `job_id` CHAR(36) NOT NULL,
    `candidate_id` CHAR(36) NOT NULL,
    `cv_file_url` TEXT NOT NULL,
    `cv_filename` VARCHAR(255) NULL,
    `cover_letter` TEXT NULL,
    `status` ENUM('applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected') NOT NULL DEFAULT 'applied',
    `source_channel` ENUM('linkedin', 'itviec', 'topcv', 'vietnamworks', 'website') NULL,
    `applied_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_applications_candidate_id`(`candidate_id`),
    INDEX `idx_applications_status`(`status`),
    UNIQUE INDEX `uq_application`(`job_id`, `candidate_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `candidate_profiles` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `years_experience` SMALLINT NOT NULL DEFAULT 0,
    `skills` JSON NULL,
    `education` JSON NULL,
    `linkedin_url` VARCHAR(500) NULL,
    `github_url` VARCHAR(500) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_candidate_profiles_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_logs` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `application_id` CHAR(36) NOT NULL,
    `recipient_id` CHAR(36) NOT NULL,
    `sender_id` CHAR(36) NULL,
    `subject` VARCHAR(500) NOT NULL,
    `type` ENUM('invite', 'result', 'reminder', 'rejection', 'offer') NOT NULL,
    `status` ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    `sent_at` DATETIME(0) NULL,
    `error_message` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_el_sender`(`sender_id`),
    INDEX `idx_el_application_id`(`application_id`),
    INDEX `idx_el_recipient_id`(`recipient_id`),
    INDEX `idx_el_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interview_scores` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `interview_id` CHAR(36) NOT NULL,
    `evaluator_id` CHAR(36) NOT NULL,
    `technical_score` TINYINT NULL,
    `communication_score` TINYINT NULL,
    `cultural_fit_score` TINYINT NULL,
    `overall_score` TINYINT NULL,
    `strengths` TEXT NULL,
    `weaknesses` TEXT NULL,
    `feedback` TEXT NULL,
    `result` ENUM('pass', 'fail', 'hold') NOT NULL,
    `is_final` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_is_evaluator_id`(`evaluator_id`),
    UNIQUE INDEX `uq_interview_score`(`interview_id`, `evaluator_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interviews` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `application_id` CHAR(36) NOT NULL,
    `interviewer_id` CHAR(36) NOT NULL,
    `scheduled_at` DATETIME(0) NOT NULL,
    `duration_minutes` SMALLINT NOT NULL DEFAULT 60,
    `type` ENUM('phone', 'video', 'onsite', 'technical') NOT NULL DEFAULT 'video',
    `status` ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') NOT NULL DEFAULT 'scheduled',
    `meeting_link` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_interviews_application_id`(`application_id`),
    INDEX `idx_interviews_interviewer_id`(`interviewer_id`),
    INDEX `idx_interviews_scheduled_at`(`scheduled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_channels` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `job_id` CHAR(36) NOT NULL,
    `channel` ENUM('linkedin', 'itviec', 'topcv', 'vietnamworks', 'website') NOT NULL,
    `external_url` TEXT NULL,
    `external_id` VARCHAR(255) NULL,
    `status` ENUM('pending', 'posted', 'failed', 'expired', 'removed') NOT NULL DEFAULT 'pending',
    `posted_at` DATETIME(0) NULL,
    `expires_at` DATETIME(0) NULL,
    `error_message` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_job_channels_status`(`status`),
    UNIQUE INDEX `uq_job_channel`(`job_id`, `channel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `created_by` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `requirements` TEXT NULL,
    `benefits` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `department` VARCHAR(100) NULL,
    `category` VARCHAR(100) NULL,
    `salary_min` INTEGER NULL,
    `salary_max` INTEGER NULL,
    `employment_type` ENUM('full_time', 'part_time', 'contract') NOT NULL DEFAULT 'full_time',
    `required_skills` JSON NULL,
    `headcount` SMALLINT NOT NULL DEFAULT 1,
    `status` ENUM('draft', 'active', 'closed', 'archived') NOT NULL DEFAULT 'draft',
    `expires_at` DATE NULL,
    `published_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_jobs_title`(`title`),
    INDEX `idx_jobs_created_by`(`created_by`),
    INDEX `idx_jobs_expires_at`(`expires_at`),
    INDEX `idx_jobs_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_url` TEXT NOT NULL,
    `file_type` VARCHAR(50) NULL,
    `appwrite_id` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_files_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `application_status_history` ADD CONSTRAINT `fk_ash_application` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_status_history` ADD CONSTRAINT `fk_ash_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `fk_app_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_profiles` ADD CONSTRAINT `fk_cp_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_logs` ADD CONSTRAINT `fk_el_application` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_logs` ADD CONSTRAINT `fk_el_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_logs` ADD CONSTRAINT `fk_el_sender` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interview_scores` ADD CONSTRAINT `fk_is_evaluator` FOREIGN KEY (`evaluator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interview_scores` ADD CONSTRAINT `fk_is_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interviews` ADD CONSTRAINT `fk_iv_application` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interviews` ADD CONSTRAINT `fk_iv_interviewer` FOREIGN KEY (`interviewer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_channels` ADD CONSTRAINT `fk_jc_job` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `fk_jobs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `fk_files_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
