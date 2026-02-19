import { apiClient } from '../lib/api-client';
import { type ILoginResponse, type LoginInput } from '@food-delivery/shared';

export const deliveryApi = {
  login: (data: LoginInput) =>
    apiClient.post<{ data: ILoginResponse }>('/auth/login', data).then((r) => r.data.data),

  getProfile: () => apiClient.get('/users/profile').then((r) => r.data.data),

  logout: () => apiClient.post('/auth/logout'),

  toggleOnline: () => apiClient.patch('/delivery/toggle-online').then((r) => r.data.data),

  updateLocation: (coordinates: [number, number]) =>
    apiClient.patch('/delivery/location', { coordinates }).then((r) => r.data.data),

  getAvailableOrders: () => apiClient.get('/delivery/available-orders').then((r) => r.data.data),

  acceptOrder: (orderId: string) =>
    apiClient.post(`/delivery/accept/${orderId}`).then((r) => r.data.data),

  completeDelivery: (orderId: string) =>
    apiClient.post(`/delivery/complete/${orderId}`).then((r) => r.data.data),

  updateOrderStatus: (orderId: string, status: string) =>
    apiClient.patch(`/orders/${orderId}/status`, { status }).then((r) => r.data.data),

  getEarnings: () => apiClient.get('/delivery/earnings').then((r) => r.data.data),
};
