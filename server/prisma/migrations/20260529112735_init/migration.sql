-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` TEXT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `avatar_url` TEXT NULL,
    `target_role` VARCHAR(255) NULL,
    `experience_level` ENUM('INTERN', 'ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE') NOT NULL DEFAULT 'ENTRY',
    `preferred_lang` ENUM('en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'pt', 'ar') NOT NULL DEFAULT 'en',
    `oauth_provider` ENUM('GOOGLE', 'GITHUB', 'LINKEDIN') NULL,
    `oauth_uid` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `templates` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('PROFESSIONAL', 'CREATIVE', 'MINIMAL', 'TECHNICAL', 'ACADEMIC') NOT NULL DEFAULT 'PROFESSIONAL',
    `thumbnail_url` TEXT NOT NULL,
    `html_template` LONGTEXT NOT NULL,
    `css_styles` LONGTEXT NOT NULL,
    `is_premium` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `plan` ENUM('FREE', 'STARTER', 'PRO') NOT NULL DEFAULT 'FREE',
    `razorpay_sub_id` VARCHAR(255) NULL,
    `razorpay_customer_id` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE') NOT NULL DEFAULT 'ACTIVE',
    `current_period_start` DATETIME(3) NOT NULL,
    `current_period_end` DATETIME(3) NOT NULL,
    `cancel_at_period_end` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscriptions_user_id_key`(`user_id`),
    UNIQUE INDEX `subscriptions_razorpay_sub_id_key`(`razorpay_sub_id`),
    UNIQUE INDEX `subscriptions_razorpay_customer_id_key`(`razorpay_customer_id`),
    INDEX `subscriptions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resumes` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `template_id` VARCHAR(36) NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `ats_score` INTEGER NOT NULL DEFAULT 0,
    `overall_score` INTEGER NOT NULL DEFAULT 0,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resumes_user_id_idx`(`user_id`),
    INDEX `resumes_template_id_idx`(`template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_sections` (
    `id` VARCHAR(36) NOT NULL,
    `resume_id` VARCHAR(36) NOT NULL,
    `section_type` ENUM('CONTACT', 'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS', 'CERTIFICATIONS', 'LANGUAGES', 'AWARDS', 'CUSTOM') NOT NULL,
    `section_order` INTEGER NOT NULL,
    `content` JSON NOT NULL,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `ai_score` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resume_sections_resume_id_idx`(`resume_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_versions` (
    `id` VARCHAR(36) NOT NULL,
    `resume_id` VARCHAR(36) NOT NULL,
    `version_name` VARCHAR(255) NOT NULL,
    `resume_data` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `resume_versions_resume_id_idx`(`resume_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_feedbacks` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `resume_id` VARCHAR(36) NULL,
    `section_id` VARCHAR(36) NULL,
    `module_name` ENUM('BULLET_IMPROVER', 'ATS_ANALYZER', 'JD_EXTRACTOR', 'RESUME_COACH', 'ROAST_ENGINE', 'SCORING_ENGINE', 'QUESTION_ENGINE', 'RECRUITER_SIM') NOT NULL,
    `original_text` TEXT NOT NULL,
    `ai_response` TEXT NOT NULL,
    `token_usage` INTEGER NOT NULL DEFAULT 0,
    `helpfulness_rating` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_feedbacks_user_id_idx`(`user_id`),
    INDEX `ai_feedbacks_resume_id_idx`(`resume_id`),
    INDEX `ai_feedbacks_section_id_idx`(`section_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_descriptions` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NULL,
    `raw_text` LONGTEXT NOT NULL,
    `extracted_data` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `job_descriptions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ats_scores` (
    `id` VARCHAR(36) NOT NULL,
    `resume_id` VARCHAR(36) NOT NULL,
    `job_description_id` VARCHAR(36) NULL,
    `overall_score` INTEGER NOT NULL,
    `keyword_score` INTEGER NOT NULL,
    `format_score` INTEGER NOT NULL,
    `impact_score` INTEGER NOT NULL,
    `readability_score` INTEGER NOT NULL,
    `breakdown` JSON NOT NULL,
    `missing_keywords` JSON NOT NULL,
    `suggestions` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ats_scores_resume_id_idx`(`resume_id`),
    INDEX `ats_scores_job_description_id_idx`(`job_description_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exports` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `resume_id` VARCHAR(36) NOT NULL,
    `version_id` VARCHAR(36) NULL,
    `export_type` ENUM('PDF', 'DOCX') NOT NULL,
    `file_url` TEXT NOT NULL,
    `file_size_kb` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exports_user_id_idx`(`user_id`),
    INDEX `exports_resume_id_idx`(`resume_id`),
    INDEX `exports_version_id_idx`(`version_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usage_logs` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `action_type` VARCHAR(255) NOT NULL,
    `metadata` JSON NOT NULL,
    `ip_address` VARCHAR(255) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `usage_logs_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_sections` ADD CONSTRAINT `resume_sections_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_versions` ADD CONSTRAINT `resume_versions_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_feedbacks` ADD CONSTRAINT `ai_feedbacks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_feedbacks` ADD CONSTRAINT `ai_feedbacks_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_feedbacks` ADD CONSTRAINT `ai_feedbacks_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `resume_sections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_descriptions` ADD CONSTRAINT `job_descriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ats_scores` ADD CONSTRAINT `ats_scores_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ats_scores` ADD CONSTRAINT `ats_scores_job_description_id_fkey` FOREIGN KEY (`job_description_id`) REFERENCES `job_descriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exports` ADD CONSTRAINT `exports_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exports` ADD CONSTRAINT `exports_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exports` ADD CONSTRAINT `exports_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `resume_versions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usage_logs` ADD CONSTRAINT `usage_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
