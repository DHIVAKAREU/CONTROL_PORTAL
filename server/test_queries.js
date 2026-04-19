
const pool = require('./src/config/db').default;

async function testFetch() {
  try {
    console.log('Testing listUsers query...');
    const query = 'SELECT u.id, u.username, u.name, u.email, u.role, u.clearance_level, u.dept, u.is_first_login, o.name as organization FROM users u LEFT JOIN organizations o ON u.organization_id = o.id';
    const [users] = await pool.query(query, []);
    console.log('listUsers query success, count:', users.length);

    console.log('Testing getEvents query...');
    const queryEvents = `
      SELECT 
        e.*, 
        z.name as zoneName, z.organization_id as orgId,
        u.name as userName, u.role as userRole, u.email as userEmail
      FROM events e 
      INNER JOIN zones z ON e.zone_id = z.id
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC LIMIT 10
    `;
    const [events] = await pool.query(queryEvents, []);
    console.log('getEvents query success, count:', events.length);

  } catch (err) {
    console.error('SERVER_QUERY_CRASH:', err);
  }
}

testFetch();
