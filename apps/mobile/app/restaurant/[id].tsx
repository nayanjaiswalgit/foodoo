import React, { useCallback } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { type IMenuItem, type IReview } from '@food-delivery/shared';
import { restaurantApi } from '../../src/services/restaurant.service';
import { reviewApi } from '../../src/services/review.service';
import { MenuItemCard } from '../../src/components/restaurant/MenuItemCard';
import { Rating, Badge, Card } from '../../src/components/ui';
import { useCartStore } from '../../src/stores/cart.store';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, clearCart, getItemCount, restaurantId: cartRestaurantId } = useCartStore();

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantApi.getById(id),
    enabled: !!id,
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => restaurantApi.getMenu(id),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewApi.getByRestaurant(id, 1, 5),
    enabled: !!id,
  });

  const sections = React.useMemo(() => {
    if (!menuItems) return [];
    const grouped = new Map<string, IMenuItem[]>();
    for (const item of menuItems) {
      const cat = typeof item.category === 'object' ? (item.category as { name: string }).name : 'Other';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(item);
    }
    return Array.from(grouped.entries()).map(([title, data]) => ({ title, data }));
  }, [menuItems]);

  const handleAddItem = useCallback(
    (item: IMenuItem) => {
      if (!restaurant) return;

      const success = addItem(restaurant._id, restaurant.name, {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        addons: [],
        addonPrices: [],
        image: item.image,
      });

      if (!success) {
        Alert.alert(
          'Replace cart?',
          `Your cart has items from another restaurant. Replace with items from ${restaurant.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Replace',
              style: 'destructive',
              onPress: () => {
                clearCart();
                addItem(restaurant._id, restaurant.name, {
                  menuItemId: item._id,
                  name: item.name,
                  price: item.price,
                  quantity: 1,
                  addons: [],
                  addonPrices: [],
                  image: item.image,
                });
              },
            },
          ]
        );
      }
    },
    [restaurant, addItem, clearCart]
  );

  const cartCount = getItemCount();

  if (!restaurant) return null;

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MenuItemCard item={item} onAdd={handleAddItem} />}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        ListHeaderComponent={
          <View>
            <Image source={{ uri: restaurant.image }} style={styles.coverImage} contentFit="cover" />
            <View style={styles.info}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.cuisines}>{restaurant.cuisines.join(' · ')}</Text>
              <View style={styles.metaRow}>
                <Rating average={restaurant.rating.average} count={restaurant.rating.count} />
                <Badge text={`${restaurant.avgDeliveryTime} min`} />
                <Badge text={`₹${restaurant.minOrderAmount} min order`} />
              </View>
              <Text style={styles.description}>{restaurant.description}</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          reviewsData?.data && reviewsData.data.length > 0 ? (
            <View style={styles.reviewsSection}>
              <Text style={styles.reviewsSectionTitle}>Reviews</Text>
              {reviewsData.data.map((review: IReview) => (
                <Card key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>
                      {typeof review.user === 'object' ? (review.user as { name: string }).name : 'Customer'}
                    </Text>
                    <Text style={styles.reviewStars}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </Card>
              ))}
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />

      {cartCount > 0 && cartRestaurantId === id && (
        <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartBar}>
          <Text style={styles.cartText}>{cartCount} items added</Text>
          <Text style={styles.cartAction}>VIEW CART →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  coverImage: { width: '100%', height: 200 },
  info: { padding: SPACING.lg, backgroundColor: COLORS.surface },
  name: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.text },
  cuisines: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, marginTop: SPACING.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  description: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: SPACING.md, lineHeight: 20 },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartText: { color: '#FFF', fontSize: FONT_SIZE.md, fontWeight: '600' },
  cartAction: { color: '#FFF', fontSize: FONT_SIZE.md, fontWeight: '700' },
  reviewsSection: { paddingTop: SPACING.xl },
  reviewsSectionTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  reviewCard: { marginBottom: SPACING.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  reviewUser: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  reviewStars: { fontSize: FONT_SIZE.md, color: COLORS.star },
  reviewComment: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 18 },
  reviewDate: { fontSize: FONT_SIZE.xs, color: COLORS.textLight, marginTop: SPACING.xs },
});
