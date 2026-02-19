export const FeatureFlag = {
  ENABLE_REVIEWS: 'enable_reviews',
  ENABLE_COUPONS: 'enable_coupons',
  ENABLE_LIVE_TRACKING: 'enable_live_tracking',
  ENABLE_WALLET: 'enable_wallet',
  ENABLE_REFERRAL: 'enable_referral',
  ENABLE_SCHEDULE_ORDER: 'enable_schedule_order',
  ENABLE_DARK_MODE: 'enable_dark_mode',
  ENABLE_MULTI_RESTAURANT_CART: 'enable_multi_restaurant_cart',
  MAINTENANCE_MODE: 'maintenance_mode',
} as const;

export type FeatureFlag = (typeof FeatureFlag)[keyof typeof FeatureFlag];

export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.ENABLE_REVIEWS]: true,
  [FeatureFlag.ENABLE_COUPONS]: true,
  [FeatureFlag.ENABLE_LIVE_TRACKING]: true,
  [FeatureFlag.ENABLE_WALLET]: false,
  [FeatureFlag.ENABLE_REFERRAL]: false,
  [FeatureFlag.ENABLE_SCHEDULE_ORDER]: false,
  [FeatureFlag.ENABLE_DARK_MODE]: false,
  [FeatureFlag.ENABLE_MULTI_RESTAURANT_CART]: false,
  [FeatureFlag.MAINTENANCE_MODE]: false,
};
