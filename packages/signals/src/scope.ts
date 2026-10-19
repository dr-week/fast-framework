import type { CleanupFn } from './types.js';

export class EffectScope {
  private _cleanups: CleanupFn[] = [];
  private _active = true;

  get active(): boolean {
    return this._active;
  }

  /**
   * Run a function inside this effect scope.
   * Any effect or onMount/onDestroy registered while this scope is active
   * will be automatically added to this scope's cleanup registry.
   */
  run<T>(fn: () => T): T | undefined {
    if (!this._active) {
      console.warn('[Zuari Signals]: Cannot run function in an inactive EffectScope.');
      return undefined;
    }
    const prevScope = activeScope;
    activeScope = this;
    try {
      return fn();
    } finally {
      activeScope = prevScope;
    }
  }

  /**
   * Register a cleanup function to be invoked when this scope is stopped.
   */
  addCleanup(cleanup: CleanupFn): void {
    if (this._active) {
      this._cleanups.push(cleanup);
    } else {
      cleanup();
    }
  }

  /**
   * Disposes of all computations, subscriptions, and registered teardowns in this scope.
   */
  stop(): void {
    if (!this._active) return;
    this._active = false;
    const cleanups = this._cleanups.slice();
    this._cleanups = [];
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (err) {
        console.error('[Zuari EffectScope Cleanup Error]:', err);
      }
    }
  }
}

let activeScope: EffectScope | null = null;

export function getActiveScope(): EffectScope | null {
  return activeScope;
}

/**
 * Creates an EffectScope instance aligned with TC39 Signals / Vue / Solid effect scoping.
 * Scopes collect all inner effects, subscriptions, and lifecycle hooks for batch teardown.
 */
export function effectScope(fn?: (scope: EffectScope) => void): EffectScope {
  const scope = new EffectScope();
  if (fn) {
    scope.run(() => fn(scope));
  }
  return scope;
}

/**
 * Registers an onMount lifecycle hook. If called within an active scope or component context,
 * runs immediately (or when mounted) and automatically registers any returned cleanup function.
 */
export function onMount(fn: () => void | CleanupFn): void {
  const scope = getActiveScope();
  const cleanup = fn();
  if (typeof cleanup === 'function') {
    if (scope) {
      scope.addCleanup(cleanup);
    }
  }
}

/**
 * Registers an onDestroy teardown hook in the current active scope or component lifecycle.
 */
export function onDestroy(fn: CleanupFn): void {
  const scope = getActiveScope();
  if (scope) {
    scope.addCleanup(fn);
  } else {
    // If no active scope, register microtask / queue or warn
    console.warn('[Zuari Signals]: onDestroy called without an active EffectScope.');
  }
}
