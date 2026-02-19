import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { type IRestaurant } from '@food-delivery/shared';
import { restaurantApi } from '../../src/services/restaurant.service';
import { RestaurantCard } from '../../src/components/restaurant/RestaurantCard';
import { Input, EmptyState, RestaurantCardSkeleton } from '../../src/components/ui';
import { useDebounce } from '../../src/hooks/use-debounce';
import { COLORS, SPACING } from '../../src/constants/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => restaurantApi.list({ search: debouncedQuery, limit: 20 }),
    enabled: debouncedQuery.length >= 2,
  });

  const restaurants = data?.data ?? [];

  const renderItem = ({ item }: { item: IRestaurant }) => <RestaurantCard restaurant={item} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Input
          placeholder="Search restaurants, cuisines..."
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          title="Something went wrong"
          message="Failed to load restaurants. Please try again."
        />
      ) : debouncedQuery.length < 2 ? (
        <EmptyState title="Search for food" message="Type at least 2 characters to search" />
      ) : restaurants.length === 0 ? (
        <EmptyState title="No results" message={`No restaurants found for "${debouncedQuery}"`} />
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBox: { padding: SPACING.lg, backgroundColor: COLORS.surface },
  list: { padding: SPACING.lg },
});
