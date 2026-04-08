import { getDb } from './src/config/db';

async function migrate() {
    console.log('Starting Migration V2.4: Tactical Permission Recovery...');
    const db = await getDb();

    try {
        await db.exec('DROP TABLE IF EXISTS audit_logs');
        await db.exec('DROP TABLE IF EXISTS events');
        await db.exec('DROP TABLE IF EXISTS permissions');
        await db.exec('DROP TABLE IF EXISTS zones');
        await db.exec('DROP TABLE IF EXISTS users');
        await db.exec('DROP TABLE IF EXISTS organizations');

        // 1. Organizations
        await db.exec(`
            CREATE TABLE IF NOT EXISTS organizations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                domain TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Users
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT CHECK(role IN ('SUPER_ADMIN', 'ORG_ADMIN', 'USER')) NOT NULL,
                organization_id TEXT,
                clearance_level INTEGER DEFAULT 1,
                dept TEXT DEFAULT 'General',
                is_first_login BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (organization_id) REFERENCES organizations(id)
            )
        `);

        // 3. Zones
        await db.exec(`
            CREATE TABLE IF NOT EXISTS zones (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                code TEXT NOT NULL,
                description TEXT,
                capacity INTEGER DEFAULT 100,
                occupancy INTEGER DEFAULT 0,
                organization_id TEXT NOT NULL,
                status TEXT DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (organization_id) REFERENCES organizations(id)
            )
        `);

        // 4. Events
        await db.exec(`
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                zone_id TEXT NOT NULL,
                status TEXT DEFAULT 'GRANTED',
                method TEXT DEFAULT 'SCAN',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (zone_id) REFERENCES zones(id)
            )
        `);

        // 5. Tactical Permissions (Restored full feature set)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS permissions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                zone_id TEXT NOT NULL,
                organization_id TEXT NOT NULL,
                access_level INTEGER DEFAULT 1,
                start_date DATE,
                end_date DATE,
                start_time TIME,
                end_time TIME,
                allowed_days TEXT, -- JSON array of days
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (zone_id) REFERENCES zones(id),
                FOREIGN KEY (organization_id) REFERENCES organizations(id),
                UNIQUE(user_id, zone_id)
            )
        `);

        // 6. Audit Logs
        await db.exec(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                target TEXT,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Migration V2.4 successful. Tactical system fully rebuilt.');
    } catch (err) {
        console.error('❌ Migration V2.4 failed:', err);
        process.exit(1);
    }
}

migrate();
