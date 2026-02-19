import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { type IOrder } from '@food-delivery/shared';
import { Badge } from '../ui/Badge';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  placed: { bg: '#FFF3E0', fg: '#F57C00' },
  confirmed: { bg: '#E3F2FD', fg: '#1976D2' },
  preparing: { bg: '#FFF8E1', fg: '#F9A825' },
  ready: { bg: '#E8F5E9', fg: '#388E3C' },
  picked_up: { bg: '#E3F2FD', fg: '#1565C0' },
  on_the_way: { bg: '#E8EAF6', fg: '#3F51B5' },
  delivered: { bg: '#E8F5E9', fg: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', fg: '#C62828' },
};

interface OrderCardProps {
  order: IOrder;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const router = useRouter();
  const colors = STATUS_COLORS[order.status] ?? STATUS_COLORS.placed!;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/order/${order._id}`)}
      activeOpacity={0.9}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.orderNum}>#{order.orderNumber}</Text>
        <Badge
          text={order.status.replace(/_/g, ' ').toUpperCase()}
          color={colors.fg}
          bgColor={colors.bg}
        />
      </View>
      <Text style={styles.items} numberOfLines={1}>
        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.total}>₹{order.pricing.total}</Text>
        <Text style={styles.date}>
          {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  items: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md },
  total: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  date: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
});
