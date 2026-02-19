import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurant.service';
import { useAuthStore } from '../stores/auth.store';
import { UserRole, OrderStatus } from '@food-delivery/shared';
import { adminApi } from '../services/admin.service';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: OrderStatus.PLACED, label: 'Placed' },
  { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
  { value: OrderStatus.PREPARING, label: 'Preparing' },
  { value: OrderStatus.READY, label: 'Ready' },
  { value: OrderStatus.DELIVERED, label: 'Delivered' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-orange-50 text-orange-600',
  confirmed: 'bg-blue-50 text-blue-600',
  preparing: 'bg-yellow-50 text-yellow-600',
  ready: 'bg-green-50 text-green-600',
  picked_up: 'bg-indigo-50 text-indigo-600',
  on_the_way: 'bg-purple-50 text-purple-600',
  delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

export function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: restaurant } = useQuery({
    queryKey: ['myRestaurant'],
    queryFn: restaurantApi.getMyRestaurant,
    enabled: user?.role === UserRole.RESTAURANT_OWNER,
  });

  const restaurantId = restaurant?._id;

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['restaurantOrders', restaurantId, page, statusFilter],
    queryFn: () => restaurantApi.getOrders(restaurantId!, page, statusFilter || undefined),
    enabled: !!restaurantId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      restaurantApi.updateOrderStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] }),
  });

  const orders = ordersData?.data ?? [];

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      placed: OrderStatus.CONFIRMED,
      confirmed: OrderStatus.PREPARING,
      preparing: OrderStatus.READY,
    };
    return flow[current] ?? null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === opt.value ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No orders found</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50">
                <th className="px-6 py-3 font-medium">Order #</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Record<string, unknown>) => {
                const status = order.status as string;
                const nextStatus = getNextStatus(status);
                return (
                  <tr key={order._id as string} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{order.orderNumber as string}</td>
                    <td className="px-6 py-4">{(order.customer as Record<string, string>)?.name ?? 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {(order.items as Array<Record<string, unknown>>)?.length ?? 0} items
                    </td>
                    <td className="px-6 py-4 font-medium">₹{(order.pricing as Record<string, number>)?.total ?? 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[status] ?? ''}`}>
                        {status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {nextStatus && (
                        <button
                          onClick={() => updateStatusMutation.mutate({
                            orderId: order._id as string,
                            status: nextStatus,
                          })}
                          className="px-3 py-1 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          → {nextStatus.replace(/_/g, ' ')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {ordersData?.pagination && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={!ordersData.pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {ordersData.pagination.page} of {ordersData.pagination.totalPages}
          </span>
          <button
            disabled={!ordersData.pagination.hasNext}
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
