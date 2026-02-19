import { type Cuisine } from '../constants/cuisines';

export interface IOperatingHours {
  day: number;
  open: string;
  close: string;
}

export interface IRestaurant {
  _id: string;
  owner: string;
  name: string;
  description: string;
  cuisines: Cuisine[];
  image: string;
  images: string[];
  address: {
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  operatingHours: IOperatingHours[];
  rating: {
    average: number;
    count: number;
  };
  priceRange: 1 | 2 | 3 | 4;
  deliveryFee: number;
  minOrderAmount: number;
  avgDeliveryTime: number;
  commission: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  sortOrder: number;
}

export interface IAddon {
  name: string;
  price: number;
}

export interface IVariant {
  name: string;
  price: number;
}

export interface IMenuItem {
  _id: string;
  restaurant: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isVeg: boolean;
  addons: IAddon[];
  variants: IVariant[];
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
