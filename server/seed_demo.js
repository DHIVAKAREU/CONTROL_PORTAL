const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function seed() {
    console.log('Seeding Demo Data: Org Admins & Users...');
    const db = new sqlite3.Database('database.sqlite');
    const passwordHash = await bcrypt.hash('user123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    const orgs = [
        { id: crypto.randomUUID(), name: 'CIT University', domain: 'cit.edu' },
        { id: crypto.randomUUID(), name: 'Juspay Technologies', domain: 'juspay.in' }
    ];

    db.serialize(() => {
        // 1. Insert Organizations
        const stmtOrg = db.prepare('INSERT INTO organizations (id, name, domain) VALUES (?, ?, ?)');
        orgs.forEach(o => stmtOrg.run(o.id, o.name, o.domain));
        stmtOrg.finalize();

        // 2. Insert Admins & Users
        const stmtUser = db.prepare(`
            INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level, dept, is_first_login) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // CIT Admin
        stmtUser.run(crypto.randomUUID(), 'admin', 'CIT Admin', 'admin@cit.edu', adminHash, 'ORG_ADMIN', orgs[0].id, 5, 'ADMINISTRATION', 1);
        // CIT User (Rahul)
        stmtUser.run(crypto.randomUUID(), 'rahul', 'Rahul Kumar', 'rahul@cit.edu', passwordHash, 'USER', orgs[0].id, 1, 'ENGINEERING', 1);
        
        // Juspay Admin
        stmtUser.run(crypto.randomUUID(), 'admin', 'Juspay Admin', 'admin@juspay.in', adminHash, 'ORG_ADMIN', orgs[1].id, 5, 'ADMINISTRATION', 1);
        // Juspay User (Arun)
        stmtUser.run(crypto.randomUUID(), 'arun', 'Arun Varma', 'arun@juspay.in', passwordHash, 'USER', orgs[1].id, 2, 'FINTECH', 1);

        stmtUser.finalize();
        
        console.log('✅ Demo seeding complete.');
        console.log('   - CIT Admin: admin@cit.edu / admin123');
        console.log('   - Rahul (CIT): rahul@cit.edu / user123');
        console.log('   - Arun (Juspay): arun@juspay.in / user123');
        
        db.close();
    });
}

seed();
