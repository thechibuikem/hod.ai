/**
 * loader.ts - Reads and validates the knowledge base JSON file
 * 
 * This file loads the knowledge base (questions & answers) from the
 * JSON file and validates that each entry has the required fields.
 * 
 * It ensures data quality by:
 * - Skipping entries that are missing question, answer, or category
 * - Warning about malformed entries
 * - Only returning valid entries
 * 
 * @returns Array of validated knowledge base entries
 */
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Shape of a single entry in the knowledge base
 */
export interface KnowledgeEntry {
  question: string;   // The question students might ask
  answer:   string;   // The answer to that question
  category: string;   // Grouping (e.g., "Graduation", "Clearance")
}

/**
 * Load and validate knowledge base from JSON file
 * @param path - Optional custom path to the JSON file
 * @returns Array of valid KnowledgeEntry objects
 */
export function loadKnowledgeBase(
  path = join(process.cwd(), 'data', 'knowledge_base.json')
): KnowledgeEntry[] {
  // Read the raw JSON file
  const raw = readFileSync(path, 'utf-8');
  const parsed = JSON.parse(raw) as unknown[];

  const valid: KnowledgeEntry[] = [];

  // Validate each entry - only keep entries with all required fields
  for (const entry of parsed) {
    if (
      typeof entry === 'object' && entry !== null &&
      'question' in entry && typeof (entry as any).question === 'string' &&
      'answer'   in entry && typeof (entry as any).answer   === 'string' &&
      'category' in entry && typeof (entry as any).category === 'string'
    ) {
      valid.push(entry as KnowledgeEntry);
    } else {
      console.warn('Skipping malformed entry:', entry);
    }
  }

  console.log(`Loaded ${valid.length} knowledge base entries.`);
  return valid;
}