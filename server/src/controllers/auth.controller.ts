import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and password required' });
      return;
    }

    // Find user in the 'users' table with Organization info
    const [rows] = await pool.query(
      `SELECT u.*, o.name as orgName, o.domain as orgDomain 
       FROM users u 
       LEFT JOIN organizations o ON u.organization_id = o.id 
       WHERE LOWER(u.email) = LOWER(?)`,
      [email]
    );

    const user = rows[0];

    if (!user) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    // Verify Password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      return;
    }

    // The JWT must carry the real DB role so middleware requireRole works correctly.
    // We separately map to a display role for the frontend user object.
    const frontendRole = user.role === 'SUPER_ADMIN' ? 'PLATFORM_ADMIN' : user.role;

    // Create JWT — use the REAL role in the token so the backend middleware works
    const payload = {
      userId: user.id,
      tenantId: user.organization_id || 'system',
      role: user.role, // real DB role (SUPER_ADMIN, ORG_ADMIN, USER)
      name: user.name,
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name, // Frontend expects 'name'
        email: user.email,
        role: frontendRole, // Frontend expects 'PLATFORM_ADMIN'
        tenantId: user.organization_id || 'system',
        clearanceLevel: user.clearance_level || 1,
        org: user.orgName || 'SYSTEM',
        is_first_login: !!user.is_first_login
      }
    });

  } catch (error) {
    console.error('[AUTH_LOGIN_ERROR]', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.userId;

    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = ?, is_first_login = 0 WHERE id = ?',
      [hashedPassword, userId]
    );

    res.status(200).json({ message: 'PASSWORD_CHANGED_SUCCESSFULLY' });
  } catch (error) {
    console.error('[AUTH_CHANGE_PASSWORD_ERROR]', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};
