/**
 * ingest.ts - Loads the knowledge base into ChromaDB
 * 
 * This is a one-time (or admin-only) operation that:
 * 1. Reads all questions & answers from knowledge_base.json
 * 2. Creates embeddings for each entry (converts text to numbers)
 * 3. Stores everything in ChromaDB for fast searching
 * 
 * This process is called "ingestion" - it's like indexing a book so
 * you can find things quickly. Without this, the system can't search!
 * 
 * The process:
 * - Deletes any existing collection (fresh start)
 * - Creates a new collection in ChromaDB
 * - Processes entries in batches (20 at a time) to avoid overwhelming the API
 * - Pauses between batches to be nice to the API
 * 
 * @returns How many entries were inserted vs skipped
 */
import { ChromaClient, type EmbeddingFunction } from "chromadb";
import { embed } from "../pipeline/embed.ts";
import { loadKnowledgeBase } from "../utils/loader.ts";
import "dotenv/config";
import {} from "chromadb";

// Tell ChromaDB we are handling embeddings ourselves (we use Gemini)
class NoOpEmbedder implements EmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    return texts.map(() => []);
  }
}

const BATCH_SIZE = 20;
// Small delay between batches to avoid rate limiting
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Load and embed all knowledge base entries into ChromaDB
 * @returns Object with count of inserted and skipped entries
 */
export async function ingestKnowledgeBase(): Promise<{
  inserted: number;
  skipped: number;
}> {
  // Connect to ChromaDB
  const client = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false,
  });
  const name = process.env.CHROMA_COLLECTION!;
  
  // Load knowledge base from JSON file
  const entries = loadKnowledgeBase();
  const embedder = new NoOpEmbedder();

  // Delete existing collection to start fresh
  // (so we don't have duplicates if we run this again)
  try {
    await client.deleteCollection({ name });
    console.log("Deleted existing collection.");
  } catch {
    console.log("No existing collection found, creating fresh.");
  }

  // Create a new collection for our data
  const collection = await client.createCollection({
    name,
    embeddingFunction: embedder,
  });

  let inserted = 0;
  let skipped = 0;

  // Process entries in batches
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    for (const entry of batch) {
      try {
        // Create embedding from answer + category
        const textToEmbed = `${entry.answer} ${entry.category}`;
        const vector = await embed(textToEmbed);

        // Add to ChromaDB with metadata
        await collection.add({
          ids: [`entry_${inserted}`],
          embeddings: [vector],
          metadatas: [
            {
              question: entry.question,
              answer: entry.answer,
              category: entry.category,
            },
          ],
          documents: [entry.answer],
        });

        inserted++;
        console.log(
          `Embedded ${inserted}/${entries.length}: ${entry.category}`,
        );
      } catch (err) {
        console.warn("Skipping entry due to error:", err);
        skipped++;
      }
    }

    // Pause between batches to avoid overwhelming the API
    if (i + BATCH_SIZE < entries.length) {
      console.log("Pausing between batches...");
      await sleep(1000);
    }
  }

  console.log(
    `\nIngestion complete. Inserted: ${inserted}, Skipped: ${skipped}`,
  );
  return { inserted, skipped };
}

