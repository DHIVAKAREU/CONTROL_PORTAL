
import crypto from 'crypto';
import pool from '../config/db';

export async function recordAuditLog(actorEmail: string, action: string, target: string, details?: string) {
    try {
        const id = crypto.randomUUID();
        // Schema uses created_at (lowercase) or createdAt depending on the version. 
        // We will use created_at as it's common in the controllers.
        await pool.query(
            'INSERT INTO audit_logs (id, actor, action, target, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [id, actorEmail, action, target]
        );
        console.log(`[AUDIT] ${action}: ${target} (by ${actorEmail})`);
    } catch (error) {
        console.error('[AUDIT_ERROR]', error);
    }
}
