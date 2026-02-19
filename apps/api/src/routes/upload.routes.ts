import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import * as uploadController from '../controllers/upload.controller';

const router: Router = Router();

router.use(authenticate);
router.post('/single', upload.single('image'), uploadController.uploadSingle);
router.post('/multiple', upload.array('images', 5), uploadController.uploadMultiple);

export { router as uploadRoutes };
