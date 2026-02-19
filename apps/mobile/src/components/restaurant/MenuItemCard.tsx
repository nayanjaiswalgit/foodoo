import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { type IMenuItem } from '@food-delivery/shared';
import { Badge } from '../ui/Badge';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

interface MenuItemCardProps {
  item: IMenuItem;
  onAdd: (item: IMenuItem) => void;
}

export const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => (
  <View style={styles.card}>
    <View style={styles.info}>
      <Badge text={item.isVeg ? 'Veg' : 'Non-Veg'} variant={item.isVeg ? 'veg' : 'nonVeg'} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>₹{item.price}</Text>
      {item.description ? (
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </View>
    <View style={styles.imageBox}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>🍽️</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => onAdd(item)} style={styles.addBtn} activeOpacity={0.8}>
        <Text style={styles.addText}>ADD</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  info: { flex: 1, paddingRight: SPACING.md },
  name: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text, marginTop: SPACING.xs },
  price: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  desc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  imageBox: { alignItems: 'center' },
  image: { width: 110, height: 90, borderRadius: RADIUS.md },
  placeholder: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontSize: 32 },
  addBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginTop: -14,
  },
  addText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '700' },
});
