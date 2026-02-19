import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = RADIUS.sm, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, opacity, backgroundColor: COLORS.border },
        style,
      ]}
    />
  );
};

export const RestaurantCardSkeleton = () => (
  <Animated.View style={skeletonStyles.card}>
    <Skeleton width="100%" height={150} borderRadius={RADIUS.lg} />
    <Animated.View style={skeletonStyles.info}>
      <Skeleton width={180} height={18} />
      <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
      <Skeleton width={200} height={14} style={{ marginTop: 8 }} />
    </Animated.View>
  </Animated.View>
);

const skeletonStyles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  info: { padding: 12 },
});
