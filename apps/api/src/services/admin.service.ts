import { OrderStatus } from '@food-delivery/shared';
import { User } from '../models/user.model';
import { Restaurant } from '../models/restaurant.model';
import { Order } from '../models/order.model';
import { DeliveryPartner } from '../models/delivery-partner.model';
import { ApiError } from '../utils/api-error';
import { logAdminAction } from './audit-log.service';

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
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, total };
};

export const toggleUserActive = async (userId: string, adminId: string, ipAddress?: string) => {
  if (userId === adminId) {
    throw ApiError.badRequest('Cannot deactivate your own account');
  }
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  const previousState = user.isActive;
  user.isActive = !user.isActive;
  await user.save();

  logAdminAction({
    adminId,
    action: user.isActive ? 'activate_user' : 'deactivate_user',
    targetType: 'User',
    targetId: userId,
    changes: { isActive: { from: previousState, to: user.isActive } },
    ipAddress,
  });

  return user;
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

export const toggleRestaurantActive = async (
  restaurantId: string,
  adminId: string,
  ipAddress?: string
) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  const previousState = restaurant.isActive;
  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();

  logAdminAction({
    adminId,
    action: restaurant.isActive ? 'activate_restaurant' : 'deactivate_restaurant',
    targetType: 'Restaurant',
    targetId: restaurantId,
    changes: { isActive: { from: previousState, to: restaurant.isActive } },
    ipAddress,
  });

  return restaurant;
};

export const updateCommission = async (
  restaurantId: string,
  commission: number,
  adminId: string,
  ipAddress?: string
) => {
  if (typeof commission !== 'number' || isNaN(commission) || commission < 0 || commission > 50) {
    throw ApiError.badRequest('Commission must be between 0 and 50 percent');
  }
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');

  const previousCommission = restaurant.commission;
  restaurant.commission = commission;
  await restaurant.save();

  logAdminAction({
    adminId,
    action: 'update_commission',
    targetType: 'Restaurant',
    targetId: restaurantId,
    changes: { commission: { from: previousCommission, to: commission } },
    ipAddress,
  });

  return restaurant;
};
