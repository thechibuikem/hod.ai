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
    console.error('Generation failed:', err);
    throw new Error('LLM_FAILED');
  }
}