import { Request, Response } from 'express';
import pool from '../config/db';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, domain } = req.body;

    if (!name || !domain) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Name and domain are required' });
      return;
    }

    const orgId = crypto.randomUUID();
    
    // 1. Create Organization
    await pool.query(
      'INSERT INTO organizations (id, name, domain) VALUES (?, ?, ?)',
      [orgId, name, domain.toLowerCase().trim()]
    );

    // 2. Automatically create default admin (Aligned with V2 schema)
    const adminUsername = 'admin';
    const adminFullName = `${name} Administrator`;
    const adminEmail = `admin@${domain.toLowerCase().trim()}`;
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const adminId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level, dept, is_first_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [adminId, adminUsername, adminFullName, adminEmail, hashedPassword, 'ORG_ADMIN', orgId, 5, 'ADMINISTRATION']
    );

    res.status(201).json({
      message: 'ORGANIZATION_CREATED_SUCCESSFULLY',
      organization: { id: orgId, name, domain },
      defaultAdmin: { email: adminEmail, role: 'ORG_ADMIN', tempPassword: defaultPassword }
    });

  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'DOMAIN_ALREADY_EXISTS' });
      return;
    }
    console.error('[ORG_CREATE_ERROR]', error);
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
