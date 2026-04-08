const sqlite3 = require('sqlite3');
const crypto = require('crypto');

const db = new sqlite3.Database('database.sqlite');

const SMARTACCESS_ORG_ID = 'febba7fb-61a7-46c9-87f4-e2cec8c50fe7';
const CIT_ORG_ID = crypto.randomUUID();

async function provision() {
    console.log('Starting full provisioning with role alignment...');

    try {
        // 1. Ensure CIT Organization exists
        const orgSql = `
            INSERT INTO Organization (id, name, slug, status, plan)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(orgSql, [
            CIT_ORG_ID,
            'CIT University',
            'cit',
            'ACTIVE',
            'ENTERPRISE'
        ], function(err) {
            if (err && !err.message.includes('UNIQUE constraint failed')) {
                console.error('Org creation failed:', err.message);
            } else {
                console.log('✅ CIT Organization verified/created.');
            }
            
            // 2. Provision ARJUN@CIT.EDU (ORG_ADMIN)
            const arjunId = crypto.randomUUID();
            const userSql = `
                INSERT INTO User (id, name, email, password, role, orgId, clearance, isActive, dept)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.run(userSql, [
                arjunId,
                'Arjun_Admin',
                'ARJUN@CIT.EDU',
                'arjun_access_key',
                'ORG_ADMIN',
                CIT_ORG_ID,
                5,
                1,
                'FACULTY_CONTROL'
            ], function(userErr) {
                if (userErr && !userErr.message.includes('UNIQUE constraint failed')) {
                    console.error('Arjun provisioning failed:', userErr.message);
                } else if (userErr && userErr.message.includes('UNIQUE constraint failed')) {
                    console.log('User Arjun already exists. Updating role...');
                    db.run(`UPDATE User SET role = 'ORG_ADMIN', password = 'arjun_access_key' WHERE email = 'ARJUN@CIT.EDU'`);
                } else {
                    console.log('✅ ARJUN@CIT.EDU provisioned as ORG_ADMIN.');
                }
                
                // 3. Update SuperAdmin to PLATFORM_ADMIN
                db.run(`UPDATE User SET role = 'PLATFORM_ADMIN', password = 'admin_access_key' WHERE email = 'SUPERADMIN@SMARTACCESS.IO'`, function(updateErr) {
                    if (updateErr) console.error('SuperAdmin update failed:', updateErr);
                    else console.log('✅ SUPERADMIN@SMARTACCESS.IO verified as PLATFORM_ADMIN.');
                    
                    db.close();
                });
            });
        });
    } catch (err) {
        console.error('Provisioning error:', err);
        db.close();
    }
}

provision();
