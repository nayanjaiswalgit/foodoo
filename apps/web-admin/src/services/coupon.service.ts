import { apiClient } from '../lib/api-client';
import { type ICoupon, type CreateCouponInput } from '@food-delivery/shared';

export const couponApi = {
  getAvailable: (restaurant?: string) =>
    apiClient
      .get<{ data: ICoupon[] }>('/coupons/available', {
        params: { restaurant },
      })
      .then((r) => r.data.data),

  create: (data: CreateCouponInput) =>
    apiClient.post<{ data: ICoupon }>('/coupons', data).then((r) => r.data.data),

  update: (id: string, data: Partial<CreateCouponInput>) =>
    apiClient.patch<{ data: ICoupon }>(`/coupons/${id}`, data).then((r) => r.data.data),

  remove: (id: string) => apiClient.delete(`/coupons/${id}`),
};
