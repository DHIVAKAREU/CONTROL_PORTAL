import { Router } from 'express';
import { getPermissions, createPermission, revokePermission, simulateScan } from '../controllers/permissions.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), getPermissions);
router.post('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), createPermission);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), revokePermission);
router.post('/simulate', authenticate, simulateScan);

export default router;
