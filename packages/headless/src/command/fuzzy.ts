import type { CommandItem } from './types.js';

/**
 * High-speed, zero-dependency fuzzy text scoring.
 * Scores matches higher if characters match consecutively or at word boundaries.
 */
export function fuzzyFilter(items: CommandItem[], query: string): CommandItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return items;

  return items
    .map((item) => ({ item, score: scoreMatch(item.title.toLowerCase(), trimmed) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

function scoreMatch(text: string, query: string): number {
  let score = 0;
  let textIndex = 0;
  let prevMatched = false;

  for (let q = 0; q < query.length; q++) {
    const qChar = query[q];
    if (!qChar) continue;

    const foundIndex = text.indexOf(qChar, textIndex);
    if (foundIndex === -1) {
      return 0; // Subsequence not found
    }

    if (foundIndex === 0 || text[foundIndex - 1] === ' ' || text[foundIndex - 1] === '/') {
      score += 3; // Word boundary bonus
    } else if (prevMatched && foundIndex === textIndex) {
      score += 2; // Consecutive match bonus
    } else {
      score += 1;
    }

    prevMatched = true;
    textIndex = foundIndex + 1;
  }

  return score;
}
