import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../src/components/ui';
import { COLORS, SPACING, FONT_SIZE } from '../../src/constants/theme';
import { apiClient } from '../../src/lib/api-client';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
          </View>

          {submitted ? (
            <View>
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  If that email is registered, a reset link has been sent. Check your inbox.
                </Text>
              </View>
              <Button
                title="Back to Sign In"
                onPress={() => router.back()}
                variant="ghost"
                fullWidth
              />
            </View>
          ) : (
            <View>
              {error ? <Text style={styles.formError}>{error}</Text> : null}

              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} fullWidth />

              <Button
                title="Back to Sign In"
                onPress={() => router.back()}
                variant="ghost"
                fullWidth
                style={styles.backBtn}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: SPACING.xxl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: SPACING.xxxl },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.text },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  formError: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: 8,
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    padding: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  successText: {
    fontSize: FONT_SIZE.sm,
    color: '#2E7D32',
    textAlign: 'center',
  },
  backBtn: { marginTop: SPACING.md },
});
