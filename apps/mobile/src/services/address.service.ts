import { type CreateAddressInput, type IAddress } from '@food-delivery/shared';
import { apiClient } from '../lib/api-client';

export const addressApi = {
  getAll: () =>
    apiClient.get<{ data: IAddress[] }>('/addresses').then((r) => r.data.data),

  create: (data: CreateAddressInput) =>
    apiClient.post<{ data: IAddress }>('/addresses', data).then((r) => r.data.data),

  update: (id: string, data: Partial<CreateAddressInput>) =>
    apiClient.patch<{ data: IAddress }>(`/addresses/${id}`, data).then((r) => r.data.data),

  remove: (id: string) => apiClient.delete(`/addresses/${id}`),

  setDefault: (id: string) =>
    apiClient.patch<{ data: IAddress }>(`/addresses/${id}/default`).then((r) => r.data.data),
};
