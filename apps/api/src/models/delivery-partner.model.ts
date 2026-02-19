import mongoose, { type Document, Schema } from 'mongoose';

export interface IDeliveryPartnerDocument extends Document {
  user: mongoose.Types.ObjectId;
  vehicleType: 'bicycle' | 'motorcycle' | 'car';
  vehicleNumber?: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation: { type: 'Point'; coordinates: [number, number] };
  currentOrder?: mongoose.Types.ObjectId;
  stats: {
    totalDeliveries: number;
    totalEarnings: number;
    rating: { average: number; count: number };
  };
}

const deliveryPartnerSchema = new Schema<IDeliveryPartnerDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: { type: String, enum: ['bicycle', 'motorcycle', 'car'], required: true },
    vehicleNumber: String,
    isOnline: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    currentOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    stats: {
      totalDeliveries: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });
deliveryPartnerSchema.index({ isOnline: 1, isAvailable: 1 });

export const DeliveryPartner = mongoose.model<IDeliveryPartnerDocument>(
  'DeliveryPartner',
  deliveryPartnerSchema
);
