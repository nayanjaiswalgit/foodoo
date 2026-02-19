import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse } from '../utils/index';
import * as addressService from '../services/address.service';

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await addressService.getUserAddresses(req.user!._id);
  sendResponse(res, 200, addresses);
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.createAddress(req.user!._id, req.body);
  sendResponse(res, 201, address, 'Address created');
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.updateAddress(req.user!._id, req.params.id!, req.body);
  sendResponse(res, 200, address, 'Address updated');
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  await addressService.deleteAddress(req.user!._id, req.params.id!);
  sendResponse(res, 200, null, 'Address deleted');
});

export const setDefault = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.setDefault(req.user!._id, req.params.id!);
  sendResponse(res, 200, address, 'Default address set');
});
