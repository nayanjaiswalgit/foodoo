import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse } from '../utils/index';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookie';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendResponse(res, 201, result, 'Registered successfully');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendResponse(res, 200, result, 'Logged in successfully');
});

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.sendOtp(req.body.phone);
  sendResponse(res, 200, result);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyOtp(req.body.phone, req.body.otp);
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendResponse(res, 200, result, 'OTP verified');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) {
    sendResponse(res, 401, null, 'Refresh token is required');
    return;
  }
  const result = await authService.refreshToken(token);
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  sendResponse(res, 200, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!._id);
  clearRefreshTokenCookie(res);
  sendResponse(res, 200, null, 'Logged out');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  sendResponse(res, 200, null, 'If that email is registered, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  sendResponse(res, 200, null, 'Password reset successfully');
});
