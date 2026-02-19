import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { UserRole } from '@food-delivery/shared';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { MenuPage } from './pages/MenuPage';
import { UsersPage } from './pages/UsersPage';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { FeatureFlagsPage } from './pages/FeatureFlagsPage';
import { ReviewsPage } from './pages/ReviewsPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/feature-flags" element={<FeatureFlagsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
