import { getDb } from './db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function initDatabase() {
  const db = await getDb();

  console.log('Initializing SQLite database (Unified Schema)...');

  // Core Schema with standard created_at naming
  await db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      domain TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      plan TEXT NOT NULL DEFAULT 'STARTER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      dept TEXT DEFAULT 'General',
      clearance_level INTEGER NOT NULL DEFAULT 1,
      is_first_login BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      capacity INTEGER NOT NULL DEFAULT 100,
      occupancy INTEGER NOT NULL DEFAULT 0,
      organization_id TEXT NOT NULL,
      pos_x REAL DEFAULT 50,
      pos_y REAL DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      zone_id TEXT NOT NULL,
      status TEXT NOT NULL,
      method TEXT DEFAULT 'SCAN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (zone_id) REFERENCES zones(id)
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      zone_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      allowed_days TEXT NOT NULL, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (zone_id) REFERENCES zones(id),
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS PlatformSettings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Schema Patching (Migration Helper)
  await applySchemaPatches(db);

  const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
  if (orgCount.count === 0) {
    const orgs = [
      { id: crypto.randomUUID(), name: 'Smart Access Platform', slug: 'platform', domain: 'smartaccess.io', plan: 'ENTERPRISE', status: 'ACTIVE' },
      { id: crypto.randomUUID(), name: 'JUSPAY Technologies', slug: 'juspay', domain: 'juspay.com', plan: 'ENTERPRISE', status: 'ACTIVE' },
      { id: crypto.randomUUID(), name: 'CIT Institute', slug: 'cit', domain: 'cit.edu', plan: 'PRO', status: 'ACTIVE' },
      { id: crypto.randomUUID(), name: 'Acme Corp', slug: 'acme', domain: 'acme.com', plan: 'STARTER', status: 'ACTIVE' },
    ];

    const hashedPassword = await bcrypt.hash('admin123', 10);

    for (const org of orgs) {
      await db.run(
        'INSERT INTO organizations (id, name, slug, domain, status, plan) VALUES (?, ?, ?, ?, ?, ?)',
        [org.id, org.name, org.slug, org.domain, org.status, org.plan]
      );
    }

    // Platform Super Admin
    await db.run(
      'INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'superadmin', 'Superior Admin', 'superadmin@smartaccess.io', hashedPassword, 'SUPER_ADMIN', orgs[0].id, 5]
    );

    // CIT Admin
    const citOrg = orgs.find(o => o.slug === 'cit')!;
    await db.run(
      'INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'citadmin', 'CIT Admin', 'admin@cit.edu', hashedPassword, 'ORG_ADMIN', citOrg.id, 3]
    );

    // Platform Settings Seeds
    const defaultSettings = [
      { key: 'requireJustification', value: 'true' },
      { key: 'notifyOrg', value: 'true' },
      { key: 'retentionPeriod', value: '90_days' },
      { key: 'impersonationTimeout', value: '30_mins' },
      { key: 'redactMetrics', value: 'false' },
      { key: 'maskPII', value: 'true' },
      { key: 'platformName', value: 'Smart Access Platform' },
      { key: 'platformDomain', value: 'smartaccess.io' },
      { key: 'gatewayUrl', value: 'https://gw.smartaccess.io/v2' },
      { key: 'supportEmail', value: 'ops@smartaccess.io' },
      { key: 'clusterRegion', value: 'aws-us-east-1' }
    ];

    for (const setting of defaultSettings) {
      await db.run(
        'INSERT OR IGNORE INTO PlatformSettings (key, value) VALUES (?, ?)',
        [setting.key, setting.value]
      );
    }

    console.log('Seeded high-fidelity platform data, users, and privacy settings.');
  }

  // Ensure 'platform-root' always exists for the Hardcoded Bypass
  await db.run(
    'INSERT OR IGNORE INTO organizations (id, name, slug, domain, status, plan) VALUES (?, ?, ?, ?, ?, ?)',
    ['platform-root', 'Smart Access Platform', 'PLATFORM', 'smartaccess.io', 'ACTIVE', 'ENTERPRISE']
  );

  console.log('Database initialized successfully with Unified Schema.');
}

async function applySchemaPatches(db: any) {
  // 1. Patch 'zones' table
  const zoneCols = await db.all('PRAGMA table_info(zones)');
  const zoneColNames = zoneCols.map((c: any) => c.name);

  if (!zoneColNames.includes('code')) {
    console.log('[SCHEMA_PATCH] Adding "code" column to zones');
    await db.run('ALTER TABLE zones ADD COLUMN code TEXT');
  }
  if (!zoneColNames.includes('description')) {
    console.log('[SCHEMA_PATCH] Adding "description" column to zones');
    await db.run('ALTER TABLE zones ADD COLUMN description TEXT');
  }
  if (!zoneColNames.includes('pos_x')) {
    console.log('[SCHEMA_PATCH] Adding "pos_x" column to zones');
    await db.run('ALTER TABLE zones ADD COLUMN pos_x REAL DEFAULT 50');
  }
  if (!zoneColNames.includes('pos_y')) {
    console.log('[SCHEMA_PATCH] Adding "pos_y" column to zones');
    await db.run('ALTER TABLE zones ADD COLUMN pos_y REAL DEFAULT 50');
  }

  // 2. Patch 'events' table
  const eventCols = await db.all('PRAGMA table_info(events)');
  const eventColNames = eventCols.map((c: any) => c.name);

  if (!eventColNames.includes('method')) {
    console.log('[SCHEMA_PATCH] Adding "method" column to events');
    await db.run('ALTER TABLE events ADD COLUMN method TEXT DEFAULT "SCAN"');
  }

  // 3. Patch 'PlatformSettings' table
  const settingCols = await db.all('PRAGMA table_info(PlatformSettings)');
  const settingColNames = settingCols.map((c: any) => c.name);

  if (!settingColNames.includes('updated_at') && settingColNames.includes('updatedAt')) {
    console.log('[SCHEMA_PATCH] Renaming "updatedAt" to "updated_at" in PlatformSettings');
    await db.run('ALTER TABLE PlatformSettings RENAME COLUMN updatedAt TO updated_at');
  } else if (!settingColNames.includes('updated_at')) {
    await db.run('ALTER TABLE PlatformSettings ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  }

  // 4. Standardize generic 'created_at' timestamps
  const tables = ['organizations', 'users', 'events', 'permissions', 'audit_logs', 'zones'];
  for (const table of tables) {
    const info = await db.all(`PRAGMA table_info(${table})`);
    const names = info.map((c: any) => c.name);
    if (!names.includes('created_at') && names.includes('createdAt')) {
      console.log(`[SCHEMA_PATCH] Moving "createdAt" to "created_at" in ${table}`);
      await db.run(`ALTER TABLE ${table} RENAME COLUMN createdAt TO created_at`);
    } else if (!names.includes('created_at')) {
       // Only add if it didn't exist at all (and wasn't already renamed)
       await db.run(`ALTER TABLE ${table} ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
    }
  }
}

