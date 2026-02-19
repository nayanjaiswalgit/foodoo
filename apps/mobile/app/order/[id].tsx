import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../src/services/order.service';
import { Card, Badge, Divider, Button } from '../../src/components/ui';
import { useSocket } from '../../src/hooks/use-socket';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

const STATUS_LABELS: Record<string, string> = {
  placed: '🟠 Order Placed',
  confirmed: '🔵 Confirmed',
  preparing: '🟡 Preparing',
  ready: '🟢 Ready for Pickup',
  picked_up: '🔵 Picked Up',
  on_the_way: '🚚 On the Way',
  delivered: '✅ Delivered',
  cancelled: '❌ Cancelled',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { emit } = useSocket('orders');

  const { data: order, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
    refetchInterval: 10000,
  });

  React.useEffect(() => {
    if (id) emit('join-order', id);
    return () => {
      if (id) emit('leave-order', id);
    };
  }, [id, emit]);

  if (!order) return null;

  const canCancel = order.status === 'placed' || order.status === 'confirmed';

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
                {entry.status.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={styles.timelineTime}>
                {new Date(entry.timestamp).toLocaleTimeString()}
              </Text>
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
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.itemTotal}</Text>
          </View>
        ))}
        <Divider />
        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.pricing.total}</Text>
        </View>
      </Card>

      {/* Delivery Address */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>
          {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
        </Text>
      </Card>

      {canCancel && (
        <Button
          title="Cancel Order"
          onPress={async () => {
            await orderApi.cancel(order._id);
            refetch();
          }}
          variant="danger"
          fullWidth
          style={styles.cancelBtn}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: 40 },
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
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  itemQty: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.primary, width: 30 },
  itemName: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text },
  itemPrice: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  totalLabel: { flex: 1, fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  addressText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
  cancelBtn: { marginTop: SPACING.xl },
});
