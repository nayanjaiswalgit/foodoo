import React, { useCallback } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { type IMenuItem } from '@food-delivery/shared';
import { restaurantApi } from '../../src/services/restaurant.service';
import { MenuItemCard } from '../../src/components/restaurant/MenuItemCard';
import { Rating, Badge } from '../../src/components/ui';
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
});
