import { type CreateRestaurantInput, type UpdateRestaurantInput } from '@food-delivery/shared';
import { Restaurant } from '../models/restaurant.model';
import { MenuItem } from '../models/menu-item.model';
import { ApiError } from '../utils/api-error';

interface ListQuery {
  page: number;
  limit: number;
  search?: string;
  cuisine?: string;
  priceRange?: number;
  sortBy?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export const listRestaurants = async (query: ListQuery) => {
  const { page, limit, search, cuisine, priceRange, sortBy, lat, lng, radius = 10 } = query;
  const filter: Record<string, unknown> = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }
  if (cuisine) {
    filter.cuisines = { $in: [cuisine] };
  }
  if (priceRange) {
    filter.priceRange = priceRange;
  }
  if (lat && lng) {
    filter['address.location'] = {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius * 1000,
      },
    };
  }

  let sort: Record<string, 1 | -1> = { isFeatured: -1, 'rating.average': -1 };
  if (sortBy === 'rating') sort = { 'rating.average': -1 };
  else if (sortBy === 'deliveryTime') sort = { avgDeliveryTime: 1 };
  else if (sortBy === 'priceAsc') sort = { priceRange: 1 };
  else if (sortBy === 'priceDesc') sort = { priceRange: -1 };

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Restaurant.countDocuments(filter),
  ]);

  return { restaurants, total };
};

export const getNearby = async (lat: number, lng: number, radius = 5) => {
  const cappedRadius = Math.min(Math.max(radius, 1), 50);
  return Restaurant.find({
    isActive: true,
    'address.location': {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: cappedRadius * 1000,
      },
    },
  }).limit(20);
};

export const getById = async (id: string) => {
  const restaurant = await Restaurant.findById(id).populate('owner', 'name');
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  return restaurant;
};

export const getMenu = async (restaurantId: string, page = 1, limit = 100) => {
  const cappedLimit = Math.min(limit, 200);
  return MenuItem.find({ restaurant: restaurantId, isAvailable: true })
    .populate('category', 'name slug')
    .sort({ sortOrder: 1 })
    .skip((page - 1) * cappedLimit)
    .limit(cappedLimit);
};

export const create = async (ownerId: string, data: CreateRestaurantInput) => {
  return Restaurant.create({ ...data, owner: ownerId });
};

export const update = async (
  ownerId: string,
  restaurantId: string,
  data: UpdateRestaurantInput
) => {
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: restaurantId, owner: ownerId },
    data,
    { new: true }
  );
  if (!restaurant) throw ApiError.notFound('Restaurant not found or unauthorized');
  return restaurant;
};

export const getOwnerRestaurant = async (ownerId: string) => {
  const restaurant = await Restaurant.findOne({ owner: ownerId });
  if (!restaurant) throw ApiError.notFound('No restaurant found for this owner');
  return restaurant;
};
