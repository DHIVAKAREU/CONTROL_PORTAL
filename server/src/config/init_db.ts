import { getDb } from './db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function initDatabase() {
  const db = await getDb();

  console.log('Initializing SQLite database (Unified Schema)...');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      domain TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      plan TEXT NOT NULL DEFAULT 'STARTER',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 100,
      occupancy INTEGER NOT NULL DEFAULT 0,
      organization_id TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      zone_id TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (zone_id) REFERENCES zones(id),
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS PlatformSettings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

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

  console.log('Database initialized successfully with Unified Schema.');
}

