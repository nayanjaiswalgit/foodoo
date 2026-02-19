import { apiClient } from '../lib/api-client';

export const featureFlagApi = {
  getAll: () =>
    apiClient.get<{ data: Record<string, boolean> }>('/admin/feature-flags').then((r) => r.data.data),
};
