import { Router } from 'express';
import { createMenuItemSchema, updateMenuItemSchema, createCategorySchema, UserRole } from '@food-delivery/shared';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as menuController from '../controllers/menu.controller';

const router: Router = Router();

router.get('/categories', menuController.getCategories);

router.use(authenticate);
router.post(
  '/categories',
  authorize(UserRole.RESTAURANT_OWNER, UserRole.SUPER_ADMIN),
  validate(createCategorySchema),
  menuController.createCategory
);
router.post(
  '/:restaurantId',
  authorize(UserRole.RESTAURANT_OWNER),
  validate(createMenuItemSchema),
  menuController.createItem
);
router.patch(
  '/:id',
  authorize(UserRole.RESTAURANT_OWNER),
  validate(updateMenuItemSchema),
  menuController.updateItem
);
router.delete('/:id', authorize(UserRole.RESTAURANT_OWNER), menuController.deleteItem);
router.patch('/:id/toggle', authorize(UserRole.RESTAURANT_OWNER), menuController.toggleAvailability);

export { router as menuRoutes };
