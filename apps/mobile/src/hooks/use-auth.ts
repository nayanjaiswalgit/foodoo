import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type RegisterInput, type LoginInput } from '@food-delivery/shared';
import { useAuthStore } from '../stores/auth.store';
import { authApi } from '../services/auth.service';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setUser, setTokens, logout: storeLogout, isAuthenticated } = useAuthStore();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: async (result) => {
      await setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: async (result) => {
      await setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      setUser(result.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await storeLogout();
      queryClient.clear();
    },
  });

  return {
    user: profileQuery.data ?? useAuthStore.getState().user,
    isAuthenticated,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    profileQuery,
  };
};
