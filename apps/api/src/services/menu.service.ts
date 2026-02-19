import { type CreateMenuItemInput, type UpdateMenuItemInput, type CreateCategoryInput } from '@food-delivery/shared';
import { MenuItem } from '../models/menu-item.model';
import { Category } from '../models/category.model';
import { Restaurant } from '../models/restaurant.model';
import { ApiError } from '../utils/api-error';

export const createItem = async (
  ownerId: string,
  restaurantId: string,
  data: CreateMenuItemInput
) => {
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: ownerId });
  if (!restaurant) throw ApiError.forbidden('Not your restaurant');

  return MenuItem.create({ ...data, restaurant: restaurantId });
};

export const updateItem = async (
  ownerId: string,
  itemId: string,
  data: UpdateMenuItemInput
) => {
  const item = await MenuItem.findById(itemId).populate('restaurant', 'owner');
  if (!item) throw ApiError.notFound('Menu item not found');

  const restaurant = await Restaurant.findById(item.restaurant);
  if (!restaurant || restaurant.owner.toString() !== ownerId) {
    throw ApiError.forbidden('Not your restaurant');
  }

  Object.assign(item, data);
  return item.save();
};

export const deleteItem = async (ownerId: string, itemId: string) => {
  const item = await MenuItem.findById(itemId);
  if (!item) throw ApiError.notFound('Menu item not found');

  const restaurant = await Restaurant.findById(item.restaurant);
  if (!restaurant || restaurant.owner.toString() !== ownerId) {
    throw ApiError.forbidden('Not your restaurant');
  }

  await item.deleteOne();
};

export const toggleAvailability = async (ownerId: string, itemId: string) => {
  const item = await MenuItem.findById(itemId);
  if (!item) throw ApiError.notFound('Menu item not found');

  const restaurant = await Restaurant.findById(item.restaurant);
  if (!restaurant || restaurant.owner.toString() !== ownerId) {
    throw ApiError.forbidden('Not your restaurant');
  }

  item.isAvailable = !item.isAvailable;
  return item.save();
};

export const getCategories = async () => {
  return Category.find().sort({ sortOrder: 1 });
};

export const createCategory = async (data: CreateCategoryInput) => {
  return Category.create(data);
};
