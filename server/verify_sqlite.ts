import { getDb } from './src/config/db';

async function check() {
  const db = await getDb();
  try {
    const rows = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', rows.map(r => r.name));
  } catch (err) {
    console.error('Error checking DB:', err);
  }
}

check();
