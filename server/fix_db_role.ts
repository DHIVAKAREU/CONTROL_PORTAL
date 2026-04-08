import { getDb } from './src/config/db';

async function fix() {
  const db = await getDb();
  await db.run("UPDATE User SET role = 'SUPER_ADMIN' WHERE email = 'superadmin@smartaccess.io';");
  console.log("Successfully updated Superior Admin role to SUPER_ADMIN.");
  process.exit(0);
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
