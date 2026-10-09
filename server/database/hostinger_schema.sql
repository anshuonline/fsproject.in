-- ==============================================================================
-- FreeSong.in — Hostinger MySQL / phpMyAdmin Schema
-- NOTE: In Hostinger, open your created database first in phpMyAdmin,
-- then run this SQL script directly in the "SQL" tab or import it!
-- (Does NOT contain CREATE DATABASE, so no "Access Denied #1044" errors!)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `user_playlist_songs`;
DROP TABLE IF EXISTS `user_playlists`;
DROP TABLE IF EXISTS `user_play_history`;
DROP TABLE IF EXISTS `user_likes`;
DROP TABLE IF EXISTS `user_preferences`;
DROP TABLE IF EXISTS `user_login_logs`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. users Table
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL DEFAULT 'FreeSong Listener',
  `password_hash` VARCHAR(255) NULL,
  `avatar_url` VARCHAR(500) NULL,
  `auth_provider` ENUM('google', 'email', 'guest') NOT NULL DEFAULT 'google',
  `firebase_uid` VARCHAR(128) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'User join date & time',
  `registered_ip` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1' COMMENT 'IPv4 / IPv6 at registration',
  `registered_country` VARCHAR(100) NULL DEFAULT 'India',
  `registered_country_code` VARCHAR(10) NULL DEFAULT 'IN',
  `registered_region` VARCHAR(100) NULL,
  `registered_city` VARCHAR(100) NULL,
  `registered_latitude` DECIMAL(10, 7) NULL,
  `registered_longitude` DECIMAL(10, 7) NULL,
  `registered_user_agent` VARCHAR(500) NULL,
  `last_login_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_ip` VARCHAR(45) NULL,
  `status` ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_firebase_uid` (`firebase_uid`),
  KEY `idx_users_created_at` (`created_at`),
  KEY `idx_users_country_city` (`registered_country`, `registered_city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. user_likes Table
CREATE TABLE `user_likes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `video_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255) NOT NULL,
  `album` VARCHAR(255) NULL,
  `thumbnail` VARCHAR(500) NULL,
  `duration` INT UNSIGNED NOT NULL DEFAULT 0,
  `duration_text` VARCHAR(30) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_like` (`user_id`, `video_id`),
  KEY `idx_likes_user_date` (`user_id`, `created_at` DESC),
  KEY `idx_likes_video_id` (`video_id`),
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. user_play_history Table (Last 100 Play History)
CREATE TABLE `user_play_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `video_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255) NOT NULL,
  `album` VARCHAR(255) NULL,
  `thumbnail` VARCHAR(500) NULL,
  `duration` INT UNSIGNED NOT NULL DEFAULT 0,
  `duration_text` VARCHAR(30) NULL,
  `played_duration` INT UNSIGNED NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) NULL,
  `played_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_history_user_played` (`user_id`, `played_at` DESC),
  KEY `idx_history_video_id` (`video_id`),
  CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. user_login_logs Table
CREATE TABLE `user_login_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `country` VARCHAR(100) NULL,
  `city` VARCHAR(100) NULL,
  `region` VARCHAR(100) NULL,
  `user_agent` VARCHAR(500) NULL,
  `logged_in_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_login_logs_user` (`user_id`, `logged_in_at` DESC),
  CONSTRAINT `fk_login_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. user_playlists Table
CREATE TABLE `user_playlists` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  `cover_url` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_playlists_user` (`user_id`),
  CONSTRAINT `fk_playlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. user_playlist_songs Table
CREATE TABLE `user_playlist_songs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `playlist_id` INT UNSIGNED NOT NULL,
  `video_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255) NOT NULL,
  `album` VARCHAR(255) NULL,
  `thumbnail` VARCHAR(500) NULL,
  `duration` INT UNSIGNED NOT NULL DEFAULT 0,
  `duration_text` VARCHAR(30) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_playlist_song` (`playlist_id`, `video_id`),
  KEY `idx_playlist_songs_order` (`playlist_id`, `sort_order`),
  CONSTRAINT `fk_playlist_songs_parent` FOREIGN KEY (`playlist_id`) REFERENCES `user_playlists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. user_preferences Table
CREATE TABLE `user_preferences` (
  `user_id` INT UNSIGNED NOT NULL,
  `selected_genres` JSON NULL,
  `selected_artists` JSON NULL,
  `volume` DECIMAL(3, 2) NOT NULL DEFAULT 0.80,
  `theme` VARCHAR(30) NOT NULL DEFAULT 'amoled-black',
  `autoplay` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Stored Procedure for Automatic 100 History Limit
DELIMITER //
CREATE PROCEDURE `sp_record_play_history`(
  IN p_user_id INT UNSIGNED,
  IN p_video_id VARCHAR(64),
  IN p_title VARCHAR(255),
  IN p_artist VARCHAR(255),
  IN p_album VARCHAR(255),
  IN p_thumbnail VARCHAR(500),
  IN p_duration INT UNSIGNED,
  IN p_duration_text VARCHAR(30),
  IN p_played_duration INT UNSIGNED,
  IN p_ip VARCHAR(45)
)
BEGIN
  INSERT INTO `user_play_history` (
    `user_id`, `video_id`, `title`, `artist`, `album`, `thumbnail`,
    `duration`, `duration_text`, `played_duration`, `ip_address`, `played_at`
  ) VALUES (
    p_user_id, p_video_id, p_title, p_artist, p_album, p_thumbnail,
    p_duration, p_duration_text, p_played_duration, p_ip, NOW()
  );

  DELETE FROM `user_play_history`
  WHERE `user_id` = p_user_id
    AND `id` NOT IN (
      SELECT `id` FROM (
        SELECT `id` FROM `user_play_history`
        WHERE `user_id` = p_user_id
        ORDER BY `played_at` DESC, `id` DESC
        LIMIT 100
      ) AS recent_tracks
    );
END //
DELIMITER ;
