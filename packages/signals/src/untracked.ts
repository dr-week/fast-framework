import { getActiveSubscriber, setActiveSubscriber } from './scheduler.js';

/**
 * Executes a function reading signals without registering the active computation
 * as a subscriber to any accessed signals.
 *
 * Standard primitive across Solid, Preact, and TC39 Signals proposal.
 *
 * @example
 * ```ts
 * effect(() => {
 *   const id = userId.value; // Subscribed
 *   const logPrefix = untracked(() => prefixSignal.value); // Not subscribed
 *   console.log(`${logPrefix}: ${id}`);
 * });
 * ```
 */
export function untracked<T>(fn: () => T): T {
  const prevSub = setActiveSubscriber(null);
  try {
    return fn();
  } finally {
    setActiveSubscriber(prevSub);
  }
}
