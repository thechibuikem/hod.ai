import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { SearchResult } from './types.ts';

interface QueryLogEntry {
  id:               string;
  timestamp:        string;
  question:         string;
  answer:           string;
  sources:          SearchResult[];
  response_time_ms: number;
  accuracy_score:   null;
  relevance_score:  null;
}

const LOG_PATH = '../../logs/query_log.json';

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

  const existing: QueryLogEntry[] = existsSync(LOG_PATH)
    ? JSON.parse(readFileSync(LOG_PATH, 'utf-8'))
    : [];

  existing.push(entry);
  writeFileSync(LOG_PATH, JSON.stringify(existing, null, 2));
}