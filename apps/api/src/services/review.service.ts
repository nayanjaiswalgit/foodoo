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

  const existing = await Review.findOne({ order: data.order });
  if (existing) throw ApiError.conflict('Already reviewed this order');

  const review = await Review.create({ ...data, user: userId });

  const reviews = await Review.find({ restaurant: data.restaurant });
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Restaurant.findByIdAndUpdate(data.restaurant, {
    rating: { average: Math.round(avg * 10) / 10, count: reviews.length },
  });

  return review;
};

export const getRestaurantReviews = async (
  restaurantId: string,
  page: number,
  limit: number
) => {
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

export const replyToReview = async (
  ownerId: string,
  reviewId: string,
  text: string
) => {
  const review = await Review.findById(reviewId).populate('restaurant', 'owner');
  if (!review) throw ApiError.notFound('Review not found');

  const restaurant = await Restaurant.findById(review.restaurant);
  if (!restaurant || restaurant.owner.toString() !== ownerId) {
    throw ApiError.forbidden('Not your restaurant');
  }

  review.reply = { text, repliedAt: new Date() };
  return review.save();
};
