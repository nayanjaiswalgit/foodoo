import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCartStore } from '../../stores/cart.store';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

interface CartItemProps {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export const CartItemRow = ({ menuItemId, name, price, quantity }: CartItemProps) => {
  const { updateQuantity } = useCartStore();

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.price}>₹{price * quantity}</Text>
      </View>
      <View style={styles.counter}>
        <TouchableOpacity
          onPress={() => updateQuantity(menuItemId, quantity - 1)}
          style={styles.counterBtn}
        >
          <Text style={styles.counterText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{quantity}</Text>
        <TouchableOpacity
          onPress={() => updateQuantity(menuItemId, quantity + 1)}
          style={styles.counterBtn}
        >
          <Text style={styles.counterText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: '500', color: COLORS.text },
  price: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },
  counterBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  counterText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.primary },
  qty: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.primary, minWidth: 24, textAlign: 'center' },
});
