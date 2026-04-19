
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
console.log('Testing connection to:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to database.');
});

db.all('SELECT name FROM sqlite_master WHERE type="table"', [], (err, rows) => {
  if (err) {
    console.error('Query failed:', err.message);
  } else {
    console.log('Tables:', rows.map(r => r.name).join(', '));
  }
  
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) console.error('Users query failed:', err.message);
    else console.log('Users count:', row.count);
    
    db.get('SELECT COUNT(*) as count FROM organizations', (err, row) => {
      if (err) console.error('Orgs query failed:', err.message);
      else console.log('Orgs count:', row.count);
      
      db.close();
    });
  });
});
