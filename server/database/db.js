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
  keepAliveInitialDelay: 10000
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
    // Safe auto-migration: ensure password_hash column exists
    try {
      await connection.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL');
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
