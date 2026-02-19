import { z } from 'zod';

const addonSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
});

const variantSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
});

export const createMenuItemSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).default(''),
  price: z.number().min(1),
  category: z.string().min(1),
  isVeg: z.boolean(),
  addons: z.array(addonSchema).default([]),
  variants: z.array(variantSchema).default([]),
  sortOrder: z.number().default(0),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  sortOrder: z.number().default(0),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
