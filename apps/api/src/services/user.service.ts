import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).populate('favorites', 'name image rating');
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const updateProfile = async (userId: string, data: { name?: string; avatar?: string }) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const toggleFavorite = async (userId: string, restaurantId: string) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const index = user.favorites.findIndex((id) => id.toString() === restaurantId);
  if (index === -1) {
    user.favorites.push(restaurantId as any);
  } else {
    user.favorites.splice(index, 1);
  }
  await user.save();
  return user;
};
