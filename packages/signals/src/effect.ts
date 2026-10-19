import type { CleanupFn, ComputationNode, EffectFn } from './types.js';
import { setActiveSubscriber } from './scheduler.js';
import { getActiveScope } from './scope.js';

/**
 * Subscribes to signals and triggers side effects upon state changes.
 */
export function effect(fn: EffectFn): CleanupFn {
  let cleanup: void | CleanupFn;
  const node: ComputationNode<void> = {
    dependencies: new Set(),
    isStale: false,
    execute: () => {
      // Clear previous dependencies to dynamically adapt to branching
      for (const dep of node.dependencies) {
        dep._unsubscribe(node as ComputationNode<unknown>);
      }
      node.dependencies.clear();

      if (typeof cleanup === 'function') {
        try {
          cleanup();
        } catch (e) {
          console.error('[Nova Signal Effect Cleanup Error]:', e);
        }
      }

      const prevSub = setActiveSubscriber(node as ComputationNode<unknown>);
      try {
        cleanup = fn();
      } finally {
        setActiveSubscriber(prevSub);
        node.isStale = false;
      }
    }
  };

  // Initial execution
  node.execute();

  // Return teardown function
  const dispose = () => {
    for (const dep of node.dependencies) {
      dep._unsubscribe(node as ComputationNode<unknown>);
    }
    node.dependencies.clear();
    if (typeof cleanup === 'function') {
      cleanup();
    }
  };

  const currentScope = getActiveScope();
  if (currentScope) {
    currentScope.addCleanup(dispose);
  }

  return dispose;
}

