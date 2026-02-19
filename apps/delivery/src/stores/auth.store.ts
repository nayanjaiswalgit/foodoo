import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { type IUser } from '@food-delivery/shared';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  setUser: (user: IUser) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setOnline: (online: boolean) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isOnline: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  },

  setOnline: (isOnline) => set({ isOnline }),

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false, isOnline: false });
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return !!token;
  },
}));
