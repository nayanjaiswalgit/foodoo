import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { type IRestaurant } from '@food-delivery/shared';
import { restaurantApi } from '../../src/services/restaurant.service';
import { RestaurantCard } from '../../src/components/restaurant/RestaurantCard';
import { FilterBar } from '../../src/components/restaurant/FilterBar';
import { RestaurantCardSkeleton, EmptyState } from '../../src/components/ui';
import { useLocation } from '../../src/hooks/use-location';
import { useCartStore } from '../../src/stores/cart.store';
import { COLORS, SPACING, FONT_SIZE } from '../../src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { address, requestLocation } = useLocation();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const [cuisine, setCuisine] = useState<string | null>(null);

  const { data, fetchNextPage, hasNextPage, isLoading, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['restaurants', cuisine],
    queryFn: ({ pageParam = 1 }) =>
      restaurantApi.list({ page: pageParam as number, limit: 10, cuisine: cuisine ?? undefined }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const restaurants = data?.pages.flatMap((p) => p.data) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: IRestaurant }) => <RestaurantCard restaurant={item} />,
    []
  );

  return (
    <View style={styles.container}>
      {/* Location Header */}
      <TouchableOpacity onPress={requestLocation} style={styles.locationBar}>
        <Text style={styles.locationLabel}>📍 Deliver to</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {address ?? 'Select Location'}
        </Text>
      </TouchableOpacity>

      <FilterBar selectedCuisine={cuisine} onSelectCuisine={setCuisine} />

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </View>
      ) : restaurants.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          message="Try changing your filters or location"
          actionLabel="Clear Filters"
          onAction={() => setCuisine(null)}
        />
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartFab}>
          <Text style={styles.cartFabText}>🛒 {cartItemCount} items in cart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  locationBar: { backgroundColor: COLORS.surface, padding: SPACING.lg, paddingTop: SPACING.sm },
  locationLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  locationText: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  list: { padding: SPACING.lg },
  cartFab: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.xl,
    right: SPACING.xl,
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cartFabText: { color: '#FFF', fontSize: FONT_SIZE.md, fontWeight: '700' },
});
