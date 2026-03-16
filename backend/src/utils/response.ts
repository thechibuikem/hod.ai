/**
 * response.ts - Standardized API response helpers
 * 
 * Instead of writing the same response format everywhere, we use these
 * helper functions to ensure consistent responses from all endpoints.
 * 
 * All responses follow this format:
 * - Success: { status: "success", ...data }
 * - Error:   { status: "error", code: "...", message: "..." }
 * 
 * This makes it easy for the frontend to handle responses consistently.
 */
import type { Response } from 'express';

/**
 * Send an error response
 * @param res - Express response object
 * @param status - HTTP status code (400, 401, 404, 500, etc.)
 * @param code - Machine-readable error code (e.g., "MISSING_QUESTION")
 * @param message - Human-readable error message
 */
export function sendError(res: Response, status: number, code: string, message: string) {
  res.status(status).json({ status: 'error', code, message });
}

/**
 * Send a success response
 * @param res - Express response object
 * @param status - HTTP status code (200, 201, etc.)
 * @param data - The data to send back
 */
export function sendSuccess(res: Response, status: number, data: object) {
  res.status(status).json({ status: 'success', ...data });
}