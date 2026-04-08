import { getDb } from './src/config/db';

async function migrate() {
  const db = await getDb();
  console.log('Migrating database: Adding dept column to User table...');
  try {
    await db.exec("ALTER TABLE User ADD COLUMN dept TEXT DEFAULT 'General'");
    console.log('Migration successful: dept column added.');
  } catch (err: any) {
    if (err.message.includes('duplicate column name')) {
      console.log('Migration skipped: dept column already exists.');
    } else {
      console.error('Migration failed:', err.message);
    }
  }
}

migrate();
