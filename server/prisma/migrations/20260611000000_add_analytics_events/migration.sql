-- CreateTable
CREATE TABLE `analytics_events` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `session_id` VARCHAR(255) NOT NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(100) NULL,
    `entity_id` VARCHAR(100) NULL,
    `path` TEXT NULL,
    `referrer` TEXT NULL,
    `metadata` JSON NULL,
    `ip_address` VARCHAR(255) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_events_user_id_idx`(`user_id`),
    INDEX `analytics_events_session_id_idx`(`session_id`),
    INDEX `analytics_events_event_type_idx`(`event_type`),
    INDEX `analytics_events_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `analytics_events_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
