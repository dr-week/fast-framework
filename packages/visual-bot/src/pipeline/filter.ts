/**
 * @fileoverview Composable Ingestion Quality Filter & Deduplicator.
 * Scores incoming feed/content items, rejects blocklisted noise, deduplicates
 * against DedupeMemory, and ranks surviving candidates.
 */

import type { DedupeMemory } from '../memory/dedupe.js';

export interface ScoredCandidate<T> {
  item: T;
  score: number;
  matchedBoosts: number;
}

export interface ItemFilterOptions<T> {
  getText: (item: T) => string;
  getKey?: (item: T) => string;
  blockPatterns?: RegExp[];
  boostPatterns?: Array<{ pattern: RegExp; weight: number }>;
  baseScore?: number;
  minScore?: number;
  dedupeMemory?: DedupeMemory;
}

export interface ItemFilter<T> {
  evaluate: (item: T) => { accepted: boolean; score: number; reason?: string };
  filterAndRank: (items: readonly T[], limit?: number) => ScoredCandidate<T>[];
}

export function createItemFilter<T>(options: ItemFilterOptions<T>): ItemFilter<T> {
  const blockPatterns = options.blockPatterns ?? [];
  const boostPatterns = options.boostPatterns ?? [];
  const baseScore = options.baseScore ?? 50;
  const minScore = options.minScore ?? 40;
  const getKey = options.getKey ?? options.getText;

  function evaluate(item: T): { accepted: boolean; score: number; reason?: string } {
    const text = (options.getText(item) || '').trim();
    if (!text) return { accepted: false, score: 0, reason: 'empty' };

    const key = getKey(item);
    if (options.dedupeMemory?.has(key)) {
      return { accepted: false, score: 0, reason: 'duplicate' };
    }

    for (const re of blockPatterns) {
      if (re.test(text)) {
        return { accepted: false, score: 0, reason: 'blocked' };
      }
    }

    let score = baseScore;
    for (const { pattern, weight } of boostPatterns) {
      if (pattern.test(text)) score += weight;
    }

    if (score < minScore) {
      return { accepted: false, score, reason: 'below_min_score' };
    }
    return { accepted: true, score };
  }

  function filterAndRank(items: readonly T[], limit?: number): ScoredCandidate<T>[] {
    const accepted: ScoredCandidate<T>[] = [];
    const seenInBatch = new Set<string>();

    for (const item of items) {
      const normKey = getKey(item).trim().toLowerCase();
      if (!normKey || seenInBatch.has(normKey)) continue;

      const res = evaluate(item);
      if (!res.accepted) continue;

      seenInBatch.add(normKey);
      const text = options.getText(item);
      let matchedBoosts = 0;
      for (const { pattern } of boostPatterns) {
        if (pattern.test(text)) matchedBoosts++;
      }
      accepted.push({ item, score: res.score, matchedBoosts });
    }

    accepted.sort((a, b) => b.score - a.score || b.matchedBoosts - a.matchedBoosts);
    return typeof limit === 'number' ? accepted.slice(0, Math.max(0, limit)) : accepted;
  }

  return { evaluate, filterAndRank };
}
