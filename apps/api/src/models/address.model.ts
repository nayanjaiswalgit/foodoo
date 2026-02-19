import mongoose, { type Document, Schema } from 'mongoose';

export interface IAddressDocument extends Document {
  user: mongoose.Types.ObjectId;
  label: 'Home' | 'Work' | 'Other';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  isDefault: boolean;
}

const addressSchema = new Schema<IAddressDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, enum: ['Home', 'Work', 'Other'], required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.index({ user: 1 });
addressSchema.index({ location: '2dsphere' });

export const Address = mongoose.model<IAddressDocument>('Address', addressSchema);
