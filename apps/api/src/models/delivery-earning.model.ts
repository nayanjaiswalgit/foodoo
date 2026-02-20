import mongoose, { type Document, Schema } from 'mongoose';

export interface IDeliveryEarningDocument extends Document {
  partner: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  baseFee: number;
  distanceBonus: number;
  tipAmount: number;
  totalEarning: number;
  createdAt: Date;
}

const deliveryEarningSchema = new Schema<IDeliveryEarningDocument>(
  {
    partner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    baseFee: { type: Number, required: true },
    distanceBonus: { type: Number, default: 0 },
    tipAmount: { type: Number, default: 0 },
    totalEarning: { type: Number, required: true },
  },
  { timestamps: true }
);

deliveryEarningSchema.index({ partner: 1, createdAt: -1 });

export const DeliveryEarning = mongoose.model<IDeliveryEarningDocument>(
  'DeliveryEarning',
  deliveryEarningSchema
);
