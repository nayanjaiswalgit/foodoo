import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, FONT_SIZE } from '../../constants/theme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
}

export const Avatar = ({ uri, name, size = 40 }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFF', fontWeight: '700' },
});
