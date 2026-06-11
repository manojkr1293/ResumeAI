/*
  Warnings:

  - You are about to drop the column `cancel_at_period_end` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `current_period_end` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `current_period_start` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `razorpay_customer_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `razorpay_sub_id` on the `subscriptions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `resumes` DROP FOREIGN KEY `resumes_template_id_fkey`;

-- DropIndex
DROP INDEX `subscriptions_razorpay_customer_id_key` ON `subscriptions`;

-- DropIndex
DROP INDEX `subscriptions_razorpay_sub_id_key` ON `subscriptions`;

-- AlterTable
ALTER TABLE `resumes` MODIFY `template_id` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `subscriptions` DROP COLUMN `cancel_at_period_end`,
    DROP COLUMN `current_period_end`,
    DROP COLUMN `current_period_start`,
    DROP COLUMN `razorpay_customer_id`,
    DROP COLUMN `razorpay_sub_id`;

-- CreateIndex
CREATE INDEX `ai_feedbacks_user_id_module_name_idx` ON `ai_feedbacks`(`user_id`, `module_name`);

-- CreateIndex
CREATE INDEX `ai_feedbacks_created_at_idx` ON `ai_feedbacks`(`created_at`);

-- CreateIndex
CREATE INDEX `ats_scores_resume_id_job_description_id_idx` ON `ats_scores`(`resume_id`, `job_description_id`);

-- CreateIndex
CREATE INDEX `ats_scores_overall_score_idx` ON `ats_scores`(`overall_score`);

-- CreateIndex
CREATE INDEX `ats_scores_created_at_idx` ON `ats_scores`(`created_at`);

-- CreateIndex
CREATE INDEX `exports_user_id_created_at_idx` ON `exports`(`user_id`, `created_at`);

-- CreateIndex
CREATE INDEX `exports_expires_at_idx` ON `exports`(`expires_at`);

-- CreateIndex
CREATE INDEX `job_descriptions_created_at_idx` ON `job_descriptions`(`created_at`);

-- CreateIndex
CREATE INDEX `resume_sections_resume_id_section_type_idx` ON `resume_sections`(`resume_id`, `section_type`);

-- CreateIndex
CREATE INDEX `resume_sections_section_order_idx` ON `resume_sections`(`section_order`);

-- CreateIndex
CREATE INDEX `resume_versions_resume_id_created_at_idx` ON `resume_versions`(`resume_id`, `created_at`);

-- CreateIndex
CREATE INDEX `resumes_user_id_status_idx` ON `resumes`(`user_id`, `status`);

-- CreateIndex
CREATE INDEX `resumes_is_primary_user_id_idx` ON `resumes`(`is_primary`, `user_id`);

-- CreateIndex
CREATE INDEX `resumes_overall_score_idx` ON `resumes`(`overall_score`);

-- CreateIndex
CREATE INDEX `resumes_ats_score_idx` ON `resumes`(`ats_score`);

-- CreateIndex
CREATE INDEX `resumes_created_at_idx` ON `resumes`(`created_at`);

-- CreateIndex
CREATE INDEX `subscriptions_plan_status_idx` ON `subscriptions`(`plan`, `status`);

-- CreateIndex
CREATE INDEX `templates_category_is_active_idx` ON `templates`(`category`, `is_active`);

-- CreateIndex
CREATE INDEX `templates_is_premium_sort_order_idx` ON `templates`(`is_premium`, `sort_order`);

-- CreateIndex
CREATE INDEX `usage_logs_action_type_idx` ON `usage_logs`(`action_type`);

-- CreateIndex
CREATE INDEX `usage_logs_user_id_action_type_idx` ON `usage_logs`(`user_id`, `action_type`);

-- CreateIndex
CREATE INDEX `usage_logs_created_at_idx` ON `usage_logs`(`created_at`);

-- CreateIndex
CREATE INDEX `users_oauth_provider_oauth_uid_idx` ON `users`(`oauth_provider`, `oauth_uid`);

-- CreateIndex
CREATE INDEX `users_experience_level_idx` ON `users`(`experience_level`);

-- CreateIndex
CREATE INDEX `users_created_at_idx` ON `users`(`created_at`);

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
