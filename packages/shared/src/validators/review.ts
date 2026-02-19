import { z } from 'zod';

export const createReviewSchema = z.object({
  restaurant: z.string().min(1),
  order: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(500),
});

export const replyReviewSchema = z.object({
  text: z.string().min(1).max(300),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReplyReviewInput = z.infer<typeof replyReviewSchema>;
