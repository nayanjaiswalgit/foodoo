import { z } from 'zod';
import { PaymentMethod } from '../constants/payment';
import { ORDER_STATUSES } from '../constants/order-status';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const orderItemSchema = z.object({
  menuItem: z.string().regex(mongoIdRegex, 'Invalid menu item ID'),
  quantity: z.number().int().min(1).max(20),
  variant: z.string().max(100).optional(),
  addons: z.array(z.string().max(100)).max(10).default([]),
});

export const placeOrderSchema = z.object({
  restaurant: z.string().regex(mongoIdRegex, 'Invalid restaurant ID'),
  items: z.array(orderItemSchema).min(1).max(50),
  deliveryAddress: z.string().regex(mongoIdRegex, 'Invalid address ID'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().max(30).optional(),
  specialInstructions: z.string().max(200).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES as unknown as [string, ...string[]]),
  note: z.string().max(500).optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
