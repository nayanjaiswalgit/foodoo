import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/index';
import * as adminService from '../services/admin.service';
import * as featureFlagService from '../services/feature-flag.service';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getDashboard();
  sendResponse(res, 200, data);
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const { users, total } = await adminService.listUsers(page, limit, req.query.role as string);
  sendPaginatedResponse(res, users, { page, limit, total });
});

export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.toggleUserActive(req.params.id!);
  sendResponse(res, 200, user);
});

export const listRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const { restaurants, total } = await adminService.listRestaurants(page, limit);
  sendPaginatedResponse(res, restaurants, { page, limit, total });
});

export const toggleRestaurantActive = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await adminService.toggleRestaurantActive(req.params.id!);
  sendResponse(res, 200, restaurant);
});

export const updateCommission = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await adminService.updateCommission(req.params.id!, req.body.commission);
  sendResponse(res, 200, restaurant, 'Commission updated');
});

export const getFeatureFlags = asyncHandler(async (_req: Request, res: Response) => {
  const flags = await featureFlagService.getAllFlags();
  sendResponse(res, 200, flags);
});

export const toggleFeatureFlag = asyncHandler(async (req: Request, res: Response) => {
  const flag = await featureFlagService.toggleFlag(req.params.key as any, req.user!._id);
  sendResponse(res, 200, flag);
});
