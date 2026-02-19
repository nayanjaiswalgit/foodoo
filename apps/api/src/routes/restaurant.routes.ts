import { Router } from 'express';
import { createRestaurantSchema, updateRestaurantSchema, UserRole } from '@food-delivery/shared';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as restaurantController from '../controllers/restaurant.controller';

const router: Router = Router();

router.get('/', restaurantController.list);
router.get('/nearby', restaurantController.nearby);
router.get('/:id', restaurantController.getById);
router.get('/:id/menu', restaurantController.getMenu);

router.use(authenticate);
router.get('/owner/mine', authorize(UserRole.RESTAURANT_OWNER), restaurantController.getOwnerRestaurant);
router.post('/', authorize(UserRole.RESTAURANT_OWNER), validate(createRestaurantSchema), restaurantController.create);
router.patch('/:id', authorize(UserRole.RESTAURANT_OWNER), validate(updateRestaurantSchema), restaurantController.update);

export { router as restaurantRoutes };
