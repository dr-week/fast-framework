import type { CleanupFn, Signal } from '@zuari/signals';

export type TransitionCallback = () => void | Promise<void>;

export interface ViewTransitionOptions {
  classNames?: string[] | undefined;
  updateState?: (() => void) | undefined;
}

export interface TransitionInstance {
  isTransitioning: Signal<boolean>;
  start: (updateFn: TransitionCallback) => Promise<void>;
  destroy: CleanupFn;
}

/**
 * Modern W3C Document View Transition interface.
 */
export interface NativeDocumentViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}
