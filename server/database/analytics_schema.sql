-- ==============================================================================
-- FreeSong.in — Analytics Schema (GAnalytics)
-- Run this in phpMyAdmin "SQL" tab on your created database (Hostinger safe).
-- NOTE: The Node server also auto-creates these tables on startup
-- (safe migration in db.js), so this file is optional but recommended.
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `analytics_admin_logs`;
DROP TABLE IF EXISTS `analytics_admins`;
DROP TABLE IF EXISTS `analytics_plays`;
DROP TABLE IF EXISTS `analytics_searches`;
DROP TABLE IF EXISTS `analytics_visits`;
DROP TABLE IF EXISTS `analytics_presence`;
SET FOREIGN_KEY_CHECKS = 1;

-- 0a. analytics_admins Table (GAnalytics dashboard login)
CREATE TABLE `analytics_admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'MD5 hash',
  `name` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_analytics_admin` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── QUERY: Create a new analytics admin (password saved as MD5) ──
-- INSERT INTO analytics_admins (admin_id, password_hash, name)
-- VALUES ('admin', MD5('your-strong-password'), 'Super Admin');

-- 0b. analytics_admin_logs Table (Last 30 days admin login logs)
CREATE TABLE `analytics_admin_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` VARCHAR(64) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `country` VARCHAR(100) NULL,
  `city` VARCHAR(100) NULL,
  `user_agent` VARCHAR(500) NULL,
  `status` ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  `logged_in_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_admin_logs_date` (`logged_in_at`),
  KEY `idx_admin_logs_admin` (`admin_id`, `logged_in_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. analytics_presence Table (Live Now: who is online, from where, playing what)
CREATE TABLE `analytics_presence` (
  `visitor_id` VARCHAR(128) NOT NULL COMMENT 'Email / usr_{dbId} for registered, guest_xxx for guests',
  `is_registered` TINYINT(1) NOT NULL DEFAULT 0,
  `display_name` VARCHAR(100) NULL,
  `current_video_id` VARCHAR(64) NULL COMMENT 'NULL = idle, not playing',
  `current_title` VARCHAR(255) NULL,
  `current_artist` VARCHAR(255) NULL,
  `current_thumbnail` VARCHAR(500) NULL,
  `ip_address` VARCHAR(45) NULL,
  `country` VARCHAR(100) NULL,
  `city` VARCHAR(100) NULL,
  `user_agent` VARCHAR(500) NULL,
  `first_seen_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_seen_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`visitor_id`),
  KEY `idx_presence_last_seen` (`last_seen_at`),
  KEY `idx_presence_registered` (`is_registered`, `last_seen_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. analytics_visits Table (Daily unique visitors: guests & registered)
CREATE TABLE `analytics_visits` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `visitor_id` VARCHAR(128) NOT NULL COMMENT 'Email for registered users, guest_xxx id for guests',
  `is_registered` TINYINT(1) NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) NULL,
  `country` VARCHAR(100) NULL,
  `city` VARCHAR(100) NULL,
  `user_agent` VARCHAR(500) NULL,
  `visited_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_visits_visitor_date` (`visitor_id`, `visited_at` DESC),
  KEY `idx_visits_date` (`visited_at`),
  KEY `idx_visits_registered` (`is_registered`, `visited_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. analytics_searches Table (Search query logs)
CREATE TABLE `analytics_searches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `query` VARCHAR(255) NOT NULL,
  `visitor_id` VARCHAR(128) NULL,
  `is_registered` TINYINT(1) NOT NULL DEFAULT 0,
  `result_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `searched_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_searches_date` (`searched_at`),
  KEY `idx_searches_query` (`query`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. analytics_plays Table (Song streaming logs for Top 30 charts)
CREATE TABLE `analytics_plays` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `video_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NULL,
  `artist` VARCHAR(255) NULL,
  `thumbnail` VARCHAR(500) NULL,
  `visitor_id` VARCHAR(128) NULL,
  `is_registered` TINYINT(1) NOT NULL DEFAULT 0,
  `played_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_plays_date` (`played_at`),
  KEY `idx_plays_video_id` (`video_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
