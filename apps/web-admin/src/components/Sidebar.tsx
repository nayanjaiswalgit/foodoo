import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { UserRole } from '@food-delivery/shared';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '📊', roles: [UserRole.RESTAURANT_OWNER, UserRole.SUPER_ADMIN] },
  { to: '/orders', label: 'Orders', icon: '📋', roles: [UserRole.RESTAURANT_OWNER, UserRole.SUPER_ADMIN] },
  { to: '/menu', label: 'Menu', icon: '🍕', roles: [UserRole.RESTAURANT_OWNER] },
  { to: '/reviews', label: 'Reviews', icon: '⭐', roles: [UserRole.RESTAURANT_OWNER] },
  { to: '/users', label: 'Users', icon: '👥', roles: [UserRole.SUPER_ADMIN] },
  { to: '/restaurants', label: 'Restaurants', icon: '🏪', roles: [UserRole.SUPER_ADMIN] },
  { to: '/feature-flags', label: 'Feature Flags', icon: '🚩', roles: [UserRole.SUPER_ADMIN] },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-orange-500">🍕 FoodDelivery</h1>
        <p className="text-xs text-gray-500 mt-1">
          {user?.role === UserRole.SUPER_ADMIN ? 'Admin Panel' : 'Restaurant Panel'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
