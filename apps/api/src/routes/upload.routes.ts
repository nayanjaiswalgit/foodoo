import { Router } from 'express';
import { UserRole } from '@food-delivery/shared';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import * as uploadController from '../controllers/upload.controller';

const router: Router = Router();

router.use(authenticate);
router.use(authorize(UserRole.RESTAURANT_OWNER, UserRole.SUPER_ADMIN));
router.post('/single', upload.single('image'), uploadController.uploadSingle);
router.post('/multiple', upload.array('images', 5), uploadController.uploadMultiple);

export { router as uploadRoutes };
