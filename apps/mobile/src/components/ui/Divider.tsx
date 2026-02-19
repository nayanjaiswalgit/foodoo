import React from 'react';
import { View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

interface DividerProps {
  marginVertical?: number;
}

export const Divider = ({ marginVertical = SPACING.md }: DividerProps) => (
  <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical }} />
);
