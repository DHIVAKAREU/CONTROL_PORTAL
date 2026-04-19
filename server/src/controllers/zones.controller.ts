import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';
import { recordAuditLog } from '../utils/audit';

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
    await recordAuditLog(req.user?.email || 'System', 'Zone Created', zone.name);

    res.status(201).json(zone);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR', details: error });
  }
};
export const updateZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, capacity, occupancy, code, description, pos_x, pos_y } = req.body;
    const tenantId = req.user?.tenantId;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    if (!id) {
      res.status(400).json({ error: 'MISSING_ID' });
      return;
    }

    // Security check: ensure user belongs to the org or is superadmin
    if (!isSuperAdmin) {
      const [existing] = await pool.query('SELECT organization_id FROM zones WHERE id = ?', [id]);
      if (!existing[0] || existing[0].organization_id !== tenantId) {
        res.status(403).json({ error: 'FORBIDDEN', message: 'Unauthorized access to this zone' });
        return;
      }
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (capacity !== undefined) { fields.push('capacity = ?'); values.push(parseInt(capacity)); }
    if (occupancy !== undefined) { fields.push('occupancy = ?'); values.push(parseInt(occupancy)); }
    if (code !== undefined) { fields.push('code = ?'); values.push(code); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (pos_x !== undefined) { fields.push('pos_x = ?'); values.push(parseFloat(pos_x)); }
    if (pos_y !== undefined) { fields.push('pos_y = ?'); values.push(parseFloat(pos_y)); }

    if (fields.length === 0) {
      res.status(400).json({ error: 'NO_FIELDS_TO_UPDATE' });
      return;
    }

    values.push(id);
    await pool.query(`UPDATE zones SET ${fields.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.query('SELECT * FROM zones WHERE id = ?', [id]);
    const zone = updated[0];

    // Audit Log
    await recordAuditLog(req.user?.email || 'System', 'Zone Updated', zone.name);

    res.status(200).json(zone);
  } catch (error: any) {
    console.error('[UPDATE_ZONE_ERROR]', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', details: error.message });
  }
};

export const deleteZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    if (!id) {
      res.status(400).json({ error: 'MISSING_ID' });
      return;
    }

    // Security check
    const [existing] = await pool.query('SELECT name, organization_id FROM zones WHERE id = ?', [id]);
    const zone = existing[0];

    if (!zone) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }

    if (!isSuperAdmin && zone.organization_id !== tenantId) {
      res.status(403).json({ error: 'FORBIDDEN' });
      return;
    }

    await pool.query('DELETE FROM zones WHERE id = ?', [id]);

    // Audit Log
    await recordAuditLog(req.user?.email || 'System', 'Zone Deleted', zone.name);

    res.status(200).json({ message: 'ZONE_DELETED' });
  } catch (error: any) {
    console.error('[DELETE_ZONE_ERROR]', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', details: error.message });
  }
};
