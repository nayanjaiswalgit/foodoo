import mongoose, { type Document, Schema } from 'mongoose';

export interface ICouponUsageDocument extends Document {
  coupon: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  count: number;
}

const couponUsageSchema = new Schema<ICouponUsageDocument>(
  {
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

couponUsageSchema.index({ coupon: 1, user: 1 }, { unique: true });

export const CouponUsage = mongoose.model<ICouponUsageDocument>('CouponUsage', couponUsageSchema);
