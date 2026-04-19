
const pool = require('./src/config/db').default;

async function check() {
  try {
    console.log('--- Checking Users ---');
    const [users] = await pool.query('SELECT * FROM users LIMIT 1');
    console.log('Users OK:', users.length);

    console.log('--- Checking Zones ---');
    const [zones] = await pool.query('SELECT * FROM zones LIMIT 1');
    console.log('Zones OK:', zones.length);

    console.log('--- Checking Events ---');
    const [events] = await pool.query('SELECT * FROM events LIMIT 1');
    console.log('Events OK:', events.length);

    console.log('--- Checking Schema (users) ---');
    const [info] = await pool.query('PRAGMA table_info(users)');
    console.log('Users Schema:', info.map(c => c.name).join(', '));

  } catch (err) {
    console.error('DATABASE_INTEGRITY_FAILURE:', err.message);
  }
}

check();
