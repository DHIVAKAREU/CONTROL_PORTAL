import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getStats, getZones } from '../controllers/org.controller';

const router = Router();

router.get('/stats', authenticate, getStats);
router.get('/zones', authenticate, getZones);

export default router;
