import { type Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message = 'Success'
): void => {
  res.status(statusCode).json({ success: true, data, message });
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  { page, limit, total }: PaginationMeta,
  message = 'Success'
): void => {
  const totalPages = Math.ceil(total / limit);
  res.status(200).json({
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};
