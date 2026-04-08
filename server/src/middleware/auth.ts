import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev-only';

export interface AuthPayload {
  userId: string;
  tenantId: string;
  role: 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'ORG_ADMIN' | 'USER';
  username: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
     res.status(401).json({ error: 'UNAUTHORIZED', message: 'No token provided' });
     return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('JWT_VERIFICATION_FAILED:', {
      error: error.message,
      token_preview: token.substring(0, 10) + '...',
      secret_configured: JWT_SECRET !== 'super-secret-key-for-dev-only'
    });
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token', detailed: error.message });
  }
};

export const requireRole = (roles: ('SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'ORG_ADMIN' | 'USER')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'INSUFFICIENT_ROLE', required: roles, current: req.user.role });
      return;
    }
    
    next();
  };
};

export const requirePasswordChanged = (req: AuthRequest, res: Response, next: NextFunction): void => {
    next(); 
};
