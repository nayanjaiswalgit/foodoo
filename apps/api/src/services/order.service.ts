import {
  type PlaceOrderInput,
  OrderStatus,
  ORDER_STATUS_FLOW,
  type OrderStatus as OrderStatusType,
  UserRole,
} from '@food-delivery/shared';
import mongoose from 'mongoose';
import { Order } from '../models/order.model';
import { MenuItem } from '../models/menu-item.model';
import { Restaurant } from '../models/restaurant.model';
import { Address } from '../models/address.model';
import { Coupon } from '../models/coupon.model';
import { CouponUsage } from '../models/coupon-usage.model';
import { ApiError, generateOrderNumber } from '../utils/index';
import { getIO } from '../socket';

const TAX_RATE = 0.05;
const MAX_ORDER_ITEMS = 50;

export const placeOrder = async (
  customerId: string,
  input: PlaceOrderInput,
  idempotencyKey?: string
) => {
  // Idempotency: if a key is provided, check for existing order
  if (idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey, customer: customerId });
    if (existing) return existing;
  }

  // Only COD is supported until payment gateway integration
  if (input.paymentMethod !== 'cod') {
    throw ApiError.badRequest('Only Cash on Delivery is currently supported');
  }

  if (input.items.length > MAX_ORDER_ITEMS) {
    throw ApiError.badRequest(`Cannot order more than ${MAX_ORDER_ITEMS} items`);
  }

  const restaurant = await Restaurant.findById(input.restaurant);
  if (!restaurant || !restaurant.isActive) {
    throw ApiError.badRequest('Restaurant not available');
  }

  const address = await Address.findOne({ _id: input.deliveryAddress, user: customerId });
  if (!address) throw ApiError.badRequest('Invalid delivery address');

  const menuItems = await MenuItem.find({
    _id: { $in: input.items.map((i) => i.menuItem) },
    restaurant: input.restaurant,
    isAvailable: true,
  });

  if (menuItems.length !== input.items.length) {
    throw ApiError.badRequest('Some items are unavailable');
  }

  const itemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));
  let subtotal = 0;
  const orderItems = input.items.map((item) => {
    const menuItem = itemMap.get(item.menuItem);
    if (!menuItem) {
      throw ApiError.badRequest(`Menu item ${item.menuItem} not found`);
    }
    let price = menuItem.price;

    if (item.variant) {
      const variant = menuItem.variants.find((v) => v.name === item.variant);
      if (!variant) {
        throw ApiError.badRequest(`Variant "${item.variant}" not found for "${menuItem.name}"`);
      }
      price = variant.price;
    }

    const addonTotal = item.addons.reduce((sum, addonName) => {
      const addon = menuItem.addons.find((a) => a.name === addonName);
      if (!addon) {
        throw ApiError.badRequest(`Addon "${addonName}" not found for "${menuItem.name}"`);
      }
      return sum + addon.price;
    }, 0);

    const itemTotal = (price + addonTotal) * item.quantity;
    subtotal += itemTotal;

    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      price,
      quantity: item.quantity,
      variant: item.variant,
      addons: item.addons,
      itemTotal,
    };
  });

  if (subtotal < restaurant.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order amount is ₹${restaurant.minOrderAmount}`);
  }

  let discount = 0;
  let couponId: mongoose.Types.ObjectId | null = null;

  if (input.couponCode) {
    // Atomically claim the coupon: find valid coupon AND increment usedCount in one op.
    // This prevents the race condition where two concurrent orders both see the same usedCount.
    const coupon = await Coupon.findOneAndUpdate(
      {
        code: input.couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
        $expr: { $lt: ['$usedCount', '$usageLimit'] },
      },
      { $inc: { usedCount: 1 } },
      { new: false } // return pre-update doc to calculate discount from original values
    );

    if (!coupon) throw ApiError.badRequest('Invalid or expired coupon');
    if (subtotal < coupon.minOrderAmount) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: -1 } });
      throw ApiError.badRequest(`Minimum ₹${coupon.minOrderAmount} for this coupon`);
    }
    if (coupon.restaurant && coupon.restaurant.toString() !== input.restaurant) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: -1 } });
      throw ApiError.badRequest('Coupon not valid for this restaurant');
    }

    // Check per-user usage limit
    if (coupon.maxUsagePerUser > 0) {
      const usage = await CouponUsage.findOneAndUpdate(
        { coupon: coupon._id, user: customerId },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
      if (usage.count > coupon.maxUsagePerUser) {
        // Rollback both increments
        await CouponUsage.findOneAndUpdate(
          { coupon: coupon._id, user: customerId },
          { $inc: { count: -1 } }
        );
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: -1 } });
        throw ApiError.badRequest('You have reached the usage limit for this coupon');
      }
    }

    couponId = coupon._id as mongoose.Types.ObjectId;
    discount =
      coupon.discountType === 'percentage'
        ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount)
        : Math.min(coupon.discountValue, coupon.maxDiscount);
    discount = Math.round(discount);
  }

  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = subtotal + restaurant.deliveryFee + tax - discount;

  if (total < 0) {
    throw ApiError.badRequest('Invalid order total');
  }

  try {
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: customerId,
      restaurant: restaurant._id,
      items: orderItems,
      deliveryAddress: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        pincode: address.pincode,
        location: address.location,
      },
      pricing: { subtotal, deliveryFee: restaurant.deliveryFee, tax, discount, total },
      payment: { method: input.paymentMethod, status: 'pending' },
      status: OrderStatus.PLACED,
      statusHistory: [{ status: OrderStatus.PLACED, timestamp: new Date() }],
      couponCode: input.couponCode,
      specialInstructions: input.specialInstructions,
      ...(idempotencyKey && { idempotencyKey }),
    });

    return order;
  } catch (error) {
    // If order creation fails and we already incremented coupon, rollback
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: -1 } });
      await CouponUsage.findOneAndUpdate(
        { coupon: couponId, user: customerId },
        { $inc: { count: -1 } }
      );
    }
    throw error;
  }
};

export const getCustomerOrders = async (customerId: string, page: number, limit: number) => {
  const [orders, total] = await Promise.all([
    Order.find({ customer: customerId })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments({ customer: customerId }),
  ]);
  return { orders, total };
};

export const getOrderById = async (orderId: string, userId: string, userRole: string) => {
  const order = await Order.findById(orderId)
    .populate('restaurant', 'name image phone address')
    .populate('deliveryPartner', 'name phone');

  if (!order) throw ApiError.notFound('Order not found');

  const isCustomer = order.customer.toString() === userId;
  const isDeliveryPartner = order.deliveryPartner?.toString() === userId;
  const isAdmin = userRole === UserRole.SUPER_ADMIN;

  // For restaurant owners, we need to check restaurant ownership, not direct ID match
  let isRestaurantOwner = false;
  if (userRole === UserRole.RESTAURANT_OWNER) {
    const restaurant = await Restaurant.findOne({ _id: order.restaurant, owner: userId });
    isRestaurantOwner = !!restaurant;
  }

  if (!isCustomer && !isRestaurantOwner && !isDeliveryPartner && !isAdmin) {
    throw ApiError.forbidden('Unauthorized');
  }

  return order;
};

export const getRestaurantOrders = async (
  ownerId: string,
  restaurantId: string,
  status: string | undefined,
  page: number,
  limit: number
) => {
  // Verify the requesting user actually owns this restaurant
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: ownerId });
  if (!restaurant) {
    throw ApiError.forbidden('Not your restaurant');
  }

  const filter: Record<string, unknown> = { restaurant: restaurantId };
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  return { orders, total };
};

export const updateStatus = async (
  orderId: string,
  newStatus: OrderStatusType,
  userId: string,
  userRole: string,
  note?: string
) => {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  // Authorization: verify the user can update THIS order
  if (userRole === UserRole.RESTAURANT_OWNER) {
    const restaurant = await Restaurant.findOne({ _id: order.restaurant, owner: userId });
    if (!restaurant) throw ApiError.forbidden('Not your restaurant order');
  } else if (userRole === UserRole.DELIVERY_PARTNER) {
    if (order.deliveryPartner?.toString() !== userId) {
      throw ApiError.forbidden('Not your delivery order');
    }
  }
  // SUPER_ADMIN can update any order (already authorized by route middleware)

  const allowed = ORDER_STATUS_FLOW[order.status as OrderStatusType];
  if (!allowed?.includes(newStatus)) {
    throw ApiError.badRequest(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  order.status = newStatus;
  order.statusHistory.push({ status: newStatus, timestamp: new Date(), note });
  const saved = await order.save();

  // Emit real-time status update to all listeners
  try {
    const io = getIO();
    const orderNs = io.of('/orders');
    orderNs.to(`order:${orderId}`).emit('order-status', {
      orderId,
      status: newStatus,
      timestamp: new Date(),
    });
    orderNs.to(`user:${order.customer.toString()}`).emit('order-status', {
      orderId,
      status: newStatus,
      timestamp: new Date(),
    });
  } catch {
    // Socket emission is non-critical; don't fail the request
  }

  return saved;
};

export const cancelOrder = async (orderId: string, userId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.customer.toString() !== userId) throw ApiError.forbidden('Not your order');

  const cancellable: string[] = [OrderStatus.PLACED, OrderStatus.CONFIRMED];
  if (!cancellable.includes(order.status)) {
    throw ApiError.badRequest('Order cannot be cancelled at this stage');
  }

  order.status = OrderStatus.CANCELLED;
  order.statusHistory.push({
    status: OrderStatus.CANCELLED,
    timestamp: new Date(),
    note: 'Cancelled by customer',
  });

  // Rollback coupon usage if a coupon was used
  if (order.couponCode) {
    const coupon = await Coupon.findOneAndUpdate(
      { code: order.couponCode.toUpperCase() },
      { $inc: { usedCount: -1 } }
    );
    if (coupon) {
      await CouponUsage.findOneAndUpdate(
        { coupon: coupon._id, user: userId },
        { $inc: { count: -1 } }
      );
    }
  }

  return order.save();
};
