/**
 * @fileoverview Weighted Taste DNA & Outcome Feedback Engine.
 * Ranks winning tags/dimensions from votes and real-world outcomes (e.g. viral 5x,
 * good 2x, flop -3x) and synthesizes a compact LLM prompt steering summary.
 */

export type OutcomeRating = 'viral' | 'good' | 'flop' | 'neutral';
export type VoteDirection = 'up' | 'down';

export interface FeedbackRecord {
  tags: Record<string, string>;
  vote?: VoteDirection;
  outcome?: OutcomeRating;
  completed?: boolean;
}

export interface TasteProfileWeights {
  viral?: number;
  good?: number;
  flop?: number;
  completed?: number;
  saved?: number;
  voteUp?: number;
  voteDown?: number;
}

export interface TasteProfile {
  topByDimension: Record<string, string[]>;
  avoidTags: string[];
  viralCount: number;
  promptSummary: string;
}

function rankMap(map: Map<string, number>, limit: number): string[] {
  return Array.from(map.entries())
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

/**
 * Computes a multi-dimensional preference profile from historical feedback records.
 */
export function computeTasteProfile(
  records: FeedbackRecord[],
  options: { limitPerDimension?: number; weights?: TasteProfileWeights } = {}
): TasteProfile {
  const limit = options.limitPerDimension ?? 4;
  const w = {
    viral: options.weights?.viral ?? 10,
    good: options.weights?.good ?? 4,
    flop: options.weights?.flop ?? -6,
    completed: options.weights?.completed ?? 3,
    saved: options.weights?.saved ?? 2,
    voteUp: options.weights?.voteUp ?? 1,
    voteDown: options.weights?.voteDown ?? -1,
  };

  const dims = new Map<string, Map<string, number>>();
  const dislikes = new Map<string, number>();
  let viralCount = 0;

  for (const rec of records) {
    let delta = 0;
    if (rec.outcome === 'viral') {
      delta = w.viral;
      viralCount++;
    } else if (rec.outcome === 'good') {
      delta = w.good;
    } else if (rec.outcome === 'flop') {
      delta = w.flop;
    } else if (rec.vote === 'up') {
      delta = w.voteUp;
    } else if (rec.vote === 'down') {
      delta = w.voteDown;
    } else {
      delta = rec.completed ? w.completed : w.saved;
    }

    for (const [dim, val] of Object.entries(rec.tags)) {
      if (!val) continue;
      let scores = dims.get(dim);
      if (!scores) {
        scores = new Map<string, number>();
        dims.set(dim, scores);
      }
      scores.set(val, (scores.get(val) ?? 0) + delta);

      if (rec.outcome === 'flop' || rec.vote === 'down') {
        const penalty = rec.outcome === 'flop' ? 4 : 1;
        dislikes.set(val, (dislikes.get(val) ?? 0) + penalty);
      }
    }
  }

  const topByDimension: Record<string, string[]> = {};
  const summaryParts: string[] = [];

  for (const [dim, scores] of dims.entries()) {
    const top = rankMap(scores, limit);
    topByDimension[dim] = top;
    if (top.length > 0) {
      summaryParts.push(`Top ${dim}: ${top.join(', ')}`);
    }
  }

  const avoidTags = rankMap(dislikes, limit);
  if (avoidTags.length > 0) {
    summaryParts.push(`Avoid: ${avoidTags.join(', ')}`);
  }

  return {
    topByDimension,
    avoidTags,
    viralCount,
    promptSummary: summaryParts.join(' | '),
  };
}
