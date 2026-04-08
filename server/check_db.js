const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { URL } = require('url');

dotenv.config();

async function check() {
  const dbUrl = new URL(process.env.DATABASE_URL || '');
  const pool = mysql.createPool({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.substring(1),
  });

  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables:', rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();
