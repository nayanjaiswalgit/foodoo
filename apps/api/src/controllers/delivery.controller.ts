import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse } from '../utils/index';
import * as deliveryService from '../services/delivery.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const partner = await deliveryService.registerPartner(
    req.user!._id,
    req.body.vehicleType,
    req.body.vehicleNumber
  );
  sendResponse(res, 201, partner, 'Registered as delivery partner');
});

export const toggleOnline = asyncHandler(async (req: Request, res: Response) => {
  const partner = await deliveryService.toggleOnline(req.user!._id);
  sendResponse(res, 200, partner);
});

export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  const partner = await deliveryService.updateLocation(req.user!._id, req.body.coordinates);
  sendResponse(res, 200, partner);
});

export const getAvailableOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await deliveryService.getAvailableOrders(req.user!._id);
  sendResponse(res, 200, orders);
});

export const acceptOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await deliveryService.acceptOrder(req.user!._id, (req.params.orderId as string));
  sendResponse(res, 200, order, 'Order accepted');
});

export const completeDelivery = asyncHandler(async (req: Request, res: Response) => {
  const order = await deliveryService.completeDelivery(req.user!._id, (req.params.orderId as string));
  sendResponse(res, 200, order, 'Delivery completed');
});

export const getEarnings = asyncHandler(async (req: Request, res: Response) => {
  const earnings = await deliveryService.getEarnings(req.user!._id);
  sendResponse(res, 200, earnings);
});
