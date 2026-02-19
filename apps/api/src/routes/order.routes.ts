import { Router } from 'express';
import { placeOrderSchema, updateOrderStatusSchema, UserRole } from '@food-delivery/shared';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.use(authenticate);
router.post('/', authorize(UserRole.CUSTOMER), validate(placeOrderSchema), orderController.placeOrder);
router.get('/my', authorize(UserRole.CUSTOMER), orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', authorize(UserRole.CUSTOMER), orderController.cancelOrder);
router.get(
  '/restaurant/:restaurantId',
  authorize(UserRole.RESTAURANT_OWNER, UserRole.SUPER_ADMIN),
  orderController.getRestaurantOrders
);
router.patch(
  '/:id/status',
  authorize(UserRole.RESTAURANT_OWNER, UserRole.DELIVERY_PARTNER, UserRole.SUPER_ADMIN),
  validate(updateOrderStatusSchema),
  orderController.updateStatus
);

export { router as orderRoutes };
