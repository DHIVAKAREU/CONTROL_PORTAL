import { Router } from 'express';
import { getZones, createZone, updateZone, deleteZone } from '../controllers/zones.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// roles: SUPER_ADMIN, ORG_ADMIN, USER
router.get('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'USER']), getZones);
router.post('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), createZone);
router.put('/:id', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), updateZone);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), deleteZone);

export default router;
