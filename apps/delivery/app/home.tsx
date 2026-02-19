import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type IOrder } from '@food-delivery/shared';
import { useAuthStore } from '../src/stores/auth.store';
import { deliveryApi } from '../src/services/delivery.service';
import { useLocationTracking } from '../src/hooks/use-location-tracking';

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isOnline, setOnline, logout } = useAuthStore();

  useLocationTracking();

  const { data: orders, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['availableOrders'],
    queryFn: deliveryApi.getAvailableOrders,
    enabled: isOnline,
    refetchInterval: 15000,
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: deliveryApi.getEarnings,
  });

  const toggleMutation = useMutation({
    mutationFn: deliveryApi.toggleOnline,
    onSuccess: (result: { isOnline: boolean }) => {
      setOnline(result.isOnline);
      if (result.isOnline) queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: deliveryApi.acceptOrder,
    onSuccess: (order: IOrder) => {
      queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
      router.push(`/order/${order._id}`);
    },
    onError: () => Alert.alert('Error', 'Order no longer available'),
  });

  const handleAccept = (orderId: string) => {
    Alert.alert('Accept Order', 'Do you want to accept this delivery?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => acceptMutation.mutate(orderId) },
    ]);
  };

  const renderOrder = ({ item }: { item: Record<string, unknown> }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNum}>#{(item as unknown as IOrder).orderNumber}</Text>
        <Text style={styles.orderTotal}>₹{((item as unknown as IOrder).pricing?.total ?? 0)}</Text>
      </View>
      <Text style={styles.orderAddress} numberOfLines={2}>
        📍 {((item as unknown as IOrder).deliveryAddress?.addressLine1 ?? 'N/A')}
      </Text>
      <Text style={styles.orderItems}>
        {((item as unknown as IOrder).items ?? []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
      </Text>
      <TouchableOpacity
        style={styles.acceptBtn}
        onPress={() => handleAccept((item as unknown as IOrder)._id)}
      >
        <Text style={styles.acceptBtnText}>Accept Delivery</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{earnings?.todayDeliveries ?? 0}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{earnings?.totalDeliveries ?? 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>₹{earnings?.totalEarnings ?? 0}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/earnings')}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Online Toggle */}
      <TouchableOpacity
        style={[styles.toggleBtn, isOnline && styles.toggleOnline]}
        onPress={() => toggleMutation.mutate()}
      >
        <View style={[styles.toggleDot, isOnline && styles.dotOnline]} />
        <Text style={[styles.toggleText, isOnline && styles.toggleTextOnline]}>
          {isOnline ? 'Online - Accepting Orders' : 'Offline - Go Online'}
        </Text>
      </TouchableOpacity>

      {!isOnline ? (
        <View style={styles.offlineMsg}>
          <Text style={styles.offlineEmoji}>😴</Text>
          <Text style={styles.offlineText}>Go online to see available orders</Text>
        </View>
      ) : (
        <FlatList
          data={(orders ?? []) as Record<string, unknown>[]}
          renderItem={renderOrder}
          keyExtractor={(item) => (item as unknown as IOrder)._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No orders available right now</Text>
              <Text style={styles.emptySubtext}>New orders will appear automatically</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#2D3436',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  stat: { flex: 1 },
  statValue: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#B2BEC3', fontSize: 11, marginTop: 2 },
  viewAll: { color: '#FF6B35', fontSize: 12, fontWeight: '600' },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  toggleOnline: { borderColor: '#00B894', backgroundColor: '#E8F5E9' },
  toggleDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#B2BEC3', marginRight: 12 },
  dotOnline: { backgroundColor: '#00B894' },
  toggleText: { fontSize: 15, fontWeight: '600', color: '#636E72' },
  toggleTextOnline: { color: '#00B894' },
  list: { padding: 16 },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderNum: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
  orderTotal: { fontSize: 16, fontWeight: '700', color: '#FF6B35' },
  orderAddress: { fontSize: 13, color: '#636E72', marginBottom: 4 },
  orderItems: { fontSize: 12, color: '#B2BEC3', marginBottom: 12 },
  acceptBtn: {
    backgroundColor: '#00B894',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  offlineMsg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  offlineEmoji: { fontSize: 64, marginBottom: 16 },
  offlineText: { fontSize: 16, fontWeight: '600', color: '#636E72' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#636E72' },
  emptySubtext: { fontSize: 13, color: '#B2BEC3', marginTop: 4 },
  logoutBtn: { padding: 16, alignItems: 'center' },
  logoutText: { color: '#636E72', fontSize: 14, fontWeight: '500' },
});
