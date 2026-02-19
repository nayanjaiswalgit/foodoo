import { OrderStatus, ORDER_STATUS_FLOW, type OrderStatus as OrderStatusType } from '@food-delivery/shared';
import { DeliveryPartner } from '../models/delivery-partner.model';
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

export const updateLocation = async (
  userId: string,
  coordinates: [number, number]
) => {
  // Validate coordinates
  if (
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    typeof coordinates[0] !== 'number' ||
    typeof coordinates[1] !== 'number' ||
    isNaN(coordinates[0]) ||
    isNaN(coordinates[1]) ||
    coordinates[0] < -180 || coordinates[0] > 180 ||
    coordinates[1] < -90 || coordinates[1] > 90
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
  const partner = await DeliveryPartner.findOne({ user: userId, isOnline: true, isAvailable: true });
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

  const deliveryEarning = Math.round(order.pricing.deliveryFee * 0.8);

  // Update partner stats — if this fails, the order is still marked delivered (acceptable)
  // The earnings can be reconciled. Order delivery is the critical path.
  await DeliveryPartner.findOneAndUpdate(
    { user: userId },
    {
      isAvailable: true,
      currentOrder: undefined,
      $inc: {
        'stats.totalDeliveries': 1,
        'stats.totalEarnings': deliveryEarning,
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

  const deliveredFilter = {
    deliveryPartner: userId,
    status: OrderStatus.DELIVERED,
  };

  const [todayOrders, weekOrders, monthOrders] = await Promise.all([
    Order.find({ ...deliveredFilter, createdAt: { $gte: todayStart } }).select('pricing.deliveryFee'),
    Order.find({ ...deliveredFilter, createdAt: { $gte: weekStart } }).select('pricing.deliveryFee'),
    Order.find({ ...deliveredFilter, createdAt: { $gte: monthStart } }).select('pricing.deliveryFee'),
  ]);

  const calcEarnings = (orders: typeof todayOrders) =>
    orders.reduce((sum, o) => sum + Math.round(o.pricing.deliveryFee * 0.8), 0);

  return {
    totalDeliveries: partner.stats.totalDeliveries,
    totalEarnings: partner.stats.totalEarnings,
    rating: partner.stats.rating.average,
    todayDeliveries: todayOrders.length,
    todayEarnings: calcEarnings(todayOrders),
    weekDeliveries: weekOrders.length,
    weekEarnings: calcEarnings(weekOrders),
    monthDeliveries: monthOrders.length,
    monthEarnings: calcEarnings(monthOrders),
  };
};
