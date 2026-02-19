import { Router } from 'express';
import { createCouponSchema, validateCouponSchema, UserRole } from '@food-delivery/shared';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as couponController from '../controllers/coupon.controller';

const router = Router();

router.use(authenticate);
router.post('/validate', validate(validateCouponSchema), couponController.validate);
router.get('/available', couponController.getAvailable);
router.post('/', authorize(UserRole.SUPER_ADMIN), validate(createCouponSchema), couponController.create);
router.patch('/:id', authorize(UserRole.SUPER_ADMIN), couponController.update);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN), couponController.remove);

export { router as couponRoutes };
