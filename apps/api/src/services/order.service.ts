import { type PlaceOrderInput, OrderStatus, ORDER_STATUS_FLOW, type OrderStatus as OrderStatusType } from '@food-delivery/shared';
import { Order } from '../models/order.model';
import { MenuItem } from '../models/menu-item.model';
import { Restaurant } from '../models/restaurant.model';
import { Address } from '../models/address.model';
import { Coupon } from '../models/coupon.model';
import { ApiError, generateOrderNumber } from '../utils/index';

const TAX_RATE = 0.05;

export const placeOrder = async (customerId: string, input: PlaceOrderInput) => {
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
    const menuItem = itemMap.get(item.menuItem)!;
    let price = menuItem.price;

    if (item.variant) {
      const variant = menuItem.variants.find((v) => v.name === item.variant);
      if (variant) price = variant.price;
    }

    const addonTotal = item.addons.reduce((sum, addonName) => {
      const addon = menuItem.addons.find((a) => a.name === addonName);
      return sum + (addon?.price ?? 0);
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
    throw ApiError.badRequest(
      `Minimum order amount is ₹${restaurant.minOrderAmount}`
    );
  }

  let discount = 0;
  if (input.couponCode) {
    const coupon = await Coupon.findOne({
      code: input.couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    });

    if (!coupon) throw ApiError.badRequest('Invalid or expired coupon');
    if (subtotal < coupon.minOrderAmount) {
      throw ApiError.badRequest(`Minimum ₹${coupon.minOrderAmount} for this coupon`);
    }

    discount =
      coupon.discountType === 'percentage'
        ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount)
        : Math.min(coupon.discountValue, coupon.maxDiscount);

    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
  }

  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = subtotal + restaurant.deliveryFee + tax - discount;

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
    payment: { method: input.paymentMethod, status: 'completed' },
    status: OrderStatus.PLACED,
    statusHistory: [{ status: OrderStatus.PLACED, timestamp: new Date() }],
    couponCode: input.couponCode,
    specialInstructions: input.specialInstructions,
  });

  return order;
};

export const getCustomerOrders = async (
  customerId: string,
  page: number,
  limit: number
) => {
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

export const getOrderById = async (orderId: string, userId: string) => {
  const order = await Order.findById(orderId)
    .populate('restaurant', 'name image phone address')
    .populate('deliveryPartner', 'name phone');

  if (!order) throw ApiError.notFound('Order not found');
  if (
    order.customer.toString() !== userId &&
    order.restaurant.toString() !== userId
  ) {
    throw ApiError.forbidden('Unauthorized');
  }
  return order;
};

export const getRestaurantOrders = async (
  restaurantId: string,
  status: string | undefined,
  page: number,
  limit: number
) => {
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
  note?: string
) => {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  const allowed = ORDER_STATUS_FLOW[order.status as OrderStatusType];
  if (!allowed?.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from ${order.status} to ${newStatus}`
    );
  }

  order.status = newStatus;
  order.statusHistory.push({ status: newStatus, timestamp: new Date(), note });
  return order.save();
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
  return order.save();
};
