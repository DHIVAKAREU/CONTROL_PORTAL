import { Request, Response } from 'express';
import pool from '../config/db';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { recordAuditLog } from '../utils/audit';

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, domain, slug, plan,
      adminName, adminEmail, adminPassword
    } = req.body;

    if (!name || !domain) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Organization name and domain are required' });
      return;
    }

    // Normalize domain: extract domain if email, trim, and lowercase
    const cleanDomain = domain.includes('@') ? domain.split('@')[1] : domain.trim().toLowerCase();
    const orgId = crypto.randomUUID();
    
    // Improved Slug Generation: Name-based + short random suffix for uniqueness
    const baseSlug = (slug || name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase().substring(0, 10));
    const orgSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orgPlan = plan || 'STARTER';
    
    // 1. Create Organization
    await pool.query(
      'INSERT INTO organizations (id, name, domain, slug, plan) VALUES (?, ?, ?, ?, ?)',
      [orgId, name, cleanDomain, orgSlug, orgPlan]
    );

    // 2. Create admin user with provided or auto-generated credentials
    const finalAdminName   = adminName    || `${name} Administrator`;
    const finalAdminEmail  = adminEmail   || `admin@${cleanDomain}`;
    const finalPassword    = adminPassword || `Admin@${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword   = await bcrypt.hash(finalPassword, 10);
    const adminId          = crypto.randomUUID();
    const adminUsername    = finalAdminEmail.split('@')[0];

    await pool.query(
      `INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level, dept, is_first_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [adminId, adminUsername, finalAdminName, finalAdminEmail, hashedPassword, 'ORG_ADMIN', orgId, 5, 'ADMINISTRATION']
    );

    // 3. Provision Default Tactical Zones
    await seedTacticalZones(orgId);

    // 4. Audit Log
    const callerEmail = (req as any).user?.email || 'System';
    await recordAuditLog(callerEmail, 'Organization Created', `${name} (${orgSlug})`);

    res.status(201).json({
      message: 'ORGANIZATION_CREATED_SUCCESSFULLY',
      organization: { id: orgId, name, domain: cleanDomain, slug: orgSlug, plan: orgPlan, status: 'ACTIVE' },
      credentials: {
        adminName: finalAdminName,
        adminEmail: finalAdminEmail,
        tempPassword: finalPassword,
        role: 'ORG_ADMIN'
      }
    });

  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      if (error.message.includes('organizations.domain')) {
        res.status(409).json({ error: 'DOMAIN_ALREADY_EXISTS', message: 'An organization with this domain already exists' });
      } else if (error.message.includes('organizations.slug')) {
        res.status(409).json({ error: 'SLUG_ALREADY_EXISTS', message: 'This organization name or slug is already taken' });
      } else {
        res.status(409).json({ error: 'CONFLICT', message: 'Unique constraint violation: ' + error.message });
      }
      return;
    }
    console.error('[ORG_CREATE_ERROR]', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
};

export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, domain, status } = req.body;

    if (!id) {
      res.status(400).json({ error: 'MISSING_ID' });
      return;
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (domain) { fields.push('domain = ?'); values.push(domain.toLowerCase().trim()); }
    if (status) { fields.push('status = ?'); values.push(status); }

    if (fields.length === 0) {
      res.status(400).json({ error: 'NO_FIELDS_TO_UPDATE' });
      return;
    }

    values.push(id);
    await pool.query(`UPDATE organizations SET ${fields.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM organizations WHERE id = ?', [id]) as any;
    const org = rows[0];

    // Audit Log
    const callerEmail = (req as any).user?.email || 'System';
    await recordAuditLog(callerEmail, 'Organization Updated', org?.name || 'Unknown');

    res.status(200).json({ message: 'ORGANIZATION_UPDATED', organization: org });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'DOMAIN_ALREADY_EXISTS' });
      return;
    }
    console.error('[ORG_UPDATE_ERROR]', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

export const listOrganizations = async (req: Request, res: Response): Promise<void> => {
    try {
        const [orgs] = await pool.query('SELECT * FROM organizations ORDER BY created_at DESC');
        res.status(200).json(orgs);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const [[{ userCount }]] = await pool.query('SELECT COUNT(*) as userCount FROM users') as any;
        const [[{ orgCount }]] = await pool.query('SELECT COUNT(*) as orgCount FROM organizations') as any;
        const [[{ zoneCount }]] = await pool.query('SELECT COUNT(*) as zoneCount FROM zones') as any;
        
        res.status(200).json({
            users: userCount,
            organizations: orgCount,
            zones: zoneCount,
            status: 'SECURE'
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
};

export const getZones = async (req: Request, res: Response): Promise<void> => {
    try {
        const [zones] = await pool.query('SELECT * FROM zones');
        res.status(200).json(zones);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
};

async function seedTacticalZones(orgId: string) {
    const defaultZones = [
        { name: 'Executive Suite', code: 'Z-EXEC', desc: 'Secure leadership quarters', cap: 10 },
        { name: 'Cafeteria', code: 'Z-CAFE', desc: 'Primary dining area', cap: 50 },
        { name: 'Server Vault', code: 'Z-VAULT', desc: 'Critical infrastructure core', cap: 5 },
        { name: 'Innovation Lab', code: 'Z-LAB', desc: 'Research and development', cap: 20 },
        { name: 'Lobby', code: 'Z-LOBBY', desc: 'Public reception and entry', cap: 100 },
        { name: 'Dev Hub', code: 'Z-DEV', desc: 'Main engineering workspace', cap: 80 },
        { name: 'Main Entrance', code: 'Z-ENTRY', desc: 'Primary access point', cap: 100 }
    ];

    for (const z of defaultZones) {
        await pool.query(
            'INSERT INTO zones (id, name, code, description, capacity, occupancy, organization_id) VALUES (?, ?, ?, ?, ?, 0, ?)',
            [crypto.randomUUID(), z.name, z.code, z.desc, z.cap, orgId]
        );
    }
}
