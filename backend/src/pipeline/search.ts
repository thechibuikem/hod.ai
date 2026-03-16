/**
 * search.ts - Finds relevant information from the knowledge base
 * 
 * This is the "Search Engine" of the system. It:
 * - Takes a question (converted to numbers/vector)
 * - Asks ChromaDB to find the most similar questions in the knowledge base
 * - Returns both the matching results AND a combined "context" string
 * 
 * The "context" is all the relevant Q&A pairs joined together, which gets
 * passed to the AI to generate the final answer. It's like giving the AI
 * a cheat sheet of relevant information to reference.
 * 
 * @param db - The vector database interface
 * @param vector - The embedded question (numbers)
 * @param topK - How many results to return (usually 3)
 * @returns The matching sources and a combined context string
 */
import type { IVectorDB, SearchResult } from '../utils/types.ts';

export async function searchAndRetrieve(
  db: IVectorDB,
  vector: number[],
  topK: number
): Promise<{ sources: SearchResult[]; context: string }> {

  // Ask the vector database for the top K most similar questions
  const results = await db.query(vector, topK);

  if (results.length === 0) {
    throw new Error('NO_RESULTS');
  }

  // Combine all the Q&A pairs into one big context string
  // This gets sent to the AI to generate the answer
  const context = results
    .map(r => `Q: ${r.question}\nA: ${r.answer}`)
    .join('\n\n');

  return { sources: results, context };
}