import { Router } from 'express';
import { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from '@food-delivery/shared';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter, otpLimiter } from '../middleware/rate-limit.middleware';
import * as authController from '../controllers/auth.controller';

const router: Router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export { router as authRoutes };
