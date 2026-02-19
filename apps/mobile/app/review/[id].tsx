import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../../src/services/review.service';
import { Card, Button } from '../../src/components/ui';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

const STARS = [1, 2, 3, 4, 5];

export default function WriteReviewScreen() {
  const {
    id: orderId,
    restaurantId,
    restaurantName,
  } = useLocalSearchParams<{
    id: string;
    restaurantId: string;
    restaurantName: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      reviewApi.create({
        restaurant: restaurantId,
        order: orderId,
        rating,
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: () =>
      Alert.alert('Error', 'Could not submit review. You may have already reviewed this order.'),
  });

  const canSubmit = rating > 0 && comment.trim().length >= 5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Rate your experience</Text>
        <Text style={styles.subtitle}>{restaurantName ?? 'Restaurant'}</Text>

        {/* Star Rating */}
        <View style={styles.starsRow}>
          {STARS.map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
              <Text style={[styles.star, star <= rating && styles.starActive]}>
                {star <= rating ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.ratingLabel}>
          {rating === 0 && 'Tap a star to rate'}
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </Text>
      </Card>

      <Card style={styles.commentCard}>
        <Text style={styles.commentLabel}>Write a review</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Tell others about your experience (min 5 characters)"
          placeholderTextColor={COLORS.textLight}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{comment.length}/500</Text>
      </Card>

      <Button
        title={mutation.isPending ? 'Submitting...' : 'Submit Review'}
        onPress={() => mutation.mutate()}
        disabled={!canSubmit || mutation.isPending}
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  starBtn: { padding: SPACING.xs },
  star: { fontSize: 40, color: COLORS.textLight },
  starActive: { color: COLORS.star },
  ratingLabel: {
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  commentCard: { marginTop: SPACING.lg, marginBottom: SPACING.lg },
  commentLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    minHeight: 120,
  },
  charCount: {
    textAlign: 'right',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});
