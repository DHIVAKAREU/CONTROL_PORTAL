import { Router } from 'express';
import { createUser, createAdmin, listUsers } from '../controllers/users.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Only ORG_ADMIN or SUPER_ADMIN can access these
router.use(authenticate);
router.use(requireRole(['ORG_ADMIN', 'SUPER_ADMIN']));

router.get('/', listUsers);
router.post('/', createUser);
router.post('/create-user', createUser);
router.post('/create-admin', createAdmin);
router.get('/list-users', listUsers);

export default router;
