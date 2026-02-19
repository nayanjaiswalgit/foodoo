import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../src/services/order.service';
import { Card, Badge, Divider, Button } from '../../src/components/ui';
import { useSocket } from '../../src/hooks/use-socket';
import { COLORS, SPACING, FONT_SIZE } from '../../src/constants/theme';

const STATUS_LABELS: Record<string, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { emit, on } = useSocket('orders');

  const { data: order, refetch, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
    refetchInterval: 10000,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      refetch();
    },
    onError: (err: Error) => Alert.alert('Cancel Failed', err.message),
  });

  React.useEffect(() => {
    if (!id) return;
    emit('join-order', id);

    const unsub = on('order-status-updated', () => {
      refetch();
    });

    return () => {
      emit('leave-order', id);
      unsub();
    };
  }, [id, emit, on, refetch]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load order</Text>
        <Button title="Retry" onPress={() => refetch()} variant="outline" size="sm" />
      </View>
    );
  }

  const canCancel = order.status === 'placed' || order.status === 'confirmed';
  const isDelivered = order.status === 'delivered';
  const restaurantData = order.restaurant as string | { _id: string; name: string };
  const restaurantId = typeof restaurantData === 'string' ? restaurantData : restaurantData?._id;
  const restaurantName = typeof restaurantData === 'object' ? restaurantData?.name : undefined;

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.orderNum}>#{order.orderNumber}</Text>
          <Badge text={order.status.replace(/_/g, ' ').toUpperCase()} />
        </View>
        <Text style={styles.statusLabel}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Text>
      </Card>

      {/* Status Timeline */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Order Timeline</Text>
        {order.statusHistory.map((entry, i) => (
          <View key={i} style={styles.timelineEntry}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStatus}>
                {STATUS_LABELS[entry.status] ?? entry.status.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={styles.timelineTime}>
                {new Date(entry.timestamp).toLocaleTimeString()}
              </Text>
              {entry.note && <Text style={styles.timelineNote}>{entry.note}</Text>}
            </View>
          </View>
        ))}
      </Card>

      {/* Items */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemQty}>{item.quantity}x</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.variant && <Text style={styles.itemMeta}>Variant: {item.variant}</Text>}
              {item.addons.length > 0 && (
                <Text style={styles.itemMeta}>Addons: {item.addons.join(', ')}</Text>
              )}
            </View>
            <Text style={styles.itemPrice}>₹{item.itemTotal}</Text>
          </View>
        ))}
        <Divider />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{order.pricing.subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>₹{order.pricing.deliveryFee}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>₹{order.pricing.tax}</Text>
        </View>
        {order.pricing.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>-₹{order.pricing.discount}</Text>
          </View>
        )}
        <Divider />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.pricing.total}</Text>
        </View>
      </Card>

      {/* Delivery Address */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>
          {order.deliveryAddress.addressLine1}
          {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
          , {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
        </Text>
      </Card>

      {/* Payment */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <Text style={styles.addressText}>
          Method: {order.payment.method.toUpperCase()} | Status: {order.payment.status}
        </Text>
      </Card>

      {canCancel && (
        <Button
          title="Cancel Order"
          onPress={handleCancel}
          variant="danger"
          fullWidth
          loading={cancelMutation.isPending}
          disabled={cancelMutation.isPending}
          style={styles.cancelBtn}
        />
      )}

      {isDelivered && restaurantId && (
        <Button
          title="Write a Review"
          onPress={() =>
            router.push({
              pathname: '/review/[id]',
              params: { id: order._id, restaurantId, restaurantName: restaurantName ?? 'Restaurant' },
            })
          }
          fullWidth
          style={styles.reviewBtn}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, marginBottom: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  statusLabel: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.primary, marginTop: SPACING.md },
  section: { marginTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  timelineEntry: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 4, marginRight: SPACING.md },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  timelineTime: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  timelineNote: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  itemQty: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.primary, width: 30 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZE.md, color: COLORS.text },
  itemMeta: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  summaryLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  discountValue: { color: COLORS.success },
  totalLabel: { flex: 1, fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  addressText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
  cancelBtn: { marginTop: SPACING.xl },
  reviewBtn: { marginTop: SPACING.lg },
});
