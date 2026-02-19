import { type Request, type Response } from 'express';
import { asyncHandler, sendResponse } from '../utils/index';
import { ApiError } from '../utils/api-error';
import * as uploadService from '../services/upload.service';

const ALLOWED_FOLDERS = ['restaurants', 'menu', 'avatars', 'general'] as const;

export const uploadSingle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file provided');
  const folder = (req.query.folder as string) || 'general';
  if (!ALLOWED_FOLDERS.includes(folder as (typeof ALLOWED_FOLDERS)[number])) {
    throw ApiError.badRequest(`Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}`);
  }
  const url = await uploadService.uploadImage(req.file, folder);
  sendResponse(res, 200, { url }, 'Image uploaded');
});

export const uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw ApiError.badRequest('No files provided');
  }
  const folder = (req.query.folder as string) || 'general';
  if (!ALLOWED_FOLDERS.includes(folder as (typeof ALLOWED_FOLDERS)[number])) {
    throw ApiError.badRequest(`Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(', ')}`);
  }
  const urls = await uploadService.uploadMultiple(req.files, folder);
  sendResponse(res, 200, { urls }, 'Images uploaded');
});
