import type { Response } from 'express';

export function sendError(res: Response, status: number, code: string, message: string) {
  res.status(status).json({ status: 'error', code, message });
}

export function sendSuccess(res: Response, status: number, data: object) {
  res.status(status).json({ status: 'success', ...data });
}