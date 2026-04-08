import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// roles: SUPER_ADMIN, ORG_ADMIN, USER
router.get('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), getUsers);
router.post('/', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), createUser);
router.put('/:id', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), updateUser);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'ORG_ADMIN']), deleteUser);

export default router;
