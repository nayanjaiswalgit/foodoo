import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateAddressInput } from '@food-delivery/shared';
import { addressApi } from '../../src/services/address.service';
import { Button, Input, Card } from '../../src/components/ui';
import { COLORS, SPACING } from '../../src/constants/theme';

const LABELS = ['Home', 'Work', 'Other'] as const;

export default function AddAddressScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [label, setLabel] = useState<(typeof LABELS)[number]>('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: CreateAddressInput) => addressApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert('Success', 'Address added');
      router.back();
    },
    onError: (err: Error) => Alert.alert('Error', err.message),
  });

  const handleSave = () => {
    if (!addressLine1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      Alert.alert('Invalid Pincode', 'Pincode must be 6 digits');
      return;
    }
    createMutation.mutate({
      label,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode,
      location: { type: 'Point', coordinates: [0, 0] },
      isDefault: false,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Input
          label="Label"
          value={label}
          onChangeText={(v: string) => setLabel(v as (typeof LABELS)[number])}
          placeholder="Home, Work, or Other"
        />
        <Input
          label="Address Line 1 *"
          value={addressLine1}
          onChangeText={setAddressLine1}
          placeholder="Street address"
        />
        <Input
          label="Address Line 2"
          value={addressLine2}
          onChangeText={setAddressLine2}
          placeholder="Apt, floor (optional)"
        />
        <Input label="City *" value={city} onChangeText={setCity} placeholder="City" />
        <Input label="State *" value={state} onChangeText={setState} placeholder="State" />
        <Input
          label="Pincode *"
          value={pincode}
          onChangeText={(v: string) => setPincode(v.slice(0, 6))}
          placeholder="6-digit pincode"
          keyboardType="numeric"
        />
        <Button
          title="Save Address"
          onPress={handleSave}
          loading={createMutation.isPending}
          fullWidth
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
});
