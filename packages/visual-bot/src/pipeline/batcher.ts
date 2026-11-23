/**
 * @fileoverview Crypto-Entropic Shuffler & Diversity-Stratified Batcher.
 * Ensures diverse category/world coverage and prevents adjacent same-format repeats.
 */

export function cryptoRandom(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return (buf[0] ?? 0) / 0x100000000;
  }
  return Math.random();
}

/**
 * Fisher-Yates shuffle backed by Web Crypto RNG (or an injected RNG for tests).
 */
export function cryptoShuffle<T>(items: readonly T[], rng: () => number = cryptoRandom): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export interface StratifyBatchOptions<T> {
  batchSize?: number;
  getCategory: (item: T) => string;
  getGroup?: (item: T) => string;
  avoidAdjacentCategory?: boolean;
  rng?: () => number;
}

/**
 * Selects a diverse batch across categories & unique groups, then arranges items
 * to avoid back-to-back items from the same category whenever possible.
 */
export function stratifyBatch<T>(items: readonly T[], options: StratifyBatchOptions<T>): T[] {
  const batchSize = Math.max(1, options.batchSize ?? 8);
  const avoidAdjacent = options.avoidAdjacentCategory ?? true;
  const rng = options.rng ?? cryptoRandom;

  const shuffled = cryptoShuffle(items, rng);
  const buckets = new Map<string, T[]>();
  for (const item of shuffled) {
    const cat = options.getCategory(item) || 'default';
    let list = buckets.get(cat);
    if (!list) {
      list = [];
      buckets.set(cat, list);
    }
    list.push(item);
  }

  const picked: T[] = [];
  const usedGroups = new Set<string>();
  const categoryOrder = cryptoShuffle(Array.from(buckets.keys()), rng);

  // Pass 1: Round-robin across categories while preferring unique groups
  let progress = true;
  while (picked.length < batchSize && progress) {
    progress = false;
    for (const cat of categoryOrder) {
      if (picked.length >= batchSize) break;
      const list = buckets.get(cat);
      if (!list || list.length === 0) continue;

      let chosenIdx = 0;
      if (options.getGroup) {
        const uniqueIdx = list.findIndex((item) => !usedGroups.has(options.getGroup!(item)));
        if (uniqueIdx >= 0) chosenIdx = uniqueIdx;
      }

      const [chosen] = list.splice(chosenIdx, 1);
      if (chosen !== undefined) {
        picked.push(chosen);
        if (options.getGroup) usedGroups.add(options.getGroup(chosen));
        progress = true;
      }
    }
  }

  if (!avoidAdjacent || picked.length <= 2) return picked;

  // Pass 2: Greedy de-clumping so adjacent items have distinct categories
  const ordered: T[] = [];
  const pool = picked.slice();
  while (pool.length > 0) {
    const prevCat = ordered.length > 0 ? options.getCategory(ordered[ordered.length - 1]!) : '';
    const nextIdx = pool.findIndex((item) => options.getCategory(item) !== prevCat);
    const [next] = pool.splice(nextIdx >= 0 ? nextIdx : 0, 1);
    if (next !== undefined) ordered.push(next);
  }
  return ordered;
}
