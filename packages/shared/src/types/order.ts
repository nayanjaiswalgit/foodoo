import { type OrderStatus } from '../constants/order-status';
import { type PaymentMethod, type PaymentStatus } from '../constants/payment';

export interface IOrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  addons: string[];
  itemTotal: number;
}

export interface IOrderPricing {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customer: string;
  restaurant: string;
  deliveryPartner?: string;
  items: IOrderItem[];
  deliveryAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  pricing: IOrderPricing;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
  };
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  couponCode?: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}
