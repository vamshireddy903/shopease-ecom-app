const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Uncomment if your RDS instance requires SSL:
  // ssl: { rejectUnauthorized: true }
});

// Quick connectivity check on startup (non-fatal, just logs)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to RDS MySQL database');
    conn.release();
  } catch (err) {
    console.error('❌ Could not connect to database:', err.message);
  }
})();

module.exports = pool;
