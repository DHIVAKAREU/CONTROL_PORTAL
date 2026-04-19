import { Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { normalizeUsername, validateEmailDomain, isValidEmailFormat } from '../utils/validation';
import { recordAuditLog } from '../utils/audit';

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let { username, name, email, password, organization_id, clearance_level, dept } = req.body;
        const caller = req.user;

        // 1. Scoping & Permissions
        if (caller?.role === 'ORG_ADMIN') {
            organization_id = caller.tenantId;
        } else if (caller?.role !== 'SUPER_ADMIN') {
            res.status(403).json({ error: 'FORBIDDEN' });
            return;
        }

        // Derive username from email if missing
        if (!username && email) {
            username = email.split('@')[0];
        }

        if (!username || !email || !organization_id || !name) {
            res.status(400).json({ 
                error: 'MISSING_FIELDS', 
                message: 'Username (or email), name, email, and organization_id are required' 
            });
            return;
        }

        // 2. Fetch Organization Domain
        const [orgs] = await pool.query('SELECT domain FROM organizations WHERE id = ?', [organization_id]);
        if (!orgs[0]) {
            console.error('[CREATE_USER_ERROR] Organization not found:', organization_id);
            res.status(404).json({ error: 'ORGANIZATION_NOT_FOUND', details: `Org ID ${organization_id} does not exist` });
            return;
        }
        const domain = orgs[0].domain;

        // 3. Validations
        username = normalizeUsername(username);
        if (!isValidEmailFormat(email)) {
            res.status(400).json({ error: 'INVALID_EMAIL_FORMAT' });
            return;
        }
        if (!validateEmailDomain(email, domain)) {
            res.status(400).json({ error: 'DOMAIN_MISMATCH', message: `Email must end with @${domain}` });
            return;
        }

        // 4. Creation
        const userId = crypto.randomUUID();
        const effectivePassword = password || 'Access@123';
        const hashedPassword = await bcrypt.hash(effectivePassword, 10);

        await pool.query(
            `INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level, dept, is_first_login) 
             VALUES (?, ?, ?, ?, ?, 'USER', ?, ?, ?, 1)`,
            [userId, username, name, email, hashedPassword, organization_id, clearance_level || 1, dept || 'OPERATIONS']
        );

        await recordAuditLog(req.user?.email || 'System', 'Identity Provisioned', `${name} (${email})`);

        res.status(201).json({ id: userId, username, email, role: 'USER' });

    } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
            res.status(409).json({ error: 'USER_ALREADY_EXISTS' });
            return;
        }
        console.error('[CREATE_USER_ERROR]', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
};

export const createAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let { username, name, email, password, organization_id, clearance_level, dept } = req.body;
        const caller = req.user;

        if (caller?.role === 'ORG_ADMIN') {
            organization_id = caller.tenantId;
        } else if (caller?.role !== 'SUPER_ADMIN') {
            res.status(403).json({ error: 'FORBIDDEN' });
            return;
        }

        // Derive username from email if missing
        if (!username && email) {
            username = email.split('@')[0];
        }

        if (!username || !email || !password || !organization_id || !name) {
            res.status(400).json({ 
                error: 'MISSING_FIELDS', 
                message: 'Username (or email), name, email, password, and organization_id are required' 
            });
            return;
        }

        if (password === 'admin123' && caller?.role !== 'SUPER_ADMIN') {
            res.status(400).json({ error: 'PASSWORD_NOT_ALLOWED', message: 'Admin password cannot be admin123' });
            return;
        }

        const [orgs] = await pool.query('SELECT domain FROM organizations WHERE id = ?', [organization_id]);
        const domain = orgs[0]?.domain;
        if (!domain) {
            res.status(404).json({ error: 'ORGANIZATION_NOT_FOUND' });
            return;
        }

        username = normalizeUsername(username);
        if (!validateEmailDomain(email, domain)) {
            res.status(400).json({ error: 'DOMAIN_MISMATCH' });
            return;
        }

        const userId = crypto.randomUUID();
        const effectivePassword = password || 'Access@123';
        const hashedPassword = await bcrypt.hash(effectivePassword, 10);

        await pool.query(
            `INSERT INTO users (id, username, name, email, password_hash, role, organization_id, clearance_level, dept, is_first_login) 
             VALUES (?, ?, ?, ?, ?, 'ORG_ADMIN', ?, ?, ?, 1)`,
            [userId, username, name, email, hashedPassword, organization_id, clearance_level || 5, dept || 'ADMINISTRATION']
        );

        await recordAuditLog(req.user?.email || 'System', 'Admin Provisioned', `${name} (${email})`);

        res.status(201).json({ id: userId, username, email, role: 'ORG_ADMIN' });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
};

export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    let query = '';
    try {
        const caller = req.user;
        query = 'SELECT u.id, u.username, u.name, u.email, u.role, u.clearance_level, u.dept, u.is_first_login, o.name as organization FROM users u LEFT JOIN organizations o ON u.organization_id = o.id';
        let params: any[] = [];

        if (caller?.role === 'ORG_ADMIN') {
            query += ' WHERE u.organization_id = ?';
            params.push(caller.tenantId);
        } else if (caller?.role !== 'SUPER_ADMIN') {
            res.status(403).json({ error: 'FORBIDDEN' });
            return;
        }

        const [users] = await pool.query(query, params);
        res.status(200).json(users);
    } catch (error: any) {
        console.error('[LIST_USERS_ERROR]', {
            message: error.message,
            stack: error.stack,
            caller: req.user?.email,
            queryPreview: query ? query.substring(0, 50) : 'N/A'
        });
        res.status(500).json({ error: 'INTERNAL_ERROR', details: error.message });
    }
};

export const getUsers = listUsers;
export const updateUser = async (req: AuthRequest, res: Response) => { res.status(501).json({ error: 'NOT_IMPLEMENTED' }); };

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const caller = req.user;

        // 1. Get user details before deletion
        const [users] = await pool.query('SELECT name, email, organization_id FROM users WHERE id = ?', [id]) as any[];
        const targetUser = users[0];

        if (!targetUser) {
            res.status(404).json({ error: 'USER_NOT_FOUND' });
            return;
        }

        // 2. Permission check
        if (caller?.role === 'ORG_ADMIN' && targetUser.organization_id !== caller.tenantId) {
            res.status(403).json({ error: 'FORBIDDEN' });
            return;
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        // 3. Audit Log
        await recordAuditLog(caller?.email || 'System', 'Identity Revoked', `${targetUser.name} (${targetUser.email})`);

        res.status(200).json({ message: 'USER_DELETED_SUCCESSFULLY' });
    } catch (error) {
        console.error('[DELETE_USER_ERROR]', error);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
};
