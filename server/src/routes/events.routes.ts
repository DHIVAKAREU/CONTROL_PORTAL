import { Router } from 'express';
import { getEvents, createEvent } from '../controllers/events.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN', 'USER']), getEvents);
router.post('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), createEvent);

export default router;
