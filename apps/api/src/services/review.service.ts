import { type CreateReviewInput } from '@food-delivery/shared';
import { Review } from '../models/review.model';
import { Restaurant } from '../models/restaurant.model';
import { Order } from '../models/order.model';
import { ApiError } from '../utils/api-error';

export const createReview = async (userId: string, data: CreateReviewInput) => {
  const order = await Order.findOne({
    _id: data.order,
    customer: userId,
    status: 'delivered',
  });
  if (!order) throw ApiError.badRequest('Can only review delivered orders');

  // Verify the review restaurant matches the order's restaurant
  if (order.restaurant.toString() !== data.restaurant) {
    throw ApiError.badRequest('Restaurant does not match the order');
  }

  const existing = await Review.findOne({ order: data.order });
  if (existing) throw ApiError.conflict('Already reviewed this order');

  const review = await Review.create({ ...data, user: userId });

  // Atomic rating update using running average formula
  const restaurant = await Restaurant.findById(data.restaurant);
  if (restaurant) {
    const oldCount = restaurant.rating?.count ?? 0;
    const oldAvg = restaurant.rating?.average ?? 0;
    const newCount = oldCount + 1;
    const newAvg = Math.round(((oldAvg * oldCount + data.rating) / newCount) * 10) / 10;

    await Restaurant.findByIdAndUpdate(data.restaurant, {
      rating: { average: newAvg, count: newCount },
    });
  }

  return review;
};

export const getRestaurantReviews = async (restaurantId: string, page: number, limit: number) => {
  const [reviews, total] = await Promise.all([
    Review.find({ restaurant: restaurantId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments({ restaurant: restaurantId }),
  ]);
  return { reviews, total };
};

export const replyToReview = async (ownerId: string, reviewId: string, text: string) => {
  const review = await Review.findById(reviewId).populate<{
    restaurant: { _id: string; owner: { toString(): string } };
  }>('restaurant', 'owner');
  if (!review) throw ApiError.notFound('Review not found');

  const restaurant = review.restaurant as { _id: string; owner: { toString(): string } };
  if (!restaurant || restaurant.owner.toString() !== ownerId) {
    throw ApiError.forbidden('Not your restaurant');
  }

  review.reply = { text, repliedAt: new Date() };
  return review.save();
};
