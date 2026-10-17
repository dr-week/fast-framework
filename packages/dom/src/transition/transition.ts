import { signal, type CleanupFn } from '@zuari/signals';
import type { TransitionCallback, TransitionInstance, NativeDocumentViewTransition } from './types.js';

/**
 * Executes state and DOM mutations wrapped inside the native Document View Transitions API.
 * Automatically delegates to hardware GPU compositor morphing when available,
 * with a zero-cost asynchronous fallback for older runtimes.
 */
export function createTransition(): TransitionInstance {
  const isTransitioning = signal(false);

  const start = async (updateFn: TransitionCallback): Promise<void> => {
    isTransitioning.value = true;

    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      typeof (document as unknown as { startViewTransition: unknown }).startViewTransition === 'function'
    ) {
      try {
        const transition = (
          document as unknown as {
            startViewTransition: (cb: () => void | Promise<void>) => NativeDocumentViewTransition;
          }
        ).startViewTransition(async () => {
          await updateFn();
        });

        await transition.finished;
      } finally {
        isTransitioning.value = false;
      }
      return;
    }

    // Direct asynchronous fallback
    try {
      await updateFn();
    } finally {
      isTransitioning.value = false;
    }
  };

  const destroy: CleanupFn = () => {
    isTransitioning.value = false;
  };

  return {
    isTransitioning,
    start,
    destroy
  };
}
