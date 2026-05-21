-- ============================================================
-- ATS (Applicant Tracking System) – MySQL Schema
-- PostgreSQL → MySQL adaptation
-- UUID via CHAR(36) + uuid() | ENUMs inline
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================
-- 1. USERS – Bảng người dùng trung tâm (RBAC)
-- ============================================================
CREATE TABLE users (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL     COMMENT 'NULL nếu dùng Social Login',
    full_name     VARCHAR(255) NOT NULL,
    phone         VARCHAR(20)  NULL,
    role          ENUM('candidate','admin','hr','interviewer') NOT NULL DEFAULT 'candidate',
    avatar_url    TEXT         NULL,
    provider      VARCHAR(50)  NULL     COMMENT 'google / facebook / local',
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    last_login_at DATETIME     NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bảng người dùng trung tâm – RBAC';


-- ============================================================
-- 2. CANDIDATE_PROFILES – Hồ sơ chi tiết ứng viên (1-1 với USERS)
-- ============================================================
CREATE TABLE candidate_profiles (
    id               CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id          CHAR(36)     NOT NULL,
    title            VARCHAR(255) NULL     COMMENT 'VD: Senior Backend Dev',
    bio              TEXT         NULL,
    location         VARCHAR(255) NULL,
    years_experience SMALLINT     NOT NULL DEFAULT 0,
    -- MySQL không có TEXT[] → dùng JSON array thay thế
    skills           JSON         NULL     COMMENT 'Mảng kỹ năng, VD: ["Java","Python"]',
    education        JSON         NULL     COMMENT '[{degree, school, graduation_year}]',
    linkedin_url     VARCHAR(500) NULL,
    github_url       VARCHAR(500) NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_candidate_profiles_user_id (user_id),
    CONSTRAINT fk_cp_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Hồ sơ chi tiết ứng viên – 1-1 với users';

-- Index JSON skills để tìm kiếm nhanh hơn (MySQL 8.0+)
-- Dùng generated column để đánh index trên JSON array
-- (Optional – bật khi cần full-text search trên skills)
-- ALTER TABLE candidate_profiles
--   ADD COLUMN skills_search TEXT GENERATED ALWAYS AS (JSON_UNQUOTE(skills)) STORED,
--   ADD FULLTEXT INDEX ft_candidate_skills (skills_search);


-- ============================================================
-- 3. JOBS – Tin tuyển dụng
-- ============================================================
CREATE TABLE jobs (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()),
    created_by      CHAR(36)     NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT         NOT NULL,
    requirements    TEXT         NULL,
    benefits        TEXT         NULL,
    location        VARCHAR(255) NULL,
    department      VARCHAR(100) NULL     COMMENT 'VD: Engineering, Product, Sales',
    category        VARCHAR(100) NULL     COMMENT 'VD: Backend, Frontend, DevOps',
    salary_min      INT          NULL     COMMENT 'Lương tối thiểu (VND)',
    salary_max      INT          NULL     COMMENT 'Lương tối đa (VND)',
    employment_type ENUM('full_time','part_time','contract') NOT NULL DEFAULT 'full_time',
    -- MySQL không có TEXT[] → dùng JSON array
    required_skills JSON         NULL     COMMENT 'Kỹ năng yêu cầu, VD: ["Java","Spring"]',
    headcount       SMALLINT     NOT NULL DEFAULT 1,
    status          ENUM('draft','pending','active','closed','archived') NOT NULL DEFAULT 'draft',
    expires_at      DATE         NULL,
    published_at    DATETIME     NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_jobs_status (status),
    INDEX idx_jobs_created_by (created_by),
    INDEX idx_jobs_expires_at (expires_at),
    CONSTRAINT fk_jobs_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tin tuyển dụng – draft→active→closed→archived';


-- ============================================================
-- 4. JOB_CHANNELS – Multi-channel posting
-- ============================================================
CREATE TABLE job_channels (
    id            CHAR(36) NOT NULL DEFAULT (UUID()),
    job_id        CHAR(36) NOT NULL,
    channel       ENUM('linkedin','itviec','topcv','vietnamworks','website') NOT NULL,
    external_url  TEXT         NULL,
    external_id   VARCHAR(255) NULL,
    status        ENUM('pending','posted','failed','expired','removed') NOT NULL DEFAULT 'pending',
    posted_at     DATETIME     NULL,
    expires_at    DATETIME     NULL,
    error_message TEXT         NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    -- Một job chỉ đăng 1 lần trên mỗi kênh
    UNIQUE KEY uq_job_channel (job_id, channel),
    INDEX idx_job_channels_status (status),
    CONSTRAINT fk_jc_job
        FOREIGN KEY (job_id) REFERENCES jobs (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Multi-channel posting: LinkedIn, ITviec, TopCV, VietnamWorks';


-- ============================================================
-- 5. APPLICATIONS – Đơn ứng tuyển
-- ============================================================
CREATE TABLE applications (
    id             CHAR(36) NOT NULL DEFAULT (UUID()),
    job_id         CHAR(36) NOT NULL,
    candidate_id   CHAR(36) NOT NULL,
    cv_file_url    TEXT         NOT NULL,
    cv_filename    VARCHAR(255) NULL,
    cover_letter   TEXT         NULL,
    status         ENUM('applied','screening','interviewing','offered','hired','rejected')
                               NOT NULL DEFAULT 'applied',
    source_channel ENUM('linkedin','itviec','topcv','vietnamworks','website') NULL,
    applied_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    -- Tránh ứng viên nộp trùng đơn cho cùng job
    UNIQUE KEY uq_application (job_id, candidate_id),
    INDEX idx_applications_status (status),
    INDEX idx_applications_candidate_id (candidate_id),
    CONSTRAINT fk_app_job
        FOREIGN KEY (job_id) REFERENCES jobs (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_app_candidate
        FOREIGN KEY (candidate_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Đơn ứng tuyển – pipeline ATS';


-- ============================================================
-- 6. APPLICATION_STATUS_HISTORY – Audit trail trạng thái đơn
-- ============================================================
CREATE TABLE application_status_history (
    id             CHAR(36)     NOT NULL DEFAULT (UUID()),
    application_id CHAR(36)     NOT NULL,
    changed_by     CHAR(36)     NOT NULL,
    from_status    VARCHAR(50)  NULL     COMMENT 'NULL nếu là trạng thái đầu tiên',
    to_status      VARCHAR(50)  NOT NULL,
    note           TEXT         NULL,
    changed_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_ash_application_id (application_id),
    INDEX idx_ash_changed_at (changed_at),
    CONSTRAINT fk_ash_application
        FOREIGN KEY (application_id) REFERENCES applications (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ash_changed_by
        FOREIGN KEY (changed_by) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Audit trail – lịch sử thay đổi trạng thái đơn ứng tuyển';


-- ============================================================
-- 7. INTERVIEWS – Lịch phỏng vấn
-- ============================================================
CREATE TABLE interviews (
    id               CHAR(36)     NOT NULL DEFAULT (UUID()),
    application_id   CHAR(36)     NOT NULL,
    interviewer_id   CHAR(36)     NOT NULL,
    scheduled_at     DATETIME     NOT NULL,
    duration_minutes SMALLINT     NOT NULL DEFAULT 60,
    type             ENUM('phone','video','onsite','technical') NOT NULL DEFAULT 'video',
    status           ENUM('scheduled','completed','cancelled','rescheduled') NOT NULL DEFAULT 'scheduled',
    meeting_link     TEXT         NULL,
    location         VARCHAR(255) NULL     COMMENT 'Địa chỉ nếu phỏng vấn onsite',
    notes            TEXT         NULL     COMMENT 'Ghi chú nội bộ – không hiện với ứng viên',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_interviews_application_id (application_id),
    INDEX idx_interviews_interviewer_id (interviewer_id),
    INDEX idx_interviews_scheduled_at (scheduled_at),
    CONSTRAINT fk_iv_application
        FOREIGN KEY (application_id) REFERENCES applications (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_iv_interviewer
        FOREIGN KEY (interviewer_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lịch phỏng vấn – trigger gửi email mời tự động';


-- ============================================================
-- 8. INTERVIEW_SCORES – Scorecard đánh giá
-- ============================================================
CREATE TABLE interview_scores (
    id                  CHAR(36)    NOT NULL DEFAULT (UUID()),
    interview_id        CHAR(36)    NOT NULL,
    evaluator_id        CHAR(36)    NOT NULL,
    technical_score     TINYINT     NULL,
    communication_score TINYINT     NULL,
    cultural_fit_score  TINYINT     NULL,
    overall_score       TINYINT     NULL,
    strengths           TEXT        NULL,
    weaknesses          TEXT        NULL,
    feedback            TEXT        NULL,
    result              ENUM('pass','fail','hold') NOT NULL,
    is_final            TINYINT(1)  NOT NULL DEFAULT 0 COMMENT 'TRUE = kết quả quyết định của vòng',
    created_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    -- Mỗi evaluator chỉ có 1 scorecard cho 1 buổi phỏng vấn
    UNIQUE KEY uq_interview_score (interview_id, evaluator_id),
    INDEX idx_is_evaluator_id (evaluator_id),

    CONSTRAINT chk_technical_score     CHECK (technical_score     BETWEEN 1 AND 5),
    CONSTRAINT chk_communication_score CHECK (communication_score BETWEEN 1 AND 5),
    CONSTRAINT chk_cultural_fit_score  CHECK (cultural_fit_score  BETWEEN 1 AND 5),
    CONSTRAINT chk_overall_score       CHECK (overall_score       BETWEEN 1 AND 5),

    CONSTRAINT fk_is_interview
        FOREIGN KEY (interview_id) REFERENCES interviews (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_is_evaluator
        FOREIGN KEY (evaluator_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Scorecard đánh giá phỏng vấn – chuẩn hóa tránh đánh giá chủ quan';


-- ============================================================
-- 9. EMAIL_LOGS – Audit trail email tự động
-- ============================================================
CREATE TABLE email_logs (
    id             CHAR(36)     NOT NULL DEFAULT (UUID()),
    application_id CHAR(36)     NOT NULL,
    recipient_id   CHAR(36)     NOT NULL,
    sender_id      CHAR(36)     NULL     DEFAULT NULL COMMENT 'NULL = system auto-send',
    subject        VARCHAR(500) NOT NULL,
    type           ENUM('invite','result','reminder','rejection','offer') NOT NULL,
    status         ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
    sent_at        DATETIME     NULL,
    error_message  TEXT         NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_el_application_id (application_id),
    INDEX idx_el_recipient_id (recipient_id),
    INDEX idx_el_status (status),
    CONSTRAINT fk_el_application
        FOREIGN KEY (application_id) REFERENCES applications (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_el_recipient
        FOREIGN KEY (recipient_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_el_sender
        FOREIGN KEY (sender_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Audit trail email tự động trong hệ thống';
 

SET FOREIGN_KEY_CHECKS = 1;