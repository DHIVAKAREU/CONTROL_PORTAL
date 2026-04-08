const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function seed() {
    console.log('Seeding V2.1: Final Aligned SUPER_ADMIN...');
    const db = new sqlite3.Database('database.sqlite');
    
    const email = 'superadmin@system.in';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    db.run(`
        INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level, dept, is_first_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        userId, 
        'superadmin', 
        'Root SuperAdmin', // Full name for frontend
        email, 
        hashedPassword, 
        'SUPER_ADMIN', 
        null, 
        10, // Max clearance
        'COMMAND_CENTER', 
        1
    ], (err) => {
        if (err) {
            console.error('❌ Seeding failed:', err.message);
        } else {
            console.log('✅ Aligned SUPER_ADMIN seeded:');
            console.log('   Email:', email);
            console.log('   Password:', password);
            console.log('   Role (Internal): SUPER_ADMIN');
            console.log('   Role (Frontend): PLATFORM_ADMIN (via mapping)');
        }
        db.close();
    });
}

seed();
