import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/auth.store';
import { deliveryApi } from '../src/services/delivery.service';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30 * 1000, retry: 1 } },
});

export default function RootLayout() {
  const { hydrate, setUser, logout } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      const hasToken = await hydrate();
      if (hasToken) {
        try {
          const user = await deliveryApi.getProfile();
          setUser(user);
        } catch {
          await logout();
        }
      }
    };
    init();
  }, [hydrate, setUser, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#2D3436' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#F8F9FA' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: 'Delivery Partner' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Active Delivery' }} />
        <Stack.Screen name="earnings" options={{ title: 'My Earnings' }} />
      </Stack>
    </QueryClientProvider>
  );
}
