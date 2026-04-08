import { Router } from 'express';
import { getZones, createZone } from '../controllers/zones.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// roles: SUPER_ADMIN, ORG_ADMIN, USER
router.get('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'USER']), getZones);
router.post('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), createZone);

export default router;
