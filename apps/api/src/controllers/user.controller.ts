import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse } from '../utils/index';
import * as userService from '../services/user.service';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!._id);
  sendResponse(res, 200, user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!._id, req.body);
  sendResponse(res, 200, user, 'Profile updated');
});

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.toggleFavorite(req.user!._id, req.params.restaurantId!);
  sendResponse(res, 200, user);
});
