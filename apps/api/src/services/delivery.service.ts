import { OrderStatus } from '@food-delivery/shared';
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

  return Order.find({
    status: OrderStatus.READY,
    deliveryPartner: { $exists: false },
  })
    .populate('restaurant', 'name address')
    .populate('customer', 'name phone')
    .sort({ createdAt: 1 });
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

  order.status = OrderStatus.DELIVERED;
  order.statusHistory.push({ status: OrderStatus.DELIVERED, timestamp: new Date() });
  await order.save();

  const deliveryEarning = Math.round(order.pricing.deliveryFee * 0.8);
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = await Order.countDocuments({
    deliveryPartner: userId,
    status: OrderStatus.DELIVERED,
    createdAt: { $gte: todayStart },
  });

  return {
    totalDeliveries: partner.stats.totalDeliveries,
    totalEarnings: partner.stats.totalEarnings,
    rating: partner.stats.rating,
    todayDeliveries: todayOrders,
  };
};
