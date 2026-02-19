import { type IRestaurant, type IMenuItem, type PaginatedResponse } from '@food-delivery/shared';
import { apiClient } from '../lib/api-client';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  cuisine?: string;
  priceRange?: number;
  sortBy?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export const restaurantApi = {
  list: (params: ListParams) =>
    apiClient.get<PaginatedResponse<IRestaurant>>('/restaurants', { params }).then((r) => r.data),

  nearby: (lat: number, lng: number, radius = 5) =>
    apiClient
      .get<{ data: IRestaurant[] }>('/restaurants/nearby', { params: { lat, lng, radius } })
      .then((r) => r.data.data),

  getById: (id: string) =>
    apiClient.get<{ data: IRestaurant }>(`/restaurants/${id}`).then((r) => r.data.data),

  getMenu: (id: string) =>
    apiClient.get<{ data: IMenuItem[] }>(`/restaurants/${id}/menu`).then((r) => r.data.data),

  toggleFavorite: (id: string) =>
    apiClient.post(`/users/favorites/${id}`).then((r) => r.data.data),
};
