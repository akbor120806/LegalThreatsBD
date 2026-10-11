import mysql from 'mysql2/promise';

let pool;

// A single shared connection pool, created lazily on first use so that
// `next build` never tries to open a real DB connection.
export function db() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 4000,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'legalthreadbd',
      ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? {
        rejectUnauthorized: true,
      } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

// Convenience helper used by some routes: runs a query and returns just the
// rows/result (instead of the [rows, fields] tuple mysql2 normally returns).
export async function query(sql, params) {
  const [rows] = await db().execute(sql, params);
  return rows;
}