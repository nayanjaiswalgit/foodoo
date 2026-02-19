import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentMethod } from '@food-delivery/shared';
import { CartItemRow } from '../../src/components/cart/CartItem';
import { Button, Card, Divider, Input, EmptyState } from '../../src/components/ui';
import { useCartStore } from '../../src/stores/cart.store';
import { addressApi } from '../../src/services/address.service';
import { orderApi } from '../../src/services/order.service';
import { couponApi } from '../../src/services/coupon.service';
import { COLORS, SPACING, FONT_SIZE } from '../../src/constants/theme';

export default function CartScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, restaurantId, restaurantName, getSubtotal, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.getAll,
  });

  const defaultAddress = addresses?.find((a) => a.isDefault) ?? addresses?.[0];
  const addressId = selectedAddress ?? defaultAddress?._id ?? null;

  const applyCouponMutation = useMutation({
    mutationFn: () => couponApi.validate(couponCode, getSubtotal(), restaurantId ?? undefined),
    onSuccess: (data: { discount: number }) => setDiscount(data.discount),
    onError: (err: Error) => Alert.alert('Invalid Coupon', err.message),
  });

  const placeOrderMutation = useMutation({
    mutationFn: () =>
      orderApi.place({
        restaurant: restaurantId!,
        items: items.map((i) => ({
          menuItem: i.menuItemId,
          quantity: i.quantity,
          variant: i.variant,
          addons: i.addons,
        })),
        deliveryAddress: addressId!,
        paymentMethod: PaymentMethod.COD,
        couponCode: couponCode || undefined,
      }),
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      router.replace(`/order/${order._id}`);
    },
    onError: (err: Error) => Alert.alert('Order Failed', err.message),
  });

  if (items.length === 0) {
    return (
      <EmptyState
        title="Cart is empty"
        message="Add items from a restaurant to get started"
        actionLabel="Browse Restaurants"
        onAction={() => router.replace('/(tabs)')}
      />
    );
  }

  const subtotal = getSubtotal();
  const deliveryFee = 30;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal + deliveryFee + tax - discount;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.restaurantName}>{restaurantName}</Text>
        {items.map((item) => (
          <CartItemRow
            key={item.menuItemId}
            menuItemId={item.menuItemId}
            name={item.name}
            price={item.price}
            quantity={item.quantity}
          />
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        {defaultAddress ? (
          <Text style={styles.addressText}>
            {defaultAddress.label} - {defaultAddress.addressLine1}, {defaultAddress.city}
          </Text>
        ) : (
          <Button
            title="Add Address"
            onPress={() => router.push('/address')}
            variant="outline"
            size="sm"
          />
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Coupon</Text>
        <View style={styles.couponRow}>
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChangeText={setCouponCode}
          />
          <Button
            title="Apply"
            onPress={() => applyCouponMutation.mutate()}
            variant="outline"
            size="sm"
            loading={applyCouponMutation.isPending}
            disabled={!couponCode}
          />
        </View>
        {discount > 0 && <Text style={styles.discountText}>-₹{discount} applied!</Text>}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Bill Summary</Text>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Subtotal</Text>
          <Text style={styles.billValue}>₹{subtotal}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          <Text style={styles.billValue}>₹{deliveryFee}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Tax (5%)</Text>
          <Text style={styles.billValue}>₹{tax}</Text>
        </View>
        {discount > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Discount</Text>
            <Text style={[styles.billValue, styles.discountValue]}>-₹{discount}</Text>
          </View>
        )}
        <Divider />
        <View style={styles.billRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>
      </Card>

      <Button
        title={`Place Order · ₹${total}`}
        onPress={() => placeOrderMutation.mutate()}
        loading={placeOrderMutation.isPending}
        disabled={!addressId}
        fullWidth
        size="lg"
        style={styles.placeBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  restaurantName: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  section: { marginTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  addressText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  couponRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  discountText: { fontSize: FONT_SIZE.sm, color: COLORS.success, fontWeight: '600', marginTop: SPACING.xs },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  billLabel: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  billValue: { fontSize: FONT_SIZE.md, color: COLORS.text },
  discountValue: { color: COLORS.success },
  totalLabel: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  placeBtn: { marginTop: SPACING.xl },
});
