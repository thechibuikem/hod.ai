/**
 * ask.ts - Main Q&A endpoint
 * 
 * This is the CORE endpoint where students ask questions. It orchestrates
 * the entire RAG (Retrieval-Augmented Generation) pipeline:
 * 
 * 1. VALIDATE - Check that a question was provided
 * 2. PREPROCESS - Clean the question (remove stopwords, etc.)
 * 3. EMBED - Convert question to numbers using Gemini
 * 4. SEARCH - Find similar questions in ChromaDB
 * 5. GENERATE - Use AI to create an answer from the retrieved context
 * 6. RESPOND - Send the answer back to the student
 * 
 * It also measures how long the whole process takes (response_time_ms)
 * to help monitor performance.
 * 
 * POST /api/v1/ask
 * Body: { "question": "What are graduation requirements?" }
 * Returns: { "status": "success", "answer": "...", "sources": [...], "response_time_ms": 843 }
 */
import { Router }            from 'express';
import { preprocess }        from '../pipeline/preprocess.ts';
import { embed }             from '../pipeline/embed.ts';
import { searchAndRetrieve } from '../pipeline/search.ts';
import { generate, GenerationError } from '../pipeline/generate.ts';
import { sendSuccess, sendError } from '../utils/response.ts';
import type { IVectorDB }    from '../utils/types.ts';

const router = Router();

// Store the vector DB instance (set by server.ts)
let vectorDB: IVectorDB | null = null;

// Allow server.ts to pass us the vector DB
export function setVectorDB(db: IVectorDB) {
  vectorDB = db;
}

/**
 * POST /api/v1/ask
 * Ask a question and get an AI-generated answer
 */
router.post('/ask', async (req, res) => {
  const { question } = req.body;

  // Step 1: Validate input
  if (!question || typeof question !== 'string' || question.trim() === '') {
    return sendError(res, 400, 'MISSING_QUESTION', 'question field is required.');
  }

  if (!vectorDB) {
    return sendError(res, 503, 'DB_NOT_READY', 'Vector database is not configured yet.');
  }

  const start = Date.now(); // Start timing

  try {
    // Step 2: Preprocess the question (clean it)
    const Qp             = preprocess(question);
    // Step 3: Convert to embedding (numbers)
    const Qpe            = await embed(Qp);
    // Step 4: Search the knowledge base
    const topK           = parseInt(process.env.TOP_K_RESULTS ?? '3');
    const { sources, context } = await searchAndRetrieve(vectorDB, Qpe, topK);
    // Step 5: Generate answer using AI
    const answer         = await generate(question, context);
    // Calculate how long it took
    const response_time_ms = Date.now() - start;

    return sendSuccess(res, 200, { answer, sources, response_time_ms });

  } catch (err: unknown) {
    // Handle GenerationError with specific error codes
    if (err instanceof GenerationError) {
      console.error(`[ask] GenerationError: ${err.code} - ${err.message}`);

      switch (err.code) {
        case 'RATE_LIMIT_EXCEEDED':
          // Return 429 with retry information
          return sendError(res, 429, 'RATE_LIMIT_EXCEEDED', err.message);

        case 'API_KEY_INVALID':
          // Return 500 for configuration errors
          return sendError(res, 500, 'API_KEY_INVALID', err.message);

        case 'LLM_EMPTY_RESPONSE':
          return sendError(res, 500, 'LLM_EMPTY_RESPONSE', err.message);

        case 'LLM_TIMEOUT':
          return sendError(res, 504, 'LLM_TIMEOUT', err.message);

        case 'LLM_FAILED':
        default:
          return sendError(res, 500, 'LLM_FAILED', err.message);
      }
    }

    // Handle other error types
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ask] Unexpected error:', message);

    // Handle specific error types with helpful messages
    if (message === 'EMBEDDING_FAILED') return sendError(res, 500, 'EMBEDDING_FAILED', 'Failed to process your question.');
    if (message === 'NO_RESULTS')       return sendError(res, 404, 'NO_RESULTS', 'No relevant information found. Please contact the HOD directly.');

    return sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  }
});

export default router;