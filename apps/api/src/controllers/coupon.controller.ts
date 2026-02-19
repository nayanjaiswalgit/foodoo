import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse } from '../utils/index';
import * as couponService from '../services/coupon.service';

export const validate = asyncHandler(async (req: Request, res: Response) => {
  const result = await couponService.validateCoupon(req.body);
  sendResponse(res, 200, result);
});

export const getAvailable = asyncHandler(async (req: Request, res: Response) => {
  const coupons = await couponService.getAvailableCoupons(req.query.restaurant as string);
  sendResponse(res, 200, coupons);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.createCoupon(req.body);
  sendResponse(res, 201, coupon, 'Coupon created');
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.updateCoupon(req.params.id as string, req.body);
  sendResponse(res, 200, coupon, 'Coupon updated');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await couponService.deleteCoupon(req.params.id as string);
  sendResponse(res, 200, null, 'Coupon deleted');
});
