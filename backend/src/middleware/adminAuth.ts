import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.ts';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-admin-key'];

  if (!key || key !== process.env.ADMIN_API_KEY) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or missing X-Admin-Key header.');
  }

  next();
}