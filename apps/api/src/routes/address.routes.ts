import { Router } from 'express';
import { createAddressSchema, updateAddressSchema } from '@food-delivery/shared';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as addressController from '../controllers/address.controller';

const router = Router();

router.use(authenticate);
router.get('/', addressController.getAddresses);
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.patch('/:id', validate(updateAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefault);

export { router as addressRoutes };
