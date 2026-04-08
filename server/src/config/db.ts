import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const rawUrl = process.env.DATABASE_URL || 'database.sqlite';
const dbPathStr = rawUrl.startsWith('file:') ? rawUrl.substring(5) : rawUrl;
const dbPath = path.resolve(__dirname, '../../', dbPathStr);

let db: Database;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return db;
}

// Compatibility layer for the existing controllers that expect a "pool" object with .query()
const pool = {
  query: async <T = any>(sql: string, params: any[] = []): Promise<[T, any]> => {
    const database = await getDb();
    // SQLite uses .all() for SELECT and .run() for INSERT/UPDATE/DELETE. 
    // We can infer by checking if it starts with SELECT.
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('SHOW');
    if (isSelect) {
      const rows = await database.all(sql, params);
      return [rows as any as T, null];
    } else {
      const result = await database.run(sql, params);
      return [result as any as T, null];
    }
  }
};

export default pool;
