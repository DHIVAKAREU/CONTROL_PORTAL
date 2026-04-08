import { Response } from 'express';
import { getDb } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getPlatformSettings = async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT key, value FROM PlatformSettings');
    
    // Convert array of [{key, value}] to a flat object {key: value}
    const settings = rows.reduce((acc: any, row: any) => {
      // Parse booleans and numbers if they were stored as strings
      let val = row.value;
      if (val === 'true') val = true;
      if (val === 'false') val = false;
      acc[row.key] = val;
      return acc;
    }, {});

    res.json(settings);
  } catch (err: any) {
    console.error('FAILED_GET_SETTINGS:', err.message);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve platform settings' });
  }
};

export const updatePlatformSetting = async (req: AuthRequest, res: Response) => {
  const { key, value } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'MISSING_KEY' });
  }

  try {
    const db = await getDb();
    const valString = String(value);

    await db.run(
      'INSERT INTO PlatformSettings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP',
      [key, valString]
    );

    console.log(`[AUDIT] Platform Setting Updated: ${key} = ${valString} by ${req.user?.email}`);

    res.json({ success: true, key, value });
  } catch (err: any) {
    console.error('FAILED_UPDATE_SETTING:', err.message);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to update platform setting' });
  }
};
