import { create } from 'zustand';
import { type IUser } from '@food-delivery/shared';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: IUser) => void;
  setTokens: (accessToken: string) => void;
  logout: () => void;
  hydrate: () => boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  setTokens: (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      set({ isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isAuthenticated: false, isLoading: false });
    return false;
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
