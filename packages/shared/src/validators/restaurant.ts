import { z } from 'zod';
import { CUISINES } from '../constants/cuisines';

const operatingHoursSchema = z.object({
  day: z.number().min(0).max(6),
  open: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
});

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  cuisines: z.array(z.enum(CUISINES as [string, ...string[]])).min(1),
  address: z.object({
    addressLine1: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
    }),
  }),
  operatingHours: z.array(operatingHoursSchema).min(1),
  priceRange: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  deliveryFee: z.number().min(0),
  minOrderAmount: z.number().min(0),
  avgDeliveryTime: z.number().min(5).max(120),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
