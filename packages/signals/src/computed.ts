import type { Computation, ComputationNode, DependencySignal } from './types.js';
import { getActiveSubscriber, setActiveSubscriber } from './scheduler.js';

/**
 * Read-only memoized signal derived from other signals.
 */
export class Computed<T> implements DependencySignal {
  private _value!: T;
  private _node: ComputationNode<T>;
  private _isDirty = true;
  private _fn: Computation<T>;

  constructor(fn: Computation<T>) {
    this._fn = fn;
    this._node = {
      dependencies: new Set(),
      isStale: true,
      execute: () => {
        this._isDirty = true;
      }
    };
  }

  get value(): T {
    if (this._isDirty) {
      this._recompute();
    }
    if (getActiveSubscriber()) {
      for (const dep of this._node.dependencies) {
        dep._unsubscribe(this._node as ComputationNode<unknown>);
      }
      this._node.dependencies.clear();
      this._recompute();
    }
    return this._value;
  }

  peek(): T {
    if (this._isDirty) {
      this._recompute();
    }
    return this._value;
  }

  _unsubscribe(node: ComputationNode<unknown>): void {
    // Forwarded unsubscription if chained
    for (const dep of this._node.dependencies) {
      dep._unsubscribe(node);
    }
  }

  private _recompute(): void {
    const prevSub = setActiveSubscriber(this._node as ComputationNode<unknown>);
    try {
      this._value = this._fn();
      this._isDirty = false;
      this._node.isStale = false;
    } finally {
      setActiveSubscriber(prevSub);
    }
  }
}

/**
 * Creates a memoized computed signal.
 */
export function computed<T>(fn: Computation<T>): Computed<T> {
  return new Computed(fn);
}
