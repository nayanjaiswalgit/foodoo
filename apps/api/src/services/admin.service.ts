import { OrderStatus } from '@food-delivery/shared';
import { User } from '../models/user.model';
import { Restaurant } from '../models/restaurant.model';
import { Order } from '../models/order.model';
import { DeliveryPartner } from '../models/delivery-partner.model';
import { ApiError } from '../utils/api-error';

export const getDashboard = async () => {
  const [totalUsers, totalRestaurants, totalOrders, totalPartners, recentOrders, revenue] =
    await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      DeliveryPartner.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('restaurant', 'name'),
      Order.aggregate([
        { $match: { status: OrderStatus.DELIVERED } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
    ]);

  return {
    totalUsers,
    totalRestaurants,
    totalOrders,
    totalPartners,
    totalRevenue: revenue[0]?.total ?? 0,
    recentOrders,
  };
};

export const listUsers = async (page: number, limit: number, role?: string) => {
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, total };
};

export const toggleUserActive = async (userId: string, adminId: string) => {
  if (userId === adminId) {
    throw ApiError.badRequest('Cannot deactivate your own account');
  }
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  user.isActive = !user.isActive;
  return user.save();
};

export const listRestaurants = async (page: number, limit: number) => {
  const [restaurants, total] = await Promise.all([
    Restaurant.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Restaurant.countDocuments(),
  ]);
  return { restaurants, total };
};

export const toggleRestaurantActive = async (restaurantId: string) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  restaurant.isActive = !restaurant.isActive;
  return restaurant.save();
};

export const updateCommission = async (restaurantId: string, commission: number) => {
  if (typeof commission !== 'number' || isNaN(commission) || commission < 0 || commission > 50) {
    throw ApiError.badRequest('Commission must be between 0 and 50 percent');
  }
  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { commission },
    { new: true }
  );
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  return restaurant;
};
