/**
 * types.ts - Type definitions for the entire application
 * 
 * TypeScript uses "types" to describe the shape of data. This file
 * defines all the common data structures used across the app so that
 * everything stays consistent.
 * 
 * Think of these as blueprints or templates for data.
 */

/**
 * Represents a single entry from the knowledge base
 * Returned when searching for similar questions
 */
export interface SearchResult {
  question: string;   // The question from knowledge base
  answer:   string;    // The answer to that question
  category: string;    // Category (e.g., "Graduation", "Clearance")
  score:    number;    // Similarity score (0-1, higher = better match)
}

/**
 * Interface for the vector database
 * Any database implementation must provide these methods
 */
export interface IVectorDB {
  /**
   * Search for similar questions
   * @param vector - The question converted to numbers (embedding)
   * @param topK - How many results to return
   * @returns Array of matching results
   */
  query(vector: number[], topK: number): Promise<SearchResult[]>;
}

/**
 * Result returned after the full pipeline runs
 * Used internally but not exposed in the final API response
 */
export interface PipelineResult {
  answer:           string;      // The AI-generated answer
  sources:          SearchResult[]; // Which knowledge base entries were used
  response_time_ms: number;     // How long it took to generate
}