import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Card } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/use-auth';
import { apiClient } from '../../src/lib/api-client';
import { COLORS, SPACING } from '../../src/constants/theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name ?? '');

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) =>
      apiClient.patch('/users/profile', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Success', 'Profile updated');
    },
    onError: () => Alert.alert('Error', 'Failed to update profile'),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Input label="Full Name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Input label="Email" value={user?.email ?? ''} onChangeText={() => {}} editable={false} />
        <Input label="Phone" value={user?.phone ?? ''} onChangeText={() => {}} editable={false} />
        <Button
          title="Save Changes"
          onPress={() => updateMutation.mutate({ name })}
          loading={updateMutation.isPending}
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
