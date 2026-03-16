/**
 * chroma.ts - Interface to ChromaDB vector database
 * 
 * ChromaDB is a database that stores information as "embeddings" 
 * (long lists of numbers that represent the meaning of text).
 * 
 * This file:
 * - Connects to ChromaDB running on localhost:8000
 * - Provides methods to query the database (find similar questions)
 * - Checks if the database is healthy/connected
 * 
 * Think of it like a smart library - instead of searching by exact words,
 * it searches by MEANING. So if someone asks "how do I graduate?" it
 * will find "what are graduation requirements?" even though the words
 * are different.
 */
import { ChromaClient, type EmbeddingFunction } from "chromadb";
import type { IVectorDB, SearchResult } from "../utils/types.ts";

// A "do-nothing" embedder - we use Gemini for embeddings instead of ChromaDB's built-in one
class NoOpEmbedder implements EmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    return texts.map(() => []);
  }
}

export class ChromaDB implements IVectorDB {
  private client: ChromaClient;
  private collectionName: string;
  private embedder = new NoOpEmbedder();

  constructor() {
    // Connect to ChromaDB server (must be running separately)
    this.client = new ChromaClient({
      host: "localhost",
      port: 8000,
      ssl: false,
    });
    // Get collection name from environment variables
    this.collectionName = process.env.CHROMA_COLLECTION!;
  }

  /**
   * Query the vector database for similar questions
   * @param vector - The embedding (number list) representing the question
   * @param topK - How many results to return (default from env)
   * @returns Array of matching results with question, answer, category, and similarity score
   */
  async query(vector: number[], topK: number): Promise<SearchResult[]> {
    const collection = await this.client.getCollection({
      name: this.collectionName,
      embeddingFunction: this.embedder,
    });

    const results = await collection.query({
      queryEmbeddings: [vector],
      nResults: topK,
    });

    if (!results.ids?.[0]?.length) return [];

    const metadatas = results.metadatas?.[0] ?? [];
    const distances = results.distances?.[0] ?? [];

    // Convert ChromaDB results to our SearchResult format
    // Score is inverted (1 - distance) so higher = better match
    return results.ids[0].map((_, i) => {
      const meta = metadatas[i] ?? {};
      return {
        question: typeof meta.question === "string" ? meta.question : "Unknown",
        answer: typeof meta.answer === "string" ? meta.answer : "Unknown",
        category: typeof meta.category === "string" ? meta.category : "Unknown",
        score: 1 - (distances[i] ?? 0),
      };
    });
  }

  /**
   * Check if ChromaDB is connected and responding
   * @returns "connected" if healthy, "error" if not
   */
  async health(): Promise<"connected" | "error"> {
    try {
      await this.client.heartbeat();
      return "connected";
    } catch {
      return "error";
    }
  }
}
