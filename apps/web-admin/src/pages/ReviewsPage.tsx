import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurant.service';

export function ReviewsPage() {
  const [page, setPage] = useState(1);

  const { data: restaurant } = useQuery({
    queryKey: ['myRestaurant'],
    queryFn: restaurantApi.getMyRestaurant,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', restaurant?._id, page],
    queryFn: () => restaurantApi.getReviews(restaurant._id, page),
    enabled: !!restaurant?._id,
  });

  const reviews = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No reviews yet</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Record<string, unknown>) => (
            <div
              key={review._id as string}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
                    {((review.user as Record<string, string>)?.name?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {(review.user as Record<string, string>)?.name ?? 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt as string).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {'⭐'.repeat(review.rating as number)}
                </div>
              </div>
              <p className="text-gray-700 text-sm">{review.comment as string}</p>
              {(review.reply as Record<string, string>)?.text && (
                <div className="mt-3 pl-4 border-l-2 border-orange-200">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-orange-600">Your reply: </span>
                    {(review.reply as Record<string, string>).text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data?.pagination && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={!data.pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            disabled={!data.pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
