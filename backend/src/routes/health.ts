import { Router } from 'express';
import { sendSuccess } from '../utils/response.ts';

const router = Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, 200, {
    vector_db: 'not configured',
    timestamp: new Date().toISOString(),
  });
});

export default router;