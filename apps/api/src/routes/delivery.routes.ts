import { Router } from 'express';
import { UserRole } from '@food-delivery/shared';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as deliveryController from '../controllers/delivery.controller';

const router: Router = Router();

router.use(authenticate, authorize(UserRole.DELIVERY_PARTNER));
router.post('/register', deliveryController.register);
router.patch('/toggle-online', deliveryController.toggleOnline);
router.patch('/location', deliveryController.updateLocation);
router.get('/available-orders', deliveryController.getAvailableOrders);
router.post('/accept/:orderId', deliveryController.acceptOrder);
router.post('/complete/:orderId', deliveryController.completeDelivery);
router.get('/earnings', deliveryController.getEarnings);
router.get('/earnings/history', deliveryController.getEarningsHistory);

export { router as deliveryRoutes };
