import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/query-client';
import { useAuthStore } from '../src/stores/auth.store';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant/[id]" options={{ title: '' }} />
        <Stack.Screen name="cart/index" options={{ title: 'Cart' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
        <Stack.Screen name="address/index" options={{ title: 'My Addresses' }} />
        <Stack.Screen name="profile/index" options={{ title: 'Profile' }} />
      </Stack>
    </QueryClientProvider>
  );
}
