import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'freesong_db',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true
};

let pool = null;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('MySQL pool initialization error:', err.message);
}

/**
 * Execute a parameterized SQL query
 */
export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database pool not initialized. Check your DB credentials in .env');
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Test database connectivity on startup
 */
export async function testDbConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    console.log(` MySQL Database Connected: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    // Safe auto-migration: ensure password_hash, reset_token, reset_token_expires_at exist
    try {
      await connection.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL');
    } catch {}
    try {
      await connection.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL');
    } catch {}
    try {
      await connection.query('ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL');
    } catch {}
    try {
      await connection.query('ALTER TABLE users ADD COLUMN last_reset_request_at DATETIME NULL');
    } catch {}
    try {
      await connection.query('ALTER TABLE users ADD COLUMN total_plays INT UNSIGNED NOT NULL DEFAULT 0');
    } catch {}
    // Safe auto-migration: ensure GAnalytics tables exist
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS analytics_visits (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          visitor_id VARCHAR(128) NOT NULL,
          is_registered TINYINT(1) NOT NULL DEFAULT 0,
          ip_address VARCHAR(45) NULL,
          country VARCHAR(100) NULL,
          city VARCHAR(100) NULL,
          user_agent VARCHAR(500) NULL,
          visited_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_visits_visitor_date (visitor_id, visited_at DESC),
          KEY idx_visits_date (visited_at),
          KEY idx_visits_registered (is_registered, visited_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch {}
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS analytics_searches (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          query VARCHAR(255) NOT NULL,
          visitor_id VARCHAR(128) NULL,
          is_registered TINYINT(1) NOT NULL DEFAULT 0,
          result_count INT UNSIGNED NOT NULL DEFAULT 0,
          searched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_searches_date (searched_at),
          KEY idx_searches_query (query(100))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch {}
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS analytics_plays (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          video_id VARCHAR(64) NOT NULL,
          title VARCHAR(255) NULL,
          artist VARCHAR(255) NULL,
          thumbnail VARCHAR(500) NULL,
          visitor_id VARCHAR(128) NULL,
          is_registered TINYINT(1) NOT NULL DEFAULT 0,
          played_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_plays_date (played_at),
          KEY idx_plays_video_id (video_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch {}
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS analytics_admins (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          admin_id VARCHAR(64) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(100) NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uq_analytics_admin (admin_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch {}
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS analytics_admin_logs (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          admin_id VARCHAR(64) NOT NULL,
          ip_address VARCHAR(45) NULL,
          country VARCHAR(100) NULL,
          city VARCHAR(100) NULL,
          user_agent VARCHAR(500) NULL,
          status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
          logged_in_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_admin_logs_date (logged_in_at),
          KEY idx_admin_logs_admin (admin_id, logged_in_at DESC)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch {}
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS analytics_presence (
          visitor_id VARCHAR(128) NOT NULL,
          is_registered TINYINT(1) NOT NULL DEFAULT 0,
          display_name VARCHAR(100) NULL,
          current_video_id VARCHAR(64) NULL,
          current_title VARCHAR(255) NULL,
          current_artist VARCHAR(255) NULL,
          current_thumbnail VARCHAR(500) NULL,
          ip_address VARCHAR(45) NULL,
          country VARCHAR(100) NULL,
          city VARCHAR(100) NULL,
          user_agent VARCHAR(500) NULL,
          first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (visitor_id),
          KEY idx_presence_last_seen (last_seen_at),
          KEY idx_presence_registered (is_registered, last_seen_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    } catch {}
    connection.release();
    return true;
  } catch (err) {
    console.warn(` MySQL Database Connection Notice: ${err.message}`);
    console.warn(' Tip: Ensure MySQL is running and .env credentials match.');
    return false;
  }
}

export default { pool, query, testDbConnection };
