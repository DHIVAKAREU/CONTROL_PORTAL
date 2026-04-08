import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { io } from '../config/socket';
import crypto from 'crypto';

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN'; // Fixed role check
    
    let query = `
      SELECT 
        e.*, 
        z.name as zoneName, z.organization_id as orgId,
        u.name as userName, u.role as userRole, u.email as userEmail
      FROM events e 
      INNER JOIN zones z ON e.zone_id = z.id
      LEFT JOIN users u ON e.user_id = u.id
    `;
    let params: any[] = [];
    
    if (!isSuperAdmin) {
      query += ' WHERE z.organization_id = ?';
      params.push(tenantId);
    }
    
    query += ' ORDER BY e.created_at DESC LIMIT 50';
    
    const [events] = await pool.query(query, params);
    
    const formattedEvents = events.map((e: any) => ({
      ...e,
      user: { name: e.userName || 'Unknown User', role: e.userRole || 'EXTERNAL' },
      zone: { name: e.zoneName, orgId: e.orgId }
    }));
    
    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, zoneId, status, method } = req.body;
    const eventId = crypto.randomUUID();
    
    await pool.query(
      'INSERT INTO events (id, user_id, zone_id, status, method, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [eventId, userId, zoneId, status || 'GRANTED', method || 'SCAN']
    );

    const [rows] = await pool.query(
      `SELECT 
         e.*, 
         z.name as zoneName, z.organization_id as orgId,
         u.name as userName, u.role as userRole
       FROM events e 
       INNER JOIN zones z ON e.zone_id = z.id 
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`, 
      [eventId]
    );
    
    const event = rows[0];
    if (!event) {
        res.status(500).json({ error: 'FAILED_TO_FETCH_CREATED_EVENT' });
        return;
    }

    const formattedEvent = {
        ...event,
        user: { name: event.userName || 'Unknown User', role: event.userRole || 'EXTERNAL' },
        zone: { name: event.zoneName, orgId: event.orgId }
    };

    // Push real-time event to connected clients
    if (io) {
        io.emit('new_event', formattedEvent);
    }

    res.status(201).json(formattedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR', details: error });
  }
};
