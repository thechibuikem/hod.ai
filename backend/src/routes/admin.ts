import { Router }            from 'express';
import { readFileSync, existsSync } from 'fs';
import { adminAuth }         from '../middleware/adminAuth.ts';
import { ingestKnowledgeBase } from '../vectordb/ingest.ts';
import { sendSuccess, sendError } from '../utils/response.ts';

const router = Router();
const FLAGS_PATH = '../../logs/flags.json';

// POST /api/v1/admin/ingest
router.post('/admin/ingest', adminAuth, async (_req, res) => {
  try {
    const { inserted, skipped } = await ingestKnowledgeBase();
    return sendSuccess(res, 200, {
      message: 'Knowledge base ingested successfully.',
      records_inserted: inserted,
      records_skipped:  skipped,
    });
  } catch (err) {
    console.error('Ingestion error:', err);
    return sendError(res, 500, 'INGESTION_FAILED', 'Failed to ingest knowledge base.');
  }
});

// GET /api/v1/admin/flags
router.get('/admin/flags', adminAuth, (_req, res) => {
  const flags = existsSync(FLAGS_PATH)
    ? JSON.parse(readFileSync(FLAGS_PATH, 'utf-8'))
    : [];

  return sendSuccess(res, 200, { count: flags.length, flags });
});

export default router;