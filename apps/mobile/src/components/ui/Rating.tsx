import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface RatingProps {
  average: number;
  count?: number;
  size?: 'sm' | 'md';
}

export const Rating = ({ average, count, size = 'md' }: RatingProps) => {
  const isSm = size === 'sm';

  return (
    <View style={styles.container}>
      <View style={[styles.badge, isSm && styles.badgeSm]}>
        <Text style={styles.star}>★</Text>
        <Text style={[styles.value, isSm && styles.valueSm]}>{average.toFixed(1)}</Text>
      </View>
      {count !== undefined && <Text style={[styles.count, isSm && styles.countSm]}>({count})</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSm: { paddingHorizontal: 4, paddingVertical: 1 },
  star: { color: '#FFF', fontSize: FONT_SIZE.xs },
  value: { color: '#FFF', fontSize: FONT_SIZE.sm, fontWeight: '700', marginLeft: 2 },
  valueSm: { fontSize: FONT_SIZE.xs },
  count: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginLeft: SPACING.xs },
  countSm: { fontSize: FONT_SIZE.xs },
});
