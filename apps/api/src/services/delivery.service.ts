import {
  OrderStatus,
  ORDER_STATUS_FLOW,
  type OrderStatus as OrderStatusType,
} from '@food-delivery/shared';
import { DeliveryPartner } from '../models/delivery-partner.model';
import { DeliveryEarning } from '../models/delivery-earning.model';
import { Order } from '../models/order.model';
import { ApiError } from '../utils/api-error';

export const registerPartner = async (
  userId: string,
  vehicleType: 'bicycle' | 'motorcycle' | 'car',
  vehicleNumber?: string
) => {
  const existing = await DeliveryPartner.findOne({ user: userId });
  if (existing) throw ApiError.conflict('Already registered as delivery partner');

  return DeliveryPartner.create({ user: userId, vehicleType, vehicleNumber });
};

export const toggleOnline = async (userId: string) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) throw ApiError.notFound('Partner not found');

  partner.isOnline = !partner.isOnline;
  if (!partner.isOnline) partner.isAvailable = false;
  return partner.save();
};

export const updateLocation = async (userId: string, coordinates: [number, number]) => {
  // Validate coordinates
  if (
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    typeof coordinates[0] !== 'number' ||
    typeof coordinates[1] !== 'number' ||
    isNaN(coordinates[0]) ||
    isNaN(coordinates[1]) ||
    coordinates[0] < -180 ||
    coordinates[0] > 180 ||
    coordinates[1] < -90 ||
    coordinates[1] > 90
  ) {
    throw ApiError.badRequest('Invalid coordinates. Expected [longitude, latitude]');
  }

  const partner = await DeliveryPartner.findOneAndUpdate(
    { user: userId },
    { currentLocation: { type: 'Point', coordinates } },
    { new: true }
  );
  if (!partner) throw ApiError.notFound('Partner not found');
  return partner;
};

export const getAvailableOrders = async (userId: string) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) throw ApiError.notFound('Partner not found');

  // Filter orders by proximity to partner's current location (within 10km)
  const filter: Record<string, unknown> = {
    status: OrderStatus.READY,
    deliveryPartner: { $exists: false },
  };

  // Only apply geo filter if partner has a valid location
  if (
    partner.currentLocation?.coordinates &&
    partner.currentLocation.coordinates[0] !== 0 &&
    partner.currentLocation.coordinates[1] !== 0
  ) {
    filter['deliveryAddress.location'] = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: partner.currentLocation.coordinates,
        },
        $maxDistance: 10000, // 10km
      },
    };
  }

  return Order.find(filter)
    .populate('restaurant', 'name address')
    .populate('customer', 'name phone')
    .sort({ createdAt: 1 })
    .limit(20);
};

export const acceptOrder = async (userId: string, orderId: string) => {
  const partner = await DeliveryPartner.findOne({
    user: userId,
    isOnline: true,
    isAvailable: true,
  });
  if (!partner) throw ApiError.badRequest('Not available for delivery');

  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: OrderStatus.READY, deliveryPartner: { $exists: false } },
    {
      deliveryPartner: partner.user,
      status: OrderStatus.PICKED_UP,
      $push: { statusHistory: { status: OrderStatus.PICKED_UP, timestamp: new Date() } },
    },
    { new: true }
  );

  if (!order) throw ApiError.badRequest('Order no longer available');

  partner.isAvailable = false;
  partner.currentOrder = order._id as any;
  await partner.save();

  return order;
};

export const completeDelivery = async (userId: string, orderId: string) => {
  const order = await Order.findOne({
    _id: orderId,
    deliveryPartner: userId,
    status: OrderStatus.ON_THE_WAY,
  });
  if (!order) throw ApiError.badRequest('Invalid order');

  // Validate transition through shared status flow
  const allowed = ORDER_STATUS_FLOW[order.status as OrderStatusType];
  if (!allowed?.includes(OrderStatus.DELIVERED as OrderStatusType)) {
    throw ApiError.badRequest(`Cannot transition from ${order.status} to delivered`);
  }

  order.status = OrderStatus.DELIVERED;
  order.statusHistory.push({ status: OrderStatus.DELIVERED, timestamp: new Date() });
  await order.save();

  // Calculate earnings breakdown
  const baseFee = Math.round(order.pricing.deliveryFee * 0.7);
  const distanceBonus = Math.round(order.pricing.deliveryFee * 0.1);
  const tipAmount = 0; // Tips not yet implemented
  const totalEarning = baseFee + distanceBonus + tipAmount;

  // Create earning record (fire-and-forget for non-critical path)
  DeliveryEarning.create({
    partner: userId,
    order: order._id,
    baseFee,
    distanceBonus,
    tipAmount,
    totalEarning,
  }).catch((err: unknown) => {
    console.error('Failed to create delivery earning record:', err);
  });

  // Update partner stats
  await DeliveryPartner.findOneAndUpdate(
    { user: userId },
    {
      isAvailable: true,
      currentOrder: undefined,
      $inc: {
        'stats.totalDeliveries': 1,
        'stats.totalEarnings': totalEarning,
      },
    }
  );

  return order;
};

export const getEarnings = async (userId: string) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) throw ApiError.notFound('Partner not found');

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayEarnings, weekEarnings, monthEarnings] = await Promise.all([
    DeliveryEarning.aggregate([
      { $match: { partner: partner.user, createdAt: { $gte: todayStart } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalEarning' },
          count: { $sum: 1 },
        },
      },
    ]),
    DeliveryEarning.aggregate([
      { $match: { partner: partner.user, createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalEarning' },
          count: { $sum: 1 },
        },
      },
    ]),
    DeliveryEarning.aggregate([
      { $match: { partner: partner.user, createdAt: { $gte: monthStart } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalEarning' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    totalDeliveries: partner.stats.totalDeliveries,
    totalEarnings: partner.stats.totalEarnings,
    rating: partner.stats.rating.average,
    todayDeliveries: todayEarnings[0]?.count ?? 0,
    todayEarnings: todayEarnings[0]?.total ?? 0,
    weekDeliveries: weekEarnings[0]?.count ?? 0,
    weekEarnings: weekEarnings[0]?.total ?? 0,
    monthDeliveries: monthEarnings[0]?.count ?? 0,
    monthEarnings: monthEarnings[0]?.total ?? 0,
  };
};

export const getEarningsHistory = async (userId: string, page: number, limit: number) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner) throw ApiError.notFound('Partner not found');

  const [earnings, total] = await Promise.all([
    DeliveryEarning.find({ partner: partner.user })
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DeliveryEarning.countDocuments({ partner: partner.user }),
  ]);

  return { earnings, total };
};
