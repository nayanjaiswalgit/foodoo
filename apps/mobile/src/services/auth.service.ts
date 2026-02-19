import { type RegisterInput, type LoginInput, type ILoginResponse } from '@food-delivery/shared';
import { apiClient } from '../lib/api-client';

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<{ data: ILoginResponse }>('/auth/register', data).then((r) => r.data.data),

  login: (data: LoginInput) =>
    apiClient.post<{ data: ILoginResponse }>('/auth/login', data).then((r) => r.data.data),

  sendOtp: (phone: string) => apiClient.post('/auth/send-otp', { phone }).then((r) => r.data),

  verifyOtp: (phone: string, otp: string) =>
    apiClient
      .post<{ data: ILoginResponse }>('/auth/verify-otp', { phone, otp })
      .then((r) => r.data.data),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh-token', { refreshToken }).then((r) => r.data.data),

  logout: () => apiClient.post('/auth/logout'),

  getProfile: () => apiClient.get('/users/profile').then((r) => r.data.data),
};
