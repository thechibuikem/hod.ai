import { ChromaClient, type EmbeddingFunction } from "chromadb";
import type { IVectorDB, SearchResult } from "../utils/types.ts";

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
    this.client = new ChromaClient({
      host: "localhost",
      port: 8000,
      ssl: false,
    });
    this.collectionName = process.env.CHROMA_COLLECTION!;
  }

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

  async health(): Promise<"connected" | "error"> {
    try {
      await this.client.heartbeat();
      return "connected";
    } catch {
      return "error";
    }
  }
}
