import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type IRestaurant } from '@food-delivery/shared';
import { restaurantApi } from '../../services/restaurant.service';
import { Rating } from '../ui/Rating';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

interface RestaurantCardProps {
  restaurant: IRestaurant;
  isFavorite?: boolean;
}

export const RestaurantCard = ({ restaurant, isFavorite }: RestaurantCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const favMutation = useMutation({
    mutationFn: () => restaurantApi.toggleFavorite(restaurant._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handlePress = () => {
    router.push(`/restaurant/${restaurant._id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.card}>
      <Image source={{ uri: restaurant.image }} style={styles.image} contentFit="cover" />
      {restaurant.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={(e) => { e.stopPropagation(); favMutation.mutate(); }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.heartIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
          <Rating average={restaurant.rating.average} count={restaurant.rating.count} size="sm" />
        </View>
        <Text style={styles.cuisines} numberOfLines={1}>
          {restaurant.cuisines.join(' · ')}
        </Text>
        <View style={styles.row}>
          <Text style={styles.meta}>{restaurant.avgDeliveryTime} min</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>₹{restaurant.deliveryFee} delivery</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>{'₹'.repeat(restaurant.priceRange)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: '100%', height: 160 },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  featuredText: { color: '#FFF', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  heartBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: RADIUS.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: { fontSize: 16 },
  info: { padding: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: SPACING.sm },
  cuisines: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  meta: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  dot: { color: COLORS.textLight, marginHorizontal: SPACING.xs },
});
