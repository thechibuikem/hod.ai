import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { sendSuccess, sendError } from '../utils/response.ts';

const router = Router();
const FLAGS_PATH = './logs/flags.json';

router.post('/flag', (req, res) => {
  const { question, answer, reason } = req.body;

  if (!question || !answer || !reason) {
    return sendError(res, 400, 'MISSING_FIELD', 'question, answer, and reason are all required.');
  }

  const timestamp = new Date().toISOString();
  const flag_id = `flag_${timestamp.replace(/[-:.TZ]/g, '').slice(0, 15)}`;

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