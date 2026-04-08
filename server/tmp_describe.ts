import { getDb } from './src/config/db';

async function describe() {
  const db = await getDb();
  try {
    const table = 'User';
    const info = await db.all(`PRAGMA table_info(${table})`);
    console.log(`Schema for ${table}:`, info);
  } catch (err) {
    console.error('Error describing DB:', err);
  } finally {
    process.exit();
  }
}

describe();
