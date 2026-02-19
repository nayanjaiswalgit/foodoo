import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/index';
import * as restaurantService from '../services/restaurant.service';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const { restaurants, total } = await restaurantService.listRestaurants({
    page,
    limit,
    search: req.query.search as string,
    cuisine: req.query.cuisine as string,
    priceRange: Number(req.query.priceRange) || undefined,
    sortBy: req.query.sortBy as string,
    lat: Number(req.query.lat) || undefined,
    lng: Number(req.query.lng) || undefined,
    radius: Number(req.query.radius) || undefined,
  });
  sendPaginatedResponse(res, restaurants, { page, limit, total });
});

export const nearby = asyncHandler(async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius) || 5;
  const restaurants = await restaurantService.getNearby(lat, lng, radius);
  sendResponse(res, 200, restaurants);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.getById(req.params.id!);
  sendResponse(res, 200, restaurant);
});

export const getMenu = asyncHandler(async (req: Request, res: Response) => {
  const menu = await restaurantService.getMenu(req.params.id!);
  sendResponse(res, 200, menu);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.create(req.user!._id, req.body);
  sendResponse(res, 201, restaurant, 'Restaurant created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.update(req.user!._id, req.params.id!, req.body);
  sendResponse(res, 200, restaurant, 'Restaurant updated');
});

export const getOwnerRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.getOwnerRestaurant(req.user!._id);
  sendResponse(res, 200, restaurant);
});
