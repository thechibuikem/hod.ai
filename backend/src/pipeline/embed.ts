/**
 * embed.ts - Converts text into number vectors (embeddings)
 * 
 * Computers can't "understand" text directly - they work with numbers.
 * This file uses Google's Gemini model to convert any text (questions,
 * answers, etc.) into a list of numbers called an "embedding" or "vector".
 * 
 * These numbers represent the MEANING of the text. Two similar questions
 * will have similar numbers, even if they use completely different words.
 * 
 * Example:
 * - "How do I graduate?" might become [0.1, -0.3, 0.5, ...]
 * - "What are graduation requirements?" becomes [0.12, -0.28, 0.48, ...]
 * - These are very close numbers, so a computer knows they're related!
 */
import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

// Gets or creates the Gemini AI client (singleton pattern)
function getClient(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return ai;
}

/**
 * Converts text into a vector (list of numbers)
 * @param text - The text to convert (e.g., a user's question)
 * @returns A list of numbers representing the text's meaning
 */
export async function embed(text: string): Promise<number[]> {
  try {
    const response = await getClient().models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
      throw new Error('Empty embedding returned from Gemini');
    }

    return embedding;
  } catch (err) {
    console.error('Embedding failed:', err);
    throw new Error('EMBEDDING_FAILED');
  }
}