import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/index';
import * as orderService from '../services/order.service';

export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.placeOrder(req.user!._id, req.body);
  sendResponse(res, 201, order, 'Order placed');
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const { orders, total } = await orderService.getCustomerOrders(req.user!._id, page, limit);
  sendPaginatedResponse(res, orders, { page, limit, total });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById((req.params.id as string), req.user!._id);
  sendResponse(res, 200, order);
});

export const getRestaurantOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const { orders, total } = await orderService.getRestaurantOrders(
    (req.params.restaurantId as string),
    req.query.status as string | undefined,
    page,
    limit
  );
  sendPaginatedResponse(res, orders, { page, limit, total });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateStatus((req.params.id as string), req.body.status, req.body.note);
  sendResponse(res, 200, order, 'Status updated');
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder((req.params.id as string), req.user!._id);
  sendResponse(res, 200, order, 'Order cancelled');
});
