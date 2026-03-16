/**
 * adminAuth.ts - Protects admin endpoints from unauthorized access
 * 
 * This is "middleware" - code that runs before certain routes.
 * It checks that the request includes a valid admin API key.
 * 
 * Without this, anyone could:
 * - Modify the knowledge base
 * - See all flagged answers
 * 
 * The key must be sent in the header: X-Admin-Key
 * It must match the ADMIN_API_KEY in the .env file
 */
import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.ts';

/**
 * Middleware that protects admin routes
 * Checks for valid X-Admin-Key header
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  // Get the API key from the request header
  const key = req.headers['x-admin-key'];

  // Check if key exists and matches the environment variable
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or missing X-Admin-Key header.');
  }

  // Key is valid - continue to the actual route handler
  next();
}