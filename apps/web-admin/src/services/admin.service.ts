import { apiClient } from '../lib/api-client';
import { type ILoginResponse, type LoginInput } from '@food-delivery/shared';

export const adminApi = {
  login: (data: LoginInput) =>
    apiClient.post<{ data: ILoginResponse }>('/auth/login', data).then((r) => r.data.data),

  getProfile: () => apiClient.get('/users/profile').then((r) => r.data.data),

  getDashboard: () => apiClient.get('/admin/dashboard').then((r) => r.data.data),

  getUsers: (page = 1, limit = 20, role?: string) =>
    apiClient.get('/admin/users', { params: { page, limit, role } }).then((r) => r.data),

  toggleUserActive: (id: string) =>
    apiClient.patch(`/admin/users/${id}/toggle`).then((r) => r.data.data),

  getRestaurants: (page = 1, limit = 20) =>
    apiClient.get('/admin/restaurants', { params: { page, limit } }).then((r) => r.data),

  toggleRestaurantActive: (id: string) =>
    apiClient.patch(`/admin/restaurants/${id}/toggle`).then((r) => r.data.data),

  updateCommission: (id: string, commission: number) =>
    apiClient.patch(`/admin/restaurants/${id}/commission`, { commission }).then((r) => r.data.data),

  getFeatureFlags: () => apiClient.get('/admin/feature-flags').then((r) => r.data.data),

  toggleFeatureFlag: (key: string) =>
    apiClient.patch(`/admin/feature-flags/${key}`).then((r) => r.data.data),
};
