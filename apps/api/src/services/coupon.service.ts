import { type CreateCouponInput, type ValidateCouponInput } from '@food-delivery/shared';
import { Coupon } from '../models/coupon.model';
import { CouponUsage } from '../models/coupon-usage.model';
import { ApiError } from '../utils/api-error';

export const validateCoupon = async (input: ValidateCouponInput, userId?: string) => {
  const coupon = await Coupon.findOne({
    code: input.code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
    $expr: { $lt: ['$usedCount', '$usageLimit'] },
  });

  if (!coupon) throw ApiError.badRequest('Invalid or expired coupon');
  if (input.orderAmount < coupon.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order ₹${coupon.minOrderAmount} required`);
  }
  if (coupon.restaurant && input.restaurant !== coupon.restaurant.toString()) {
    throw ApiError.badRequest('Coupon not valid for this restaurant');
  }

  // Check per-user usage limit
  if (userId && coupon.maxUsagePerUser > 0) {
    const usage = await CouponUsage.findOne({ coupon: coupon._id, user: userId });
    if (usage && usage.count >= coupon.maxUsagePerUser) {
      throw ApiError.badRequest('You have reached the usage limit for this coupon');
    }
  }

  const discount =
    coupon.discountType === 'percentage'
      ? Math.min((input.orderAmount * coupon.discountValue) / 100, coupon.maxDiscount)
      : Math.min(coupon.discountValue, coupon.maxDiscount);

  return { coupon, discount: Math.round(discount) };
};

export const getAvailableCoupons = async (restaurant?: string) => {
  const filter: Record<string, unknown> = {
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
    $expr: { $lt: ['$usedCount', '$usageLimit'] },
  };
  if (restaurant) {
    filter.$or = [{ restaurant }, { restaurant: null }, { restaurant: { $exists: false } }];
  }
  return Coupon.find(filter).sort({ discountValue: -1 });
};

export const createCoupon = async (data: CreateCouponInput) => {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) throw ApiError.conflict('Coupon code already exists');
  return Coupon.create(data);
};

const COUPON_UPDATABLE_FIELDS = [
  'discountType',
  'discountValue',
  'minOrderAmount',
  'maxDiscount',
  'validFrom',
  'validUntil',
  'usageLimit',
  'maxUsagePerUser',
  'isActive',
  'restaurant',
] as const;

export const updateCoupon = async (couponId: string, data: Partial<CreateCouponInput>) => {
  const sanitized: Record<string, unknown> = {};
  for (const field of COUPON_UPDATABLE_FIELDS) {
    if (field in data && data[field as keyof typeof data] !== undefined) {
      sanitized[field] = data[field as keyof typeof data];
    }
  }
  const coupon = await Coupon.findByIdAndUpdate(couponId, sanitized, { new: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return coupon;
};

export const deleteCoupon = async (couponId: string) => {
  const result = await Coupon.findByIdAndDelete(couponId);
  if (!result) throw ApiError.notFound('Coupon not found');
};
