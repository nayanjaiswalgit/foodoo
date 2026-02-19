import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse } from '../utils/index';
import * as menuService from '../services/menu.service';

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await menuService.createItem(req.user!._id, req.params.restaurantId!, req.body);
  sendResponse(res, 201, item, 'Menu item created');
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await menuService.updateItem(req.user!._id, req.params.id!, req.body);
  sendResponse(res, 200, item, 'Menu item updated');
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  await menuService.deleteItem(req.user!._id, req.params.id!);
  sendResponse(res, 200, null, 'Menu item deleted');
});

export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const item = await menuService.toggleAvailability(req.user!._id, req.params.id!);
  sendResponse(res, 200, item);
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await menuService.getCategories();
  sendResponse(res, 200, categories);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await menuService.createCategory(req.body);
  sendResponse(res, 201, category, 'Category created');
});
