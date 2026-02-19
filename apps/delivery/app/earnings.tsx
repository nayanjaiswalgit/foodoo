import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '../src/services/delivery.service';

type Period = 'today' | 'week' | 'month' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

export default function EarningsScreen() {
  const [period, setPeriod] = useState<Period>('today');

  const { data: earnings, isRefetching, refetch } = useQuery({
    queryKey: ['earnings'],
    queryFn: deliveryApi.getEarnings,
  });

  const getAmount = () => {
    if (!earnings) return 0;
    switch (period) {
      case 'today': return earnings.todayEarnings ?? 0;
      case 'week': return earnings.weekEarnings ?? 0;
      case 'month': return earnings.monthEarnings ?? 0;
      case 'all': return earnings.totalEarnings ?? 0;
    }
  };

  const getDeliveries = () => {
    if (!earnings) return 0;
    switch (period) {
      case 'today': return earnings.todayDeliveries ?? 0;
      case 'week': return earnings.weekDeliveries ?? 0;
      case 'month': return earnings.monthDeliveries ?? 0;
      case 'all': return earnings.totalDeliveries ?? 0;
    }
  };

  const avgPerDelivery = getDeliveries() > 0 ? Math.round(getAmount() / getDeliveries()) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Period Selector */}
      <View style={styles.periodBar}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Earnings Card */}
      <View style={styles.earningsCard}>
        <Text style={styles.earningsLabel}>Total Earnings</Text>
        <Text style={styles.earningsAmount}>₹{getAmount()}</Text>
        <Text style={styles.earningsSub}>
          {getDeliveries()} deliveries completed
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🚚</Text>
          <Text style={styles.statValue}>{getDeliveries()}</Text>
          <Text style={styles.statLabel}>Deliveries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>₹{avgPerDelivery}</Text>
          <Text style={styles.statLabel}>Avg / Delivery</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>{earnings?.rating?.toFixed(1) ?? '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statValue}>{earnings?.avgDeliveryTime ?? 0}m</Text>
          <Text style={styles.statLabel}>Avg Time</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Earnings Breakdown</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base Pay</Text>
          <Text style={styles.summaryValue}>₹{earnings?.basePay ?? 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Distance Bonus</Text>
          <Text style={styles.summaryValue}>₹{earnings?.distanceBonus ?? 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tips</Text>
          <Text style={styles.summaryValue}>₹{earnings?.tips ?? 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Surge Bonus</Text>
          <Text style={styles.summaryValue}>₹{earnings?.surgeBonus ?? 0}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{getAmount()}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 40 },
  periodBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodActive: { backgroundColor: '#2D3436' },
  periodText: { fontSize: 12, fontWeight: '600', color: '#636E72' },
  periodTextActive: { color: '#FFF' },
  earningsCard: {
    backgroundColor: '#2D3436',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsLabel: { color: '#B2BEC3', fontSize: 13, fontWeight: '500' },
  earningsAmount: { color: '#FFF', fontSize: 48, fontWeight: '800', marginVertical: 8 },
  earningsSub: { color: '#B2BEC3', fontSize: 13 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#2D3436' },
  statLabel: { fontSize: 11, color: '#B2BEC3', marginTop: 4, fontWeight: '500' },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436', marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  summaryLabel: { fontSize: 14, color: '#636E72' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#2D3436' },
  totalRow: { borderBottomWidth: 0, marginTop: 4, paddingTop: 14, borderTopWidth: 2, borderTopColor: '#E9ECEF' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#FF6B35' },
});
