/**
 * @fileoverview System 1 Intuitive Fast-Reflex Engine.
 * Sub-millisecond predictive heuristics evaluating input trajectory and gaze velocity.
 */

import { signal, computed, type Signal, type Computed } from '@zuari/signals';
import { FastLogRingBuffer } from '../telemetry/fast-log.js';
import type { SystemOneConfig, SystemOneController, FastLogRecord, IntentVector } from '../types.js';

export function createSystemOne(config: SystemOneConfig = {}): SystemOneController {
  const ringBufferSize = config.ringBufferSize ?? 2048;
  const intentThreshold = config.intentThreshold ?? 0.75;
  const ring = new FastLogRingBuffer(ringBufferSize);

  const active = signal<boolean>(true);
  const latestLog = signal<FastLogRecord | null>(null);
  const predictedIntent = signal<IntentVector | null>(null);
  const logCount = computed<number>(() => ring.count);

  const reflexMap = new Map<number, Array<(val: number) => IntentVector | null>>();
  const speculativeCache = new Map<string, Node>();

  function recordFastLog(eventCode: number, signalId: number, payload: number): void {
    if (!active.value) return;

    const record = ring.push(eventCode, signalId, payload);
    latestLog.value = record;

    // Trigger System 1 fast reflex pipeline (sub-millisecond evaluation)
    const predictors = reflexMap.get(signalId);
    if (predictors) {
      for (const predictor of predictors) {
        const intent = predictor(payload);
        if (intent && intent.probability >= intentThreshold) {
          predictedIntent.value = intent;
          break;
        }
      }
    }
  }

  function flushFastLogs(): Float64Array {
    return ring.drain();
  }

  function registerReflex(triggerSignalId: number, predictor: (val: number) => IntentVector | null): void {
    const existing = reflexMap.get(triggerSignalId) ?? [];
    existing.push(predictor);
    reflexMap.set(triggerSignalId, existing);
  }

  function speculativePreload(selector: string, templateFactory: () => Node): void {
    if (!speculativeCache.has(selector)) {
      const fragment = templateFactory();
      speculativeCache.set(selector, fragment);
    }
  }

  return {
    active,
    latestLog,
    predictedIntent,
    logCount,
    recordFastLog,
    flushFastLogs,
    registerReflex,
    speculativePreload
  };
}

export * from '../types.js';
export { FastLogRingBuffer } from '../telemetry/fast-log.js';
