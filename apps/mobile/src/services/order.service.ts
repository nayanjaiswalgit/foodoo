import { type PlaceOrderInput, type IOrder, type PaginatedResponse } from '@food-delivery/shared';
import { apiClient } from '../lib/api-client';

export const orderApi = {
  place: (data: PlaceOrderInput, idempotencyKey?: string) =>
    apiClient.post<{ data: IOrder }>('/orders', data, {
      ...(idempotencyKey && { headers: { 'X-Idempotency-Key': idempotencyKey } }),
    }).then((r) => r.data.data),

  getMyOrders: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<IOrder>>('/orders/my', { params: { page, limit } }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<{ data: IOrder }>(`/orders/${id}`).then((r) => r.data.data),

  cancel: (id: string) =>
    apiClient.post<{ data: IOrder }>(`/orders/${id}/cancel`).then((r) => r.data.data),
};
