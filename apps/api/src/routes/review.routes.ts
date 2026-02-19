import { Router } from 'express';
import { createReviewSchema, replyReviewSchema, UserRole } from '@food-delivery/shared';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as reviewController from '../controllers/review.controller';

const router: Router = Router();

router.get('/restaurant/:restaurantId', reviewController.getByRestaurant);

router.use(authenticate);
router.post(
  '/',
  authorize(UserRole.CUSTOMER),
  validate(createReviewSchema),
  reviewController.create
);
router.post(
  '/:id/reply',
  authorize(UserRole.RESTAURANT_OWNER),
  validate(replyReviewSchema),
  reviewController.reply
);

export { router as reviewRoutes };
