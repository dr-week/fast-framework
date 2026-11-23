/**
 * @fileoverview Sliding-Window Safety Quota Guard.
 * Prevents runaway automation loops and ban-triggering action bursts.
 */

import { signal, type Signal } from '@zuari/signals';

export interface QuotaGuardOptions {
  maxPerWindow?: number;
  windowMs?: number;
  now?: () => number;
}

export interface QuotaGuard {
  used: Signal<number>;
  remaining: Signal<number>;
  canRun: () => boolean;
  assertCanRun: () => void;
  record: () => number;
  reset: () => void;
}

export function createQuotaGuard(options: QuotaGuardOptions = {}): QuotaGuard {
  const maxPerWindow = Math.max(1, options.maxPerWindow ?? 30);
  const windowMs = Math.max(100, options.windowMs ?? 3_600_000);
  const now = options.now ?? (() => Date.now());

  let timestamps: number[] = [];
  const used = signal(0);
  const remaining = signal(maxPerWindow);

  function prune(): void {
    const cutoff = now() - windowMs;
    timestamps = timestamps.filter((t) => t > cutoff);
    used.value = timestamps.length;
    remaining.value = Math.max(0, maxPerWindow - timestamps.length);
  }

  function canRun(): boolean {
    prune();
    return timestamps.length < maxPerWindow;
  }

  function assertCanRun(): void {
    if (!canRun()) {
      throw new Error(
        `Safety Quota Exceeded: max ${maxPerWindow} actions per ${Math.round(windowMs / 1000)}s window.`
      );
    }
  }

  function record(): number {
    assertCanRun();
    timestamps.push(now());
    used.value = timestamps.length;
    remaining.value = Math.max(0, maxPerWindow - timestamps.length);
    return timestamps.length;
  }

  function reset(): void {
    timestamps = [];
    used.value = 0;
    remaining.value = maxPerWindow;
  }

  return { used, remaining, canRun, assertCanRun, record, reset };
}
