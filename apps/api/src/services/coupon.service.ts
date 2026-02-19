import { type CreateCouponInput, type ValidateCouponInput } from '@food-delivery/shared';
import { Coupon } from '../models/coupon.model';
import { ApiError } from '../utils/api-error';

export const validateCoupon = async (input: ValidateCouponInput) => {
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
    filter.$or = [{ restaurant }, { restaurant: { $exists: false } }];
  }
  return Coupon.find(filter).sort({ discountValue: -1 });
};

export const createCoupon = async (data: CreateCouponInput) => {
  const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
  if (existing) throw ApiError.conflict('Coupon code already exists');
  return Coupon.create(data);
};

export const updateCoupon = async (couponId: string, data: Partial<CreateCouponInput>) => {
  const coupon = await Coupon.findByIdAndUpdate(couponId, data, { new: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return coupon;
};

export const deleteCoupon = async (couponId: string) => {
  const result = await Coupon.findByIdAndDelete(couponId);
  if (!result) throw ApiError.notFound('Coupon not found');
};
