import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only';

export const impersonateOrg = async (req: AuthRequest, res: Response) => {
  const { orgId, reason } = req.body;

  if (!orgId) {
    return res.status(400).json({ error: 'MISSING_ORG_ID', message: 'Target organization ID is required' });
  }

  if (!reason) {
    return res.status(400).json({ error: 'MISSING_REASON', message: 'A reason for impersonation is required for audit logs' });
  }

  try {
    // In a real system, we'd verify the org exists in the DB here.
    // For now, we'll generate a high-fidelity shadow token.
    
    const payload = {
      userId: req.user?.userId || 'SA_OVERRIDE',
      tenantId: orgId, // This allows the user to access resources of the target Org
      role: 'ORG_ADMIN', // Elevate to Org Admin for the target
      username: req.user?.username || 'Superior Admin',
      email: req.user?.email || 'superior@smartaccess.io',
      isImpersonating: true,
      impersonationReason: reason,
      impersonatedAt: new Date().toISOString()
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    console.log(`[AUDIT] Impersonation initiated by ${req.user?.email || 'SA'} for Org ${orgId}. Reason: ${reason}`);

    res.json({ 
      token, 
      user: {
        ...payload,
        name: `${payload.username} (Impersonating)`
      }
    });
  } catch (err: any) {
    console.error('IMPERSONATION_FAILED:', err.message);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate shadow token' });
  }
};
