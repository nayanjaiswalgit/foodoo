import mongoose, { type Document, Schema } from 'mongoose';

export interface IFeatureFlagDocument extends Document {
  key: string;
  enabled: boolean;
  description: string;
  updatedBy?: mongoose.Types.ObjectId;
}

const featureFlagSchema = new Schema<IFeatureFlagDocument>(
  {
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    description: { type: String, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const FeatureFlagModel = mongoose.model<IFeatureFlagDocument>('FeatureFlag', featureFlagSchema);
