import type { ComputationNode } from './types.js';

let activeSubscriber: ComputationNode<unknown> | null = null;
const batchQueue: Set<ComputationNode<unknown>> = new Set();
let isBatching = false;

export function getActiveSubscriber(): ComputationNode<unknown> | null {
  return activeSubscriber;
}

export function setActiveSubscriber(node: ComputationNode<unknown> | null): ComputationNode<unknown> | null {
  const previous = activeSubscriber;
  activeSubscriber = node;
  return previous;
}

export function scheduleExecution(node: ComputationNode<unknown>): void {
  node.isStale = true;
  if (isBatching) {
    batchQueue.add(node);
  } else {
    node.execute();
  }
}

/**
 * Executes changes in a synchronous batch, deferring effect triggers
 * to avoid duplicate redundant computations.
 */
export function batch<T>(fn: () => T): T {
  const previousBatchState = isBatching;
  isBatching = true;
  try {
    return fn();
  } finally {
    isBatching = previousBatchState;
    if (!isBatching) {
      flushBatch();
    }
  }
}

function flushBatch(): void {
  while (batchQueue.size > 0) {
    const queue = Array.from(batchQueue);
    batchQueue.clear();
    for (const node of queue) {
      if (node.isStale) {
        node.execute();
      }
    }
  }
}
