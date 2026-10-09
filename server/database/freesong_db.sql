-- ==============================================================================
-- FreeSong.in — AMOLED Music Streaming Database Schema (MySQL / MariaDB / XAMPP)
-- Database Name: freesong_db
-- ==============================================================================

-- 1. Create Database if not exists and select it
CREATE DATABASE IF NOT EXISTS `freesong_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `freesong_db`;

-- Set SQL Modes for strict consistency
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `user_playlist_songs`;
DROP TABLE IF EXISTS `user_playlists`;
DROP TABLE IF EXISTS `user_play_history`;
DROP TABLE IF EXISTS `user_likes`;
DROP TABLE IF EXISTS `user_preferences`;
DROP TABLE IF EXISTS `user_login_logs`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;


-- ==============================================================================
-- 1. TABLE: users
-- Stores user credentials, profile, registration datetime, IP & Geolocation
-- ==============================================================================
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL DEFAULT 'FreeSong Listener',
  `password_hash` VARCHAR(255) NULL COMMENT 'Bcrypt hash for email/password auth',
  `avatar_url` VARCHAR(500) NULL,
  `auth_provider` ENUM('google', 'email', 'guest') NOT NULL DEFAULT 'google',
  `firebase_uid` VARCHAR(128) NULL COMMENT 'Firebase Google Auth UID',

  -- Lifetime listening stats (never trimmed, unlike play history)
  `total_plays` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Lifetime total songs streamed',

  -- Tracking Registration Data (Kab join kiya, IP address, Kaha se join kiya)
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'User join date & time',
  `registered_ip` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1' COMMENT 'IPv4 / IPv6 at registration',
  `registered_country` VARCHAR(100) NULL DEFAULT 'India' COMMENT 'Country name (e.g. India)',
  `registered_country_code` VARCHAR(10) NULL DEFAULT 'IN' COMMENT 'ISO 2-letter country code',
  `registered_region` VARCHAR(100) NULL COMMENT 'State / Region (e.g. Maharashtra, Delhi)',
  `registered_city` VARCHAR(100) NULL COMMENT 'City (e.g. Mumbai, New Delhi)',
  `registered_latitude` DECIMAL(10, 7) NULL COMMENT 'GPS Latitude',
  `registered_longitude` DECIMAL(10, 7) NULL COMMENT 'GPS Longitude',
  `registered_user_agent` VARCHAR(500) NULL COMMENT 'Device, OS & Browser info',

  -- Last Activity & Session
  `last_login_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_ip` VARCHAR(45) NULL,
  `status` ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_firebase_uid` (`firebase_uid`),
  KEY `idx_users_created_at` (`created_at`),
  KEY `idx_users_country_city` (`registered_country`, `registered_city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Users table with IP & Location tracking';


-- ==============================================================================
-- 2. TABLE: user_likes
-- Stores all tracks liked / favorited by each user
-- ==============================================================================
CREATE TABLE `user_likes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `video_id` VARCHAR(64) NOT NULL COMMENT 'YouTube Music videoId',
  `title` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255) NOT NULL,
  `album` VARCHAR(255) NULL,
  `thumbnail` VARCHAR(500) NULL,
  `duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Duration in seconds',
  `duration_text` VARCHAR(30) NULL COMMENT 'e.g. 3:45',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Liked timestamp',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_like` (`user_id`, `video_id`),
  KEY `idx_likes_user_date` (`user_id`, `created_at` DESC),
  KEY `idx_likes_video_id` (`video_id`),
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User favorite and liked songs';


-- ==============================================================================
-- 3. TABLE: user_play_history
-- Stores play history for users (optimized for fetching last 100 played songs)
-- ==============================================================================
CREATE TABLE `user_play_history` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `video_id` VARCHAR(64) NOT NULL COMMENT 'YouTube Music videoId',
  `title` VARCHAR(255) NOT NULL,
  `artist` VARCHAR(255) NOT NULL,
  `album` VARCHAR(255) NULL,
  `thumbnail` VARCHAR(500) NULL,
  `duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Duration in seconds',
  `duration_text` VARCHAR(30) NULL COMMENT 'e.g. 3:45',
  `played_duration` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Seconds user actually listened',
  `ip_address` VARCHAR(45) NULL COMMENT 'IP address during stream playback',
  `played_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Playback timestamp',

  PRIMARY KEY (`id`),
  KEY `idx_history_user_played` (`user_id`, `played_at` DESC),
  KEY `idx_history_video_id` (`video_id`),
  CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Last 100 play history per user';


-- ==============================================================================
-- 4. TABLE: user_login_logs
-- Audit log of user logins with IP, city, country, and timestamps
-- ==============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit log for user logins and locations';


-- ==============================================================================
-- 5. TABLE: user_playlists
-- Stores custom user-created playlists
-- ==============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom user-created playlists';


-- ==============================================================================
-- 6. TABLE: user_playlist_songs
-- Stores songs added inside user playlists
-- ==============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks inside custom playlists';


-- ==============================================================================
-- 7. TABLE: user_preferences
-- Stores personalized user preferences (onboarding genres, artists, volume, theme)
-- ==============================================================================
CREATE TABLE `user_preferences` (
  `user_id` INT UNSIGNED NOT NULL,
  `selected_genres` JSON NULL COMMENT 'Array of genre IDs e.g. ["bollywood", "punjabi"]',
  `selected_artists` JSON NULL COMMENT 'Array of artist IDs e.g. ["arijit-singh", "shreya-ghoshal"]',
  `volume` DECIMAL(3, 2) NOT NULL DEFAULT 0.80,
  `theme` VARCHAR(30) NOT NULL DEFAULT 'amoled-black',
  `autoplay` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Personalized user playback and onboarding preferences';


-- ==============================================================================
-- 8. STORED PROCEDURE: Record Play History & Cap at 100 Tracks
-- Keeps only the most recent 100 songs played per user
-- ==============================================================================
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
  -- 1. Insert new play record
  INSERT INTO `user_play_history` (
    `user_id`, `video_id`, `title`, `artist`, `album`, `thumbnail`,
    `duration`, `duration_text`, `played_duration`, `ip_address`, `played_at`
  ) VALUES (
    p_user_id, p_video_id, p_title, p_artist, p_album, p_thumbnail,
    p_duration, p_duration_text, p_played_duration, p_ip, NOW()
  );

  -- 2. Automatically delete older records beyond the latest 100 for this user
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


-- ==============================================================================
-- 9. SAMPLE DUMMY DATA FOR TESTING
-- ==============================================================================
INSERT INTO `users` (
  `id`, `email`, `name`, `avatar_url`, `auth_provider`, `firebase_uid`,
  `created_at`, `registered_ip`, `registered_country`, `registered_country_code`,
  `registered_region`, `registered_city`, `last_login_at`, `last_login_ip`
) VALUES (
  1,
  'anshu@freesong.in',
  'Anshu Sharma',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'google',
  'fb_uid_test_12345',
  NOW(),
  '103.21.124.5',
  'India',
  'IN',
  'Maharashtra',
  'Mumbai',
  NOW(),
  '103.21.124.5'
);

-- Sample Liked Songs for User 1
INSERT INTO `user_likes` (`user_id`, `video_id`, `title`, `artist`, `album`, `thumbnail`, `duration`, `duration_text`)
VALUES
(1, 'Ys6iPqfvmI0', 'Sajni', 'Arijit Singh', 'Laapataa Ladies', 'https://i.ytimg.com/vi/Ys6iPqfvmI0/hqdefault.jpg', 170, '2:50'),
(1, 'kJQP7kiw5Fk', 'Despacito', 'Luis Fonsi', 'VIDA', 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg', 228, '3:48');

-- Sample Play History (Last played tracks)
INSERT INTO `user_play_history` (`user_id`, `video_id`, `title`, `artist`, `thumbnail`, `duration`, `duration_text`, `ip_address`, `played_at`)
VALUES
(1, 'Ys6iPqfvmI0', 'Sajni', 'Arijit Singh', 'https://i.ytimg.com/vi/Ys6iPqfvmI0/hqdefault.jpg', 170, '2:50', '103.21.124.5', NOW());
