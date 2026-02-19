import mongoose, { type Document, Schema } from 'mongoose';

export interface IMenuItemDocument extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: mongoose.Types.ObjectId;
  isVeg: boolean;
  addons: Array<{ name: string; price: number }>;
  variants: Array<{ name: string; price: number }>;
  isAvailable: boolean;
  sortOrder: number;
}

const menuItemSchema = new Schema<IMenuItemDocument>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: String,
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isVeg: { type: Boolean, required: true },
    addons: [{ name: String, price: Number }],
    variants: [{ name: String, price: Number }],
    isAvailable: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });

export const MenuItem = mongoose.model<IMenuItemDocument>('MenuItem', menuItemSchema);
