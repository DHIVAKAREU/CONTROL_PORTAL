import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';
import { recordAuditLog } from '../utils/audit';

export const getPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user?.tenantId;
    
    const [permissions] = await pool.query(`
      SELECT p.*, u.name as userName, z.name as zoneName 
      FROM permissions p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN zones z ON p.zone_id = z.id
      WHERE p.organization_id = ?
    `, [orgId]);

    const formatted = permissions.map((p: any) => {
      let days = [];
      try {
        days = p.allowed_days ? JSON.parse(p.allowed_days) : [];
      } catch (e) {
        console.warn(`Failed to parse allowedDays for perm ${p.id}`);
      }
      return {
        ...p,
        allowedDays: days, // Map back to frontend expected key
        userName: p.userName || 'Unknown Identity',
        zoneName: p.zoneName || 'Unknown Access Point'
      };
    });

    res.json(formatted);
  } catch (error: any) {
    console.error('SERVER_GET_PERMISSIONS_ERROR:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

export const createPermission = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, zoneId, startDate, endDate, startTime, endTime, allowedDays } = req.body;
    const orgId = req.user?.tenantId;

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO permissions (id, user_id, zone_id, organization_id, start_date, end_date, start_time, end_time, allowed_days) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, zoneId, orgId, startDate, endDate, startTime, endTime, JSON.stringify(allowedDays)]
    );

    // Audit Log
    const [uRows] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]) as any[];
    const [zRows] = await pool.query('SELECT name FROM zones WHERE id = ?', [zoneId]) as any[];
    await recordAuditLog(req.user?.email || 'System', 'Access Granted', `User: ${uRows[0]?.name}, Zone: ${zRows[0]?.name}`);

    res.status(201).json({ id, message: 'Permission granted' });
  } catch (error: any) {
    console.error('SERVER_CREATE_PERMISSION_ERROR:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

export const revokePermission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.tenantId;

    await pool.query('DELETE FROM permissions WHERE id = ? AND organization_id = ?', [id, orgId]);
    
    // Audit Log (get details before delete if possible, or just log ID)
    await recordAuditLog(req.user?.email || 'System', 'Access Revoked', `Permission ID: ${id}`);

    res.json({ message: 'Permission revoked' });
  } catch (error) {
    console.error('SERVER_REVOKE_PERMISSION_ERROR:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

export const simulateScan = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, zoneId } = req.body;
    const orgId = req.user?.tenantId;

    const [permissions] = await pool.query(
      'SELECT * FROM permissions WHERE user_id = ? AND zone_id = ? AND organization_id = ?',
      [userId, zoneId, orgId]
    );

    if (permissions.length === 0) {
      return res.json({ status: 'DENIED', reason: 'No active permission defined' });
    }

    const now = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDay = days[now.getDay()];
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const hasAccess = permissions.some((p: any) => {
      let allowedDays = [];
      try {
        allowedDays = JSON.parse(p.allowed_days);
      } catch (e) { return false; }
      
      const isDayAllowed = allowedDays.includes(currentDay);
      const isTimeInWindow = currentTime >= (p.start_time || '00:00') && currentTime <= (p.end_time || '23:59');
      return isDayAllowed && isTimeInWindow;
    });

    // Fetch names for logging
    const [uRows] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]) as any[];
    const [zRows] = await pool.query('SELECT name FROM zones WHERE id = ?', [zoneId]) as any[];
    const userName = uRows[0]?.name || 'Unknown';
    const zoneName = zRows[0]?.name || 'Unknown';

    if (hasAccess) {
      await pool.query(
        'INSERT INTO events (id, user_id, zone_id, status) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), userId, zoneId, 'GRANTED']
      );
      await recordAuditLog(userName, 'Access Event: GRANTED', `Zone: ${zoneName}`);
      return res.json({ status: 'GRANTED' });
    } else {
      await pool.query(
        'INSERT INTO events (id, user_id, zone_id, status) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), userId, zoneId, 'DENIED']
      );
      await recordAuditLog(userName, 'Access Event: DENIED', `Zone: ${zoneName}`);
      return res.json({ status: 'DENIED', reason: 'Out of permitted time window or missing permissions' });
    }
  } catch (error) {
    console.error('SERVER_SIMULATE_SCAN_ERROR:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};
