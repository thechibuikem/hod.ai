/**
 * flag.ts - Endpoint for students to report incorrect answers
 * 
 * Students can flag an answer if they think it's wrong or unhelpful.
 * This creates a record that the HOD can later review.
 * 
 * The flag includes:
 * - The question they asked
 * - The answer they received
 * - Why they think it's wrong (their reason)
 * - Timestamp for when it was flagged
 * 
 * This helps the HOD improve the knowledge base over time.
 * 
 * POST /api/v1/flag
 * Body: { "question": "...", "answer": "...", "reason": "..." }
 * Returns: { "status": "success", "flag_id": "flag_...", "message": "..." }
 */
import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { sendSuccess, sendError } from '../utils/response.ts';

const router = Router();
const FLAGS_PATH = './logs/flags.json';

/**
 * POST /api/v1/flag
 * Flag an answer as incorrect or unhelpful
 */
router.post('/flag', (req, res) => {
  const { question, answer, reason } = req.body;

  // Validate all required fields are present
  if (!question || !answer || !reason) {
    return sendError(res, 400, 'MISSING_FIELD', 'question, answer, and reason are all required.');
  }

  // Create a unique ID for this flag
  const timestamp = new Date().toISOString();
  const flag_id = `flag_${timestamp.replace(/[-:.TZ]/g, '').slice(0, 15)}`;

  // Read existing flags, add new one, save back to file
  const flags = existsSync(FLAGS_PATH)
    ? JSON.parse(readFileSync(FLAGS_PATH, 'utf-8'))
    : [];

  flags.push({ flag_id, question, answer, reason, timestamp });
  writeFileSync(FLAGS_PATH, JSON.stringify(flags, null, 2));

  return sendSuccess(res, 201, {
    message: 'Answer flagged successfully. The HOD will review it.',
    flag_id,
  });
});

export default router;