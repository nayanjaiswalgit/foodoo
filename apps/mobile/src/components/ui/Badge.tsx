import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

type BadgeVariant = 'veg' | 'nonVeg' | 'status' | 'discount';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  color?: string;
  bgColor?: string;
}

export const Badge = ({ text, variant = 'status', color, bgColor }: BadgeProps) => {
  const getColors = () => {
    switch (variant) {
      case 'veg':
        return { bg: '#E8F5E9', fg: COLORS.veg };
      case 'nonVeg':
        return { bg: '#FFEBEE', fg: COLORS.nonVeg };
      case 'discount':
        return { bg: '#FFF3E0', fg: COLORS.primary };
      default:
        return { bg: bgColor ?? COLORS.background, fg: color ?? COLORS.textSecondary };
    }
  };

  const { bg, fg } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {(variant === 'veg' || variant === 'nonVeg') && (
        <View style={[styles.dot, { backgroundColor: fg }]} />
      )}
      <Text style={[styles.text, { color: fg }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.xs },
  text: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
});
