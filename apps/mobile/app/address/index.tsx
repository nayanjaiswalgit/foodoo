import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type IAddress } from '@food-delivery/shared';
import { addressApi } from '../../src/services/address.service';
import { Card, Button, EmptyState } from '../../src/components/ui';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

export default function AddressScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: addressApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
    onError: (err: Error) => Alert.alert('Delete Failed', err.message),
  });

  const setDefaultMutation = useMutation({
    mutationFn: addressApi.setDefault,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  const renderItem = ({ item }: { item: IAddress }) => (
    <Card style={styles.addressCard}>
      <View style={styles.row}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{item.label}</Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <Text style={styles.address}>{item.addressLine1}</Text>
      <Text style={styles.city}>{item.city}, {item.state} - {item.pincode}</Text>
      <View style={styles.actions}>
        {!item.isDefault && (
          <TouchableOpacity onPress={() => setDefaultMutation.mutate(item._id)}>
            <Text style={styles.actionText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="No addresses saved"
          message="Add a delivery address to get started"
        />
        <View style={styles.addBtnContainer}>
          <Button title="+ Add New Address" onPress={() => router.push('/address/add')} fullWidth />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <Button
            title="+ Add New Address"
            onPress={() => router.push('/address/add')}
            variant="outline"
            fullWidth
            style={styles.addBtn}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  list: { padding: SPACING.lg },
  addressCard: { marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  labelBadge: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  labelText: { color: '#FFF', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  defaultBadge: { backgroundColor: COLORS.success, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm },
  defaultText: { color: '#FFF', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  address: { fontSize: FONT_SIZE.md, color: COLORS.text },
  city: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.md },
  actionText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
  deleteText: { color: COLORS.error },
  addBtn: { marginTop: SPACING.md },
  addBtnContainer: { padding: SPACING.lg },
});
