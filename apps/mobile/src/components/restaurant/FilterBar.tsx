import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { CUISINES } from '@food-delivery/shared';
import { Chip } from '../ui/Chip';
import { SPACING } from '../../constants/theme';

interface FilterBarProps {
  selectedCuisine: string | null;
  onSelectCuisine: (cuisine: string | null) => void;
}

export const FilterBar = ({ selectedCuisine, onSelectCuisine }: FilterBarProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
    <Chip label="All" selected={!selectedCuisine} onPress={() => onSelectCuisine(null)} />
    {CUISINES.map((cuisine) => (
      <Chip
        key={cuisine}
        label={cuisine}
        selected={selectedCuisine === cuisine}
        onPress={() => onSelectCuisine(selectedCuisine === cuisine ? null : cuisine)}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
});
