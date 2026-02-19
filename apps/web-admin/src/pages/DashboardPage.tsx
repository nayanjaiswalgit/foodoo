import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.store';
import { adminApi } from '../services/admin.service';
import { restaurantApi } from '../services/restaurant.service';
import { StatCard } from '../components/StatCard';
import { UserRole } from '@food-delivery/shared';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  const { data: adminDash } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminApi.getDashboard,
    enabled: isSuperAdmin,
  });

  const { data: restaurant } = useQuery({
    queryKey: ['myRestaurant'],
    queryFn: restaurantApi.getMyRestaurant,
    enabled: !isSuperAdmin,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {isSuperAdmin && adminDash && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Users" value={adminDash.totalUsers} icon="👥" />
            <StatCard title="Total Restaurants" value={adminDash.totalRestaurants} icon="🏪" />
            <StatCard title="Total Orders" value={adminDash.totalOrders} icon="📋" />
            <StatCard title="Total Revenue" value={`₹${adminDash.totalRevenue.toLocaleString()}`} icon="💰" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Restaurant</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {adminDash.recentOrders.map((order: Record<string, unknown>) => (
                    <tr key={order._id as string} className="border-b border-gray-50">
                      <td className="py-3 font-medium">{order.orderNumber as string}</td>
                      <td className="py-3">{(order.restaurant as Record<string, string>)?.name ?? 'N/A'}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                          {(order.status as string).replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 font-medium">₹{((order.pricing as Record<string, number>)?.total ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!isSuperAdmin && restaurant && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Restaurant" value={restaurant.name} icon="🏪" />
          <StatCard title="Rating" value={`${restaurant.rating.average} ⭐`} icon="⭐" />
          <StatCard title="Reviews" value={restaurant.rating.count} icon="💬" />
        </div>
      )}
    </div>
  );
}
