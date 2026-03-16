/**
 * preprocess.ts - Cleans and normalizes user input
 * 
 * Before searching the knowledge base, we clean the question to make
 * searching more effective. This does several things:
 * 
 * 1. Converts to lowercase ("What" becomes "what") - so we don't miss
 *    matches due to capitalization
 * 2. Removes special characters (!@#$%^&*) - keeps only letters and numbers
 * 3. Removes "stopwords" - common words like "the", "is", "a" that don't
 *    add meaning (e.g., "How do I graduate?" becomes "graduate")
 * 
 * This makes the search more accurate by focusing on the important words.
 * 
 * Example:
 *   Input: "What are the REQUIREMENTS to graduate???"
 *   Output: "requirements graduate"
 */

// Common English words that don't help with semantic search
const STOPWORDS = new Set([
  'a','an','the','is','it','in','on','of','to','and','or','for',
  'with','that','this','what','how','do','i','my','me','can','be',
  'are','was','will','have','has','at','by','from','about','which'
]);

/**
 * Clean and normalize a question for better search results
 * @param raw - The raw question from the user
 * @returns Cleaned version with stopwords removed
 */
export function preprocess(raw: string): string {
  return raw
    .toLowerCase()                    // Convert to lowercase
    .replace(/[^a-z0-9\s]/g, '')      // Remove special characters
    .split(' ')                       // Split into words
    .filter(word => word.length > 0 && !STOPWORDS.has(word))  // Remove empty/stopwords
    .join(' ')                        // Rejoin
    .trim();
}