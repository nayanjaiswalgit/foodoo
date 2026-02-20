export interface ICoupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  maxUsagePerUser: number;
  isActive: boolean;
  restaurant?: string;
  createdAt: string;
  updatedAt: string;
}
