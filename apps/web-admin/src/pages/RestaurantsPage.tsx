import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/admin.service';

export function RestaurantsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminRestaurants', page],
    queryFn: () => adminApi.getRestaurants(page),
  });

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleRestaurantActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] }),
  });

  const commissionMutation = useMutation({
    mutationFn: ({ id, commission }: { id: string; commission: number }) =>
      adminApi.updateCommission(id, commission),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] }),
  });

  const restaurants = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurants</h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Commission %</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r: Record<string, unknown>) => (
                <tr key={r._id as string} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{r.name as string}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {(r.owner as Record<string, string>)?.name ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    ⭐ {(r.rating as Record<string, number>)?.average ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      defaultValue={r.commission as number}
                      min={0}
                      max={50}
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-center"
                      onBlur={(e) =>
                        commissionMutation.mutate({
                          id: r._id as string,
                          commission: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${r.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                    >
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleMutation.mutate(r._id as string)}
                      className={`text-xs font-medium ${r.isActive ? 'text-red-600' : 'text-green-600'} hover:underline`}
                    >
                      {r.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
