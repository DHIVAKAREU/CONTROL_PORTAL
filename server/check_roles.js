const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.all('SELECT id, email, role FROM users ORDER BY role', (err, rows) => {
  if (err) { console.error('DB ERROR:', err.message); db.close(); return; }
  console.log('\n=== ALL USERS + ROLES ===');
  rows.forEach(r => console.log(`  ${r.role.padEnd(15)} | ${r.email}`));
  db.close();
});
