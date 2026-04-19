import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

export const getZones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    
    let query = 'SELECT * FROM zones';
    let params: any[] = [];
    
    if (!isSuperAdmin) {
      query += ' WHERE organization_id = ?';
      params.push(tenantId);
    }
    
    const [zones] = await pool.query(query, params);
    
    res.status(200).json(zones);
  } catch (error: any) {
    console.error('[GET_ZONES_ERROR]', {
      message: error.message,
      stack: error.stack,
      user: req.user?.email
    });
    res.status(500).json({ error: 'INTERNAL_ERROR', details: error.message });
  }
};

export const createZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, capacity, occupancy, code, description, pos_x, pos_y } = req.body;
    const orgId = req.user?.tenantId;
    const zoneId = crypto.randomUUID();
    
    if (!orgId && req.user?.role !== 'SUPER_ADMIN') {
      res.status(400).json({ error: 'NO_TENANT_ID' });
      return;
    }

    const finalOrgId = orgId || req.body.organization_id;

    await pool.query(
      'INSERT INTO zones (id, name, code, description, capacity, occupancy, organization_id, pos_x, pos_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        zoneId, 
        name, 
        code || `Z-${Math.floor(100+Math.random()*900)}`, 
        description || '', 
        parseInt(capacity) || 100, 
        parseInt(occupancy) || 0, 
        finalOrgId,
        parseFloat(pos_x) || 50,
        parseFloat(pos_y) || 50
      ]
    );

    const [rows] = await pool.query('SELECT * FROM zones WHERE id = ?', [zoneId]);
    const zone = rows[0];

    // Audit Log (V2 schema)
    const logId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO audit_logs (id, actor, action, target, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [logId, req.user?.email || 'System', 'Created Zone', zone.name]
    );

    res.status(201).json(zone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR', details: error });
  }
};
