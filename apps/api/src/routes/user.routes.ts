import { Router } from 'express';
import { updateProfileSchema } from '@food-delivery/shared';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import * as userController from '../controllers/user.controller';

const router: Router = Router();

router.use(authenticate);
router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post('/favorites/:restaurantId', userController.toggleFavorite);

export { router as userRoutes };
