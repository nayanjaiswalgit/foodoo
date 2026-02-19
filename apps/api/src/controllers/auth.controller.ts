import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse } from '../utils/index';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendResponse(res, 201, result, 'Registered successfully');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendResponse(res, 200, result, 'Logged in successfully');
});

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.sendOtp(req.body.phone);
  sendResponse(res, 200, result);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body.phone, req.body.otp);
  sendResponse(res, 200, result, 'OTP verified');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  sendResponse(res, 200, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!._id);
  sendResponse(res, 200, null, 'Logged out');
});
