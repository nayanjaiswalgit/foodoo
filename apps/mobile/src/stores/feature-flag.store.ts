import { create } from 'zustand';
import { type FeatureFlag, DEFAULT_FEATURE_FLAGS } from '@food-delivery/shared';

interface FeatureFlagState {
  flags: Record<string, boolean>;
  setFlags: (flags: Record<string, boolean>) => void;
  isEnabled: (flag: FeatureFlag) => boolean;
}

export const useFeatureFlagStore = create<FeatureFlagState>((set, get) => ({
  flags: { ...DEFAULT_FEATURE_FLAGS },
  setFlags: (flags) => set({ flags: { ...DEFAULT_FEATURE_FLAGS, ...flags } }),
  isEnabled: (flag) => get().flags[flag] ?? false,
}));
