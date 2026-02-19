import { apiClient } from '../lib/api-client';
import { type CreateMenuItemInput, type UpdateMenuItemInput } from '@food-delivery/shared';

export const restaurantApi = {
  getMyRestaurant: () => apiClient.get('/restaurants/owner/mine').then((r) => r.data.data),

  getMenu: (restaurantId: string) =>
    apiClient.get(`/restaurants/${restaurantId}/menu`).then((r) => r.data.data),

  getOrders: (restaurantId: string, page = 1, status?: string) =>
    apiClient
      .get(`/orders/restaurant/${restaurantId}`, { params: { page, status } })
      .then((r) => r.data),

  updateOrderStatus: (orderId: string, status: string, note?: string) =>
    apiClient.patch(`/orders/${orderId}/status`, { status, note }).then((r) => r.data.data),

  createMenuItem: (restaurantId: string, data: CreateMenuItemInput) =>
    apiClient.post(`/menu/${restaurantId}`, data).then((r) => r.data.data),

  updateMenuItem: (itemId: string, data: UpdateMenuItemInput) =>
    apiClient.patch(`/menu/${itemId}`, data).then((r) => r.data.data),

  deleteMenuItem: (itemId: string) => apiClient.delete(`/menu/${itemId}`),

  toggleMenuItemAvailability: (itemId: string) =>
    apiClient.patch(`/menu/${itemId}/toggle`).then((r) => r.data.data),

  getCategories: () => apiClient.get('/menu/categories').then((r) => r.data.data),

  getReviews: (restaurantId: string, page = 1) =>
    apiClient.get(`/reviews/restaurant/${restaurantId}`, { params: { page } }).then((r) => r.data),
};
