import { type IReview, type PaginatedResponse } from '@food-delivery/shared';
import { apiClient } from '../lib/api-client';

interface CreateReviewInput {
  restaurant: string;
  order: string;
  rating: number;
  comment: string;
}

export const reviewApi = {
  create: (data: CreateReviewInput) =>
    apiClient.post<{ data: IReview }>('/reviews', data).then((r) => r.data.data),

  getByRestaurant: (restaurantId: string, page = 1, limit = 10) =>
    apiClient
      .get<PaginatedResponse<IReview>>(`/reviews/restaurant/${restaurantId}`, { params: { page, limit } })
      .then((r) => r.data),
};
