import mongoose, { type Document, Schema } from 'mongoose';
import { CUISINES } from '@food-delivery/shared';

export interface IRestaurantDocument extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  cuisines: string[];
  image: string;
  images: string[];
  address: {
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  operatingHours: Array<{ day: number; open: string; close: string }>;
  rating: { average: number; count: number };
  priceRange: 1 | 2 | 3 | 4;
  deliveryFee: number;
  minOrderAmount: number;
  avgDeliveryTime: number;
  commission: number;
  isActive: boolean;
  isFeatured: boolean;
}

const restaurantSchema = new Schema<IRestaurantDocument>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    cuisines: [{ type: String, enum: CUISINES }],
    image: { type: String, default: '' },
    images: [String],
    address: {
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    operatingHours: [
      {
        day: { type: Number, min: 0, max: 6 },
        open: String,
        close: String,
      },
    ],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    priceRange: { type: Number, enum: [1, 2, 3, 4], default: 2 },
    deliveryFee: { type: Number, default: 30 },
    minOrderAmount: { type: Number, default: 100 },
    avgDeliveryTime: { type: Number, default: 30 },
    commission: { type: Number, default: 15 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

restaurantSchema.index({ 'address.location': '2dsphere' });
restaurantSchema.index({ name: 'text', cuisines: 'text' });
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ isActive: 1, isFeatured: -1 });

export const Restaurant = mongoose.model<IRestaurantDocument>('Restaurant', restaurantSchema);
