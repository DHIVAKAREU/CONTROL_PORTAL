const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('database.sqlite');

const orgId = crypto.randomUUID();
const adminId = crypto.randomUUID();
const domain = 'acn-tactical.com';
const passwordHash = bcrypt.hashSync('Admin@123', 10);

const zones = [
    { name: 'Executive Suite', code: 'Z-EXEC', desc: 'Secure leadership quarters', cap: 10, x: 15, y: 15 },
    { name: 'Cafeteria', code: 'Z-CAFE', desc: 'Primary dining area', cap: 50, x: 32, y: 15 },
    { name: 'Server Vault', code: 'Z-VAULT', desc: 'Critical infrastructure core', cap: 5, x: 55, y: 35 },
    { name: 'Innovation Lab', code: 'Z-LAB', desc: 'Research and development', cap: 20, x: 15, y: 75 },
    { name: 'Lobby', code: 'Z-LOBBY', desc: 'Public reception and entry', cap: 100, x: 35, y: 65 },
    { name: 'Dev Hub', code: 'Z-DEV', desc: 'Main engineering workspace', cap: 80, x: 35, y: 45 },
    { name: 'Main Entrance', code: 'Z-ENTRY', desc: 'Primary access point', cap: 100, x: 35, y: 85 }
];

db.serialize(() => {
    console.log('--- SEEDING DEMO DATA ---');
    
    // 1. Create Org
    db.run('INSERT INTO organizations (id, name, domain, slug, plan) VALUES (?, ?, ?, ?, ?)', 
        [orgId, 'ACN Tactical Operations', domain, 'ACN-TAC', 'ENTERPRISE'], (err) => {
            if (err) console.error('Org Error:', err.message);
            else console.log('✔ Organization Created');
        }
    );

    // 2. Create Admin
    db.run(`INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level, dept, is_first_login) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [adminId, 'admin', 'Field Commander', 'admin@' + domain, passwordHash, 'ORG_ADMIN', orgId, 5, 'OPERATIONS'], (err) => {
            if (err) console.error('Admin Error:', err.message);
            else console.log('✔ Admin User Created (admin@acn-tactical.com / Admin@123)');
        }
    );

    // 3. Seed Zones with Coordinates
    zones.forEach(z => {
        db.run('INSERT INTO zones (id, name, code, description, capacity, occupancy, organization_id, pos_x, pos_y) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)',
            [crypto.randomUUID(), z.name, z.code, z.desc, z.cap, orgId, z.x, z.y], (err) => {
                if (err) console.error(`Zone ${z.name} Error:`, err.message);
            }
        );
    });
    console.log('✔ Tactical Zones Provisioned');
});

db.close();
