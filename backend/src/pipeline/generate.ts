/**
 * generate.ts - Uses AI to generate answers from retrieved context
 * 
 * This is the "AI Brain" of the system. It:
 * - Takes a user's question and relevant context (from the search)
 * - Sends them to Gemini (Google's AI model)
 * - Returns a human-readable answer
 * 
 * The SYSTEM_PROMPT tells the AI to only use the provided context,
 * never to make up answers. If it can't find the answer, it should
 * say "I don't have that information. Please contact the HOD directly."
 * 
 * This prevents the AI from "hallucinating" - making up false information.
 */
import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

// Gets or creates the Gemini AI client (singleton pattern)
// This reuses the same connection instead of creating new ones
function getClient(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return ai;
}

// This is the "persona" of the AI - it tells the AI how to behave
const SYSTEM_PROMPT = `You are an academic assistant for the Department of Computer Science,
Nnamdi Azikiwe University. Answer student questions ONLY using the context provided below.
If the answer is not in the context, say: "I don't have that information. Please contact the HOD directly."
Do not guess or invent information.`;

// Custom error class to preserve error details
export class GenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

/**
 * Parses Gemini API errors and returns structured error info
 */
function parseGeminiError(err: unknown): GenerationError {
  // Handle string errors
  if (typeof err === 'string') {
    return new GenerationError(err, 'LLM_FAILED');
  }

  // Handle Error objects
  if (err instanceof Error) {
    const message = err.message ?? '';

    // Check for rate limit errors (429)
    if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
      // Try to extract retry delay from the error message
      const delayMatch = message.match(/retry in ([\d.]+)s/i);
      const retryAfter = delayMatch?.[1] ? Math.ceil(parseFloat(delayMatch[1])) : 60;
      return new GenerationError(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        'RATE_LIMIT_EXCEEDED',
        retryAfter
      );
    }

    // Check for API key issues
    if (message.includes('API_KEY') || message.includes('permission') || message.includes('PERMISSION_DENIED')) {
      return new GenerationError(
        'AI service configuration error. Please contact the administrator.',
        'API_KEY_INVALID'
      );
    }

    // Check for empty response
    if (message.includes('Empty response')) {
      return new GenerationError(
        'The AI returned an empty response. Please try again.',
        'LLM_EMPTY_RESPONSE'
      );
    }

    // Check for timeout
    if (message.includes('timeout') || message.includes('TIMEOUT')) {
      return new GenerationError(
        'The request timed out. Please try again.',
        'LLM_TIMEOUT'
      );
    }

    // Generic error
    console.error('Unhandled Gemini error:', message);
    return new GenerationError(
      'Failed to generate a response. Please try again.',
      'LLM_FAILED'
    );
  }

  // Unknown error type
  console.error('Unknown error type:', err);
  return new GenerationError(
    'An unexpected error occurred.',
    'LLM_FAILED'
  );
}

/**
 * Generates an answer using Gemini AI
 * @param question - The student's question
 * @param context - Relevant information retrieved from the knowledge base
 * @returns A generated text answer
 */
export async function generate(question: string, context: string): Promise<string> {
  try {
    const response = await getClient().models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `CONTEXT:\n${context}\n\nQUESTION:\n${question}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 400,
        temperature: 0.2,
      },
    });

    const content = response.text;

    if (!content || content.trim() === '') {
      throw new Error('Empty response returned from Gemini');
    }

    return content;
  } catch (err) {
    const genError = parseGeminiError(err);
    console.error('Generation failed:', genError.message, '- Code:', genError.code);
    throw genError;
  }
}