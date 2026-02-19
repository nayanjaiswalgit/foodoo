import { type ICoupon } from '@food-delivery/shared';
import { apiClient } from '../lib/api-client';

export const couponApi = {
  validate: (code: string, orderAmount: number, restaurant?: string) =>
    apiClient.post('/coupons/validate', { code, orderAmount, restaurant }).then((r) => r.data.data),

  getAvailable: (restaurant?: string) =>
    apiClient
      .get<{ data: ICoupon[] }>('/coupons/available', { params: { restaurant } })
      .then((r) => r.data.data),
};
