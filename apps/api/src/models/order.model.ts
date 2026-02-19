import mongoose, { type Document, Schema } from 'mongoose';
import { ORDER_STATUSES, OrderStatus } from '@food-delivery/shared';

export interface IOrderDocument extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  deliveryPartner?: mongoose.Types.ObjectId;
  items: Array<{
    menuItem: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    addons: string[];
    itemTotal: number;
  }>;
  deliveryAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    pincode: string;
    location: { type: 'Point'; coordinates: [number, number] };
  };
  pricing: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  };
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  status: string;
  statusHistory: Array<{ status: string; timestamp: Date; note?: string }>;
  couponCode?: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: Date;
  idempotencyKey?: string;
}

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    deliveryPartner: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        variant: String,
        addons: [String],
        itemTotal: { type: Number, required: true },
      },
    ],
    deliveryAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      tax: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    payment: {
      method: { type: String, required: true },
      status: { type: String, default: 'pending' },
      transactionId: String,
    },
    status: { type: String, enum: ORDER_STATUSES, default: OrderStatus.PLACED },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    couponCode: String,
    specialInstructions: String,
    estimatedDeliveryTime: Date,
    idempotencyKey: { type: String, sparse: true },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ idempotencyKey: 1, customer: 1 }, { unique: true, sparse: true });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
