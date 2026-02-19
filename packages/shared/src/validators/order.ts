import { z } from 'zod';
import { PaymentMethod } from '../constants/payment';

const orderItemSchema = z.object({
  menuItem: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  variant: z.string().optional(),
  addons: z.array(z.string()).default([]),
});

export const placeOrderSchema = z.object({
  restaurant: z.string().min(1),
  items: z.array(orderItemSchema).min(1),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().optional(),
  specialInstructions: z.string().max(200).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.string().min(1),
  note: z.string().optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
