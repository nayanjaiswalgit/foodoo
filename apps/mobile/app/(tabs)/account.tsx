import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/use-auth';
import { Avatar, Card, Divider, Button } from '../../src/components/ui';
import { COLORS, SPACING, FONT_SIZE } from '../../src/constants/theme';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const MenuItem = ({ icon, label, onPress }: MenuItemProps) => (
  <TouchableOpacity onPress={onPress} style={menuStyles.item} activeOpacity={0.7}>
    <Text style={menuStyles.icon}>{icon}</Text>
    <Text style={menuStyles.label}>{label}</Text>
    <Text style={menuStyles.arrow}>›</Text>
  </TouchableOpacity>
);

const menuStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.lg },
  icon: { fontSize: 20, marginRight: SPACING.md },
  label: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text },
  arrow: { fontSize: 20, color: COLORS.textLight },
});

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <Avatar name={user?.name ?? 'User'} uri={user?.avatar} size={56} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.menuCard}>
        <MenuItem icon="📋" label="My Orders" onPress={() => router.push('/(tabs)/orders')} />
        <Divider marginVertical={0} />
        <MenuItem icon="📍" label="Saved Addresses" onPress={() => router.push('/address')} />
        <Divider marginVertical={0} />
        <MenuItem icon="👤" label="Edit Profile" onPress={() => router.push('/profile')} />
        <Divider marginVertical={0} />
        <MenuItem icon="❤️" label="Favorites" onPress={() => router.push('/favorites')} />
      </Card>

      <Button
        title="Sign Out"
        onPress={() => logout.mutate()}
        variant="outline"
        fullWidth
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  profileCard: { marginBottom: SPACING.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { marginLeft: SPACING.lg },
  name: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  email: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  menuCard: { marginBottom: SPACING.lg },
  logoutBtn: { marginTop: SPACING.md },
});
