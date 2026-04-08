import { getDb } from '../config/db';

async function init() {
  const db = await getDb();
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS "Permission" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "zoneId" TEXT NOT NULL,
          "orgId" TEXT NOT NULL,
          "startDate" TEXT NOT NULL,
          "endDate" TEXT NOT NULL,
          "startTime" TEXT NOT NULL,
          "endTime" TEXT NOT NULL,
          "allowedDays" TEXT NOT NULL,
          FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    console.log('PERMISSION_TABLE_INITIALIZED');
  } catch (err) {
    console.error('FAILED_TO_INIT_PERMISSIONS:', err);
  } finally {
    process.exit();
  }
}

init();
