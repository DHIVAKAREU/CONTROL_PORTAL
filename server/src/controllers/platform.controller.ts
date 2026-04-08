import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/db';
import * as crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only';

export const impersonateTenant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    const [orgs] = await pool.query('SELECT * FROM organizations WHERE id = ?', [id]);
    const org = orgs[0];

    if (!org) {
      res.status(404).json({ error: 'ORG_NOT_FOUND' });
      return;
    }

    const payload = {
      ...req.user,
      tenantId: org.id,
      isImpersonating: true,
      originalName: req.user.name
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    const logId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO audit_logs (id, actor, action, target, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [logId, req.user.name, 'Started Impersonation', org.name]
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Impersonation error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};
