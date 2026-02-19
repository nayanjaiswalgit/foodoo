import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Chip = ({ label, selected = false, onPress }: ChipProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.chip, selected && styles.selected]}
  >
    <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  selected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  text: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  selectedText: { color: '#FFF', fontWeight: '600' },
});
