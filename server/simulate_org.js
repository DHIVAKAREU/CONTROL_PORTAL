
const pool = require('./src/config/db').default;
const crypto = require('crypto');
const bcrypt = require('bcrypt');

async function simulateCreateOrg() {
  try {
    const name = 'Test Org ' + Date.now();
    const domain = 'test' + Date.now() + '.com';
    const orgId = crypto.randomUUID();
    const adminId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    console.log('Inserting Org...');
    await pool.query(
      'INSERT INTO organizations (id, name, domain, slug, plan) VALUES (?, ?, ?, ?, ?)',
      [orgId, name, domain, 'TEST', 'STARTER']
    );
    console.log('Org Inserted.');

    console.log('Inserting Admin User...');
    await pool.query(
      `INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level, dept, is_first_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [adminId, 'admin', 'Test Admin', 'admin@'+domain, hashedPassword, 'ORG_ADMIN', orgId, 5, 'ADMINISTRATION']
    );
    console.log('Admin User Inserted.');

  } catch (err) {
    console.error('SIMULATION_FAILURE:', err.message);
  }
}

simulateCreateOrg();
