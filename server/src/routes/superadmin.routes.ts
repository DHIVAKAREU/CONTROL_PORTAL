import { Router } from 'express';
import { createOrganization, listOrganizations, updateOrganization } from '../controllers/org.controller';
import { impersonateOrg, getAuditLogs } from '../controllers/superadmin.controller';
import { getPlatformSettings, updatePlatformSetting } from '../controllers/settings.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Only PLATFORM_ADMIN or SUPER_ADMIN can access these
router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN', 'PLATFORM_ADMIN']));

router.post('/create-organization', createOrganization);
router.get('/list-organizations', listOrganizations);
router.patch('/update-organization/:id', updateOrganization);
router.post('/impersonate', impersonateOrg);
router.get('/audit-logs', getAuditLogs);

// Settings
router.get('/settings', getPlatformSettings);
router.patch('/settings', updatePlatformSetting);

export default router;
