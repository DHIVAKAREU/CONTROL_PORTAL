import { Router } from 'express';
import { impersonateTenant } from '../controllers/platform.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN']));

router.post('/impersonate/:id', impersonateTenant);

export default router;
