import { Router } from 'express';
import { UserRole } from '@food-delivery/shared';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router: Router = Router();

router.use(authenticate, authorize(UserRole.SUPER_ADMIN));
router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/toggle', adminController.toggleUserActive);
router.get('/restaurants', adminController.listRestaurants);
router.patch('/restaurants/:id/toggle', adminController.toggleRestaurantActive);
router.patch('/restaurants/:id/commission', adminController.updateCommission);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/feature-flags', adminController.getFeatureFlags);
router.patch('/feature-flags/:key', adminController.toggleFeatureFlag);

export { router as adminRoutes };
