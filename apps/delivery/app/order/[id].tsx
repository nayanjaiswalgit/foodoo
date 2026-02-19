import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderStatus } from '@food-delivery/shared';
import { deliveryApi } from '../../src/services/delivery.service';
import { apiClient } from '../../src/lib/api-client';

export default function ActiveDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, refetch } = useQuery({
    queryKey: ['activeOrder', id],
    queryFn: () => apiClient.get(`/orders/${id}`).then((r) => r.data.data),
    enabled: !!id,
    refetchInterval: 10000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => deliveryApi.updateOrderStatus(id, status),
    onSuccess: () => refetch(),
  });

  const completeMutation = useMutation({
    mutationFn: () => deliveryApi.completeDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      Alert.alert('Delivered!', 'Great job!', [
        { text: 'OK', onPress: () => router.replace('/home') },
      ]);
    },
  });

  const handleOpenMaps = () => {
    if (!order?.deliveryAddress?.location?.coordinates) return;
    const [lng, lat] = order.deliveryAddress.location.coordinates;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
  };

  if (!order) return null;

  const currentStatus = order.status;
  const isPickedUp = currentStatus === OrderStatus.PICKED_UP;
  const isOnTheWay = currentStatus === OrderStatus.ON_THE_WAY;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusCard}>
        <Text style={styles.statusEmoji}>{isOnTheWay ? '🚚' : isPickedUp ? '📦' : '🏪'}</Text>
        <Text style={styles.statusText}>
          {isOnTheWay
            ? 'On the Way to Customer'
            : isPickedUp
              ? 'Picked Up - Head to Customer'
              : 'Head to Restaurant for Pickup'}
        </Text>
      </View>

      {/* Order Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order #{order.orderNumber}</Text>
        {(order.items ?? []).map((item: { name: string; quantity: number }, i: number) => (
          <Text key={i} style={styles.itemText}>
            {item.quantity}x {item.name}
          </Text>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.pricing?.total ?? 0}</Text>
        </View>
      </View>

      {/* Restaurant */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏪 Restaurant</Text>
        <Text style={styles.infoText}>{order.restaurant?.name ?? 'N/A'}</Text>
      </View>

      {/* Delivery Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Delivery Address</Text>
        <Text style={styles.infoText}>
          {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.city}
        </Text>
        <TouchableOpacity onPress={handleOpenMaps} style={styles.mapsBtn}>
          <Text style={styles.mapsBtnText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Customer */}
      {order.customer && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Customer</Text>
          <Text style={styles.infoText}>{order.customer.name}</Text>
          {order.customer.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${order.customer.phone}`)}>
              <Text style={styles.phoneText}>📞 {order.customer.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {isPickedUp && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.onTheWayBtn]}
            onPress={() => updateStatusMutation.mutate(OrderStatus.ON_THE_WAY)}
          >
            <Text style={styles.actionBtnText}>🚚 Start Delivery</Text>
          </TouchableOpacity>
        )}

        {isOnTheWay && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.deliveredBtn]}
            onPress={() => {
              Alert.alert('Confirm Delivery', 'Has the food been delivered?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes, Delivered', onPress: () => completeMutation.mutate() },
              ]);
            }}
          >
            <Text style={styles.actionBtnText}>✅ Mark as Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 40 },
  statusCard: {
    backgroundColor: '#2D3436',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusEmoji: { fontSize: 48, marginBottom: 8 },
  statusText: { color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#2D3436', marginBottom: 8 },
  itemText: { fontSize: 13, color: '#636E72', marginBottom: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#FF6B35' },
  infoText: { fontSize: 14, color: '#636E72' },
  mapsBtn: {
    marginTop: 8,
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapsBtnText: { color: '#1976D2', fontWeight: '600', fontSize: 13 },
  phoneText: { color: '#00B894', fontSize: 14, fontWeight: '600', marginTop: 4 },
  actions: { marginTop: 8 },
  actionBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  onTheWayBtn: { backgroundColor: '#FF6B35' },
  deliveredBtn: { backgroundColor: '#00B894' },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
