/**
 * @fileoverview Type definitions for the Zuari System 1 Fast Reflex AI & Fast-Log Engine.
 * Implements sub-millisecond intuitive reflexes, predictive speculative DOM pre-synthesis,
 * and zero-allocation high-frequency binary event logging.
 */

import type { Signal, Computed } from '@zuari/signals';

/** Fast-Log Binary Event Record (32-byte memory layout) */
export interface FastLogRecord {
  readonly timestampUs: number;
  readonly eventCode: number;
  readonly signalId: number;
  readonly payloadFloat: number;
}

/** Predictive User Intent Vector */
export interface IntentVector {
  readonly targetSelector: string;
  readonly probability: number;
  readonly latencyScoreMs: number;
}

/** System 1 Fast Reflex Model Configuration */
export interface SystemOneConfig {
  /** Maximum number of records in the circular fast-log ring buffer */
  readonly ringBufferSize?: number;
  /** Speculative pre-render confidence threshold [0.0 - 1.0] */
  readonly intentThreshold?: number;
  /** Maximum reaction latency in microseconds */
  readonly maxReactionBudgetUs?: number;
}

/** Autonomous System 1 Controller */
export interface SystemOneController {
  readonly active: Signal<boolean>;
  readonly latestLog: Signal<FastLogRecord | null>;
  readonly predictedIntent: Signal<IntentVector | null>;
  readonly logCount: Computed<number>;
  
  /** Push a high-frequency telemetry event into the fast-log ring buffer without allocation */
  recordFastLog(eventCode: number, signalId: number, payload: number): void;
  
  /** Drain all recorded logs into a high-throughput Float64Array view */
  flushFastLogs(): Float64Array;
  
  /** Speculatively register an intent reflex rule */
  registerReflex(triggerSignalId: number, predictor: (val: number) => IntentVector | null): void;

  /** Pre-synthesize DOM branches before user click */
  speculativePreload(selector: string, templateFactory: () => Node): void;
}
