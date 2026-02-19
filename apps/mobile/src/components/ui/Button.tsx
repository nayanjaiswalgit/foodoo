import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: COLORS.primary, text: '#FFF' },
  secondary: { bg: COLORS.secondary, text: '#FFF' },
  outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary },
  ghost: { bg: 'transparent', text: COLORS.text },
  danger: { bg: COLORS.error, text: '#FFF' },
};

const SIZE_STYLES: Record<Size, { py: number; px: number; font: number }> = {
  sm: { py: SPACING.sm, px: SPACING.md, font: FONT_SIZE.sm },
  md: { py: SPACING.md, px: SPACING.xl, font: FONT_SIZE.md },
  lg: { py: SPACING.lg, px: SPACING.xxl, font: FONT_SIZE.lg },
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) => {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  const containerStyle: ViewStyle = {
    backgroundColor: disabled ? COLORS.textLight : v.bg,
    paddingVertical: s.py,
    paddingHorizontal: s.px,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(v.border ? { borderWidth: 1, borderColor: disabled ? COLORS.textLight : v.border } : {}),
    ...(fullWidth ? { width: '100%' } : {}),
  };

  const textStyle: TextStyle = {
    color: disabled ? COLORS.textSecondary : v.text,
    fontSize: s.font,
    fontWeight: '600',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[containerStyle, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
