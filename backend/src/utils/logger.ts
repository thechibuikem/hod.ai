/**
 * logger.ts - Records all questions asked to the system
 * 
 * Every time a student asks a question, we save a log entry.
 * This helps the HOD:
 * - See what students are asking most often
 * - Track which questions need better answers
 * - Monitor system performance over time
 * 
 * The log includes:
 * - The question asked
 * - The answer given
 * - Sources used (which knowledge base entries)
 * - How long it took to respond
 * - (Future: accuracy and relevance scores - currently null)
 * 
 * Log is stored in: logs/query_log.json
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { SearchResult } from './types.ts';

interface QueryLogEntry {
  id:               string;
  timestamp:        string;
  question:         string;
  answer:           string;
  sources:          SearchResult[];
  response_time_ms: number;
  accuracy_score:   null;  // Placeholder for future use
  relevance_score:  null; // Placeholder for future use
}

const LOG_PATH = '../../logs/query_log.json';

/**
 * Log a question and its answer to the log file
 * @param question - The student's question
 * @param answer - The AI-generated answer
 * @param sources - Which knowledge base entries were used
 * @param response_time_ms - How long the system took to respond
 */
export function logQuery(
  question: string,
  answer: string,
  sources: SearchResult[],
  response_time_ms: number
): void {
  const timestamp = new Date().toISOString();
  const id        = `log_${timestamp.replace(/[-:.TZ]/g, '').slice(0, 15)}`;

  const entry: QueryLogEntry = {
    id, timestamp, question, answer, sources,
    response_time_ms,
    accuracy_score:  null,
    relevance_score: null,
  };

  // Read existing logs, add new entry, save back
  const existing: QueryLogEntry[] = existsSync(LOG_PATH)
    ? JSON.parse(readFileSync(LOG_PATH, 'utf-8'))
    : [];

  existing.push(entry);
  writeFileSync(LOG_PATH, JSON.stringify(existing, null, 2));
}