-- ============================================================================
-- ResumeAI - Production MySQL Database Schema
-- Compatible with XAMPP MySQL 8.x
-- Generated from Prisma schema
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- Database Creation (if needed)
-- ============================================================================
-- CREATE DATABASE IF NOT EXISTS resume_ai_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE resume_ai_dev;

-- ============================================================================
-- Enums (MySQL doesn't have native enums, using ENUM type directly)
-- ============================================================================

-- ============================================================================
-- Tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: users
-- ----------------------------------------------------------------------------
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
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_email_key` (`email`),
  INDEX `users_email_idx` (`email`),
  INDEX `users_oauth_provider_oauth_uid_idx` (`oauth_provider`, `oauth_uid`),
  INDEX `users_experience_level_idx` (`experience_level`),
  INDEX `users_created_at_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: templates
-- ----------------------------------------------------------------------------
CREATE TABLE `templates` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('PROFESSIONAL', 'CREATIVE', 'MINIMAL', 'TECHNICAL', 'ACADEMIC') NOT NULL DEFAULT 'PROFESSIONAL',
  `thumbnail_url` TEXT NOT NULL,
  `html_template` LONGTEXT NOT NULL,
  `css_styles` LONGTEXT NOT NULL,
  `is_premium` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `templates_category_is_active_idx` (`category`, `is_active`),
  INDEX `templates_is_premium_sort_order_idx` (`is_premium`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: subscriptions
-- ----------------------------------------------------------------------------
CREATE TABLE `subscriptions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `plan` ENUM('FREE', 'STARTER', 'PRO') NOT NULL DEFAULT 'FREE',
  `status` ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `subscriptions_user_id_key` (`user_id`),
  INDEX `subscriptions_user_id_idx` (`user_id`),
  INDEX `subscriptions_plan_status_idx` (`plan`, `status`),
  CONSTRAINT `subscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: resumes
-- ----------------------------------------------------------------------------
CREATE TABLE `resumes` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `template_id` VARCHAR(36) NOT NULL,
  `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `ats_score` INT NOT NULL DEFAULT 0,
  `overall_score` INT NOT NULL DEFAULT 0,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `resumes_user_id_idx` (`user_id`),
  INDEX `resumes_template_id_idx` (`template_id`),
  INDEX `resumes_user_id_status_idx` (`user_id`, `status`),
  INDEX `resumes_is_primary_user_id_idx` (`is_primary`, `user_id`),
  INDEX `resumes_overall_score_idx` (`overall_score`),
  INDEX `resumes_ats_score_idx` (`ats_score`),
  INDEX `resumes_created_at_idx` (`created_at`),
  CONSTRAINT `resumes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `resumes_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: resume_sections
-- ----------------------------------------------------------------------------
CREATE TABLE `resume_sections` (
  `id` VARCHAR(36) NOT NULL,
  `resume_id` VARCHAR(36) NOT NULL,
  `section_type` ENUM('CONTACT', 'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS', 'CERTIFICATIONS', 'LANGUAGES', 'AWARDS', 'CUSTOM') NOT NULL,
  `section_order` INT NOT NULL,
  `content` JSON NOT NULL,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `ai_score` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `resume_sections_resume_id_idx` (`resume_id`),
  INDEX `resume_sections_resume_id_section_type_idx` (`resume_id`, `section_type`),
  INDEX `resume_sections_section_order_idx` (`section_order`),
  CONSTRAINT `resume_sections_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: resume_versions
-- ----------------------------------------------------------------------------
CREATE TABLE `resume_versions` (
  `id` VARCHAR(36) NOT NULL,
  `resume_id` VARCHAR(36) NOT NULL,
  `version_name` VARCHAR(255) NOT NULL,
  `resume_data` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `resume_versions_resume_id_idx` (`resume_id`),
  INDEX `resume_versions_resume_id_created_at_idx` (`resume_id`, `created_at`),
  CONSTRAINT `resume_versions_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: ai_feedbacks
-- ----------------------------------------------------------------------------
CREATE TABLE `ai_feedbacks` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `resume_id` VARCHAR(36) NULL,
  `section_id` VARCHAR(36) NULL,
  `module_name` ENUM('BULLET_IMPROVER', 'ATS_ANALYZER', 'JD_EXTRACTOR', 'RESUME_COACH', 'ROAST_ENGINE', 'SCORING_ENGINE', 'QUESTION_ENGINE', 'RECRUITER_SIM') NOT NULL,
  `original_text` TEXT NOT NULL,
  `ai_response` TEXT NOT NULL,
  `token_usage` INT NOT NULL DEFAULT 0,
  `helpfulness_rating` INT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ai_feedbacks_user_id_idx` (`user_id`),
  INDEX `ai_feedbacks_resume_id_idx` (`resume_id`),
  INDEX `ai_feedbacks_section_id_idx` (`section_id`),
  INDEX `ai_feedbacks_user_id_module_name_idx` (`user_id`, `module_name`),
  INDEX `ai_feedbacks_created_at_idx` (`created_at`),
  CONSTRAINT `ai_feedbacks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ai_feedbacks_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ai_feedbacks_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `resume_sections` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: job_descriptions
-- ----------------------------------------------------------------------------
CREATE TABLE `job_descriptions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NULL,
  `raw_text` LONGTEXT NOT NULL,
  `extracted_data` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `job_descriptions_user_id_idx` (`user_id`),
  INDEX `job_descriptions_created_at_idx` (`created_at`),
  CONSTRAINT `job_descriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: ats_scores
-- ----------------------------------------------------------------------------
CREATE TABLE `ats_scores` (
  `id` VARCHAR(36) NOT NULL,
  `resume_id` VARCHAR(36) NOT NULL,
  `job_description_id` VARCHAR(36) NULL,
  `overall_score` INT NOT NULL,
  `keyword_score` INT NOT NULL,
  `format_score` INT NOT NULL,
  `impact_score` INT NOT NULL,
  `readability_score` INT NOT NULL,
  `breakdown` JSON NOT NULL,
  `missing_keywords` JSON NOT NULL,
  `suggestions` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ats_scores_resume_id_idx` (`resume_id`),
  INDEX `ats_scores_job_description_id_idx` (`job_description_id`),
  INDEX `ats_scores_resume_id_job_description_id_idx` (`resume_id`, `job_description_id`),
  INDEX `ats_scores_overall_score_idx` (`overall_score`),
  INDEX `ats_scores_created_at_idx` (`created_at`),
  CONSTRAINT `ats_scores_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ats_scores_job_description_id_fkey` FOREIGN KEY (`job_description_id`) REFERENCES `job_descriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: exports
-- ----------------------------------------------------------------------------
CREATE TABLE `exports` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `resume_id` VARCHAR(36) NOT NULL,
  `version_id` VARCHAR(36) NULL,
  `export_type` ENUM('PDF', 'DOCX') NOT NULL,
  `file_url` TEXT NOT NULL,
  `file_size_kb` INT NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `exports_user_id_idx` (`user_id`),
  INDEX `exports_resume_id_idx` (`resume_id`),
  INDEX `exports_version_id_idx` (`version_id`),
  INDEX `exports_user_id_created_at_idx` (`user_id`, `created_at`),
  INDEX `exports_expires_at_idx` (`expires_at`),
  CONSTRAINT `exports_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exports_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exports_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `resume_versions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: usage_logs
-- ----------------------------------------------------------------------------
CREATE TABLE `usage_logs` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `action_type` VARCHAR(255) NOT NULL,
  `metadata` JSON NOT NULL,
  `ip_address` VARCHAR(255) NULL,
  `user_agent` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `usage_logs_user_id_idx` (`user_id`),
  INDEX `usage_logs_action_type_idx` (`action_type`),
  INDEX `usage_logs_user_id_action_type_idx` (`user_id`, `action_type`),
  INDEX `usage_logs_created_at_idx` (`created_at`),
  CONSTRAINT `usage_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Index Optimization Summary
-- ============================================================================
-- All indexes are optimized for:
-- - Foreign key lookups (standard FK indexes)
-- - Common query patterns (composite indexes for frequent WHERE clauses)
-- - Time-based queries (created_at indexes for analytics)
-- - Sorting and filtering (composite indexes for ORDER BY + WHERE)
-- - Unique constraints (email, OAuth IDs, subscription user_id)
-- 
-- Performance considerations:
-- - JSON columns used for flexible data storage (resume content, AI responses)
-- - TEXT/LONGTEXT for large content (HTML templates, AI responses)
-- - VARCHAR(36) for UUID primary keys (compatible with Prisma's default)
-- - ENUM types for fixed value sets (experience levels, statuses, etc.)
-- - DATETIME(3) for millisecond precision timestamps
-- - ON DELETE CASCADE for referential integrity
-- - ON DELETE SET NULL for optional relationships
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;
