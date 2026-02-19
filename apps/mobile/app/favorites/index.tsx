import React from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type IRestaurant } from '@food-delivery/shared';
import { apiClient } from '../../src/lib/api-client';
import { restaurantApi } from '../../src/services/restaurant.service';
import { RestaurantCard } from '../../src/components/restaurant/RestaurantCard';
import { EmptyState } from '../../src/components/ui';
import { COLORS, SPACING } from '../../src/constants/theme';

export default function FavoritesScreen() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get<{ data: { favorites: IRestaurant[] } }>('/users/profile').then((r) => r.data.data),
  });

  const favorites = profile?.favorites ?? [];

  const removeMutation = useMutation({
    mutationFn: (id: string) => restaurantApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  if (!isLoading && favorites.length === 0) {
    return (
      <EmptyState
        icon="❤️"
        title="No favorites yet"
        subtitle="Like restaurants to see them here"
      />
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <RestaurantCard restaurant={item} />}
      contentContainerStyle={styles.list}
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.lg },
});
