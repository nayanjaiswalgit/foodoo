import { DEFAULT_FEATURE_FLAGS, type FeatureFlag } from '@food-delivery/shared';
import { FeatureFlagModel } from '../models/feature-flag.model';
import { ApiError } from '../utils/api-error';

export const getAllFlags = async (): Promise<Record<string, boolean>> => {
  const flags = await FeatureFlagModel.find();
  const result = { ...DEFAULT_FEATURE_FLAGS };
  for (const flag of flags) {
    (result as Record<string, boolean>)[flag.key] = flag.enabled;
  }
  return result;
};

export const toggleFlag = async (key: FeatureFlag, userId: string) => {
  const flag = await FeatureFlagModel.findOne({ key });
  if (flag) {
    flag.enabled = !flag.enabled;
    flag.updatedBy = userId as any;
    return flag.save();
  }

  const defaultValue = DEFAULT_FEATURE_FLAGS[key];
  if (defaultValue === undefined) throw ApiError.badRequest('Invalid feature flag');

  return FeatureFlagModel.create({
    key,
    enabled: !defaultValue,
    updatedBy: userId,
  });
};

export const setFlag = async (key: string, enabled: boolean, userId: string) => {
  return FeatureFlagModel.findOneAndUpdate(
    { key },
    { key, enabled, updatedBy: userId },
    { upsert: true, new: true }
  );
};
