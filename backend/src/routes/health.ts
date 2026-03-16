import { Router }  from 'express';
import { ChromaDB } from '../vectordb/chroma.ts';
import { sendSuccess } from '../utils/response.ts';

const router = Router();
const db = new ChromaDB();

router.get('/health', async (_req, res) => {
  const vector_db = await db.health();
  sendSuccess(res, 200, {
    vector_db,
    timestamp: new Date().toISOString(),
  });
});

export default router;