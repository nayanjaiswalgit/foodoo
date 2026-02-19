import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/index';
import * as reviewService from '../services/review.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.user!._id, req.body);
  sendResponse(res, 201, review, 'Review submitted');
});

export const getByRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const { reviews, total } = await reviewService.getRestaurantReviews(
    (req.params.restaurantId as string),
    page,
    limit
  );
  sendPaginatedResponse(res, reviews, { page, limit, total });
});

export const reply = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.replyToReview(req.user!._id, (req.params.id as string), req.body.text);
  sendResponse(res, 200, review, 'Reply added');
});
