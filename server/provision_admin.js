const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const db = new sqlite3.Database('database.sqlite');
const ORG_ID = 'febba7fb-61a7-46c9-87f4-e2cec8c50fe7';
const EMAIL = 'SUPERADMIN@SMARTACCESS.IO';
const PASSWORD = 'admin_access_key';

async function provision() {
    console.log(`Starting provisioning for ${EMAIL}...`);

    try {
        const hashedPassword = PASSWORD; // Using plain text as fallback
        const userId = crypto.randomUUID();

        const sql = `
            INSERT INTO User (id, name, email, password, role, orgId, clearance, isActive, dept)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [
            userId,
            'Root_SuperAdmin',
            EMAIL,
            hashedPassword,
            'SUPERADMIN',
            ORG_ID,
            10, // Max clearance
            1,  // Active
            'ADMIN_COMMAND'
        ], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    console.log('User already exists. Updating password instead...');
                    db.run(`UPDATE User SET password = ? WHERE email = ?`, [hashedPassword, EMAIL], (updateErr) => {
                        if (updateErr) console.error('Update failed:', updateErr);
                        else console.log('Password updated successfully.');
                        db.close();
                    });
                } else {
                    console.error('Provisioning failed:', err.message);
                    db.close();
                }
            } else {
                console.log('✅ SuperAdmin provisioned successfully.');
                db.close();
            }
        });
    } catch (err) {
        console.error('Error during hashing:', err);
        db.close();
    }
}

provision();
