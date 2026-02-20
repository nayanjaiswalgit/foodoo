export {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth';
export type {
  RegisterInput,
  LoginInput,
  SendOtpInput,
  VerifyOtpInput,
  UpdateProfileInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth';

export { createRestaurantSchema, updateRestaurantSchema } from './restaurant';
export type { CreateRestaurantInput, UpdateRestaurantInput } from './restaurant';

export { createMenuItemSchema, updateMenuItemSchema, createCategorySchema } from './menu';
export type { CreateMenuItemInput, UpdateMenuItemInput, CreateCategoryInput } from './menu';

export { placeOrderSchema, updateOrderStatusSchema } from './order';
export type { PlaceOrderInput, UpdateOrderStatusInput } from './order';

export { createAddressSchema, updateAddressSchema } from './address';
export type { CreateAddressInput, UpdateAddressInput } from './address';

export { createReviewSchema, replyReviewSchema } from './review';
export type { CreateReviewInput, ReplyReviewInput } from './review';

export { createCouponSchema, validateCouponSchema } from './coupon';
export type { CreateCouponInput, ValidateCouponInput } from './coupon';
