import type { Computation, ComputationNode, DependencySignal } from './types.js';
import { getActiveSubscriber, setActiveSubscriber, scheduleExecution } from './scheduler.js';

/**
 * Read-only memoized signal derived from other signals.
 * Supports full diamond-dependency propagation and chained computed graphs.
 */
export class Computed<T> implements DependencySignal {
  private _value!: T;
  private _node: ComputationNode<T>;
  private _subscribers: Set<ComputationNode<unknown>> = new Set();
  private _isDirty = true;
  private _fn: Computation<T>;

  constructor(fn: Computation<T>) {
    this._fn = fn;
    this._node = {
      dependencies: new Set(),
      isStale: true,
      execute: () => {
        if (!this._isDirty) {
          this._isDirty = true;
          const subs = Array.from(this._subscribers);
          for (const sub of subs) {
            scheduleExecution(sub);
          }
        }
      }
    };
  }

  get value(): T {
    if (this._isDirty) {
      this._recompute();
    }
    const activeSub = getActiveSubscriber();
    if (activeSub) {
      this._subscribers.add(activeSub);
      activeSub.dependencies.add(this);
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
    this._subscribers.delete(node);
  }

  private _recompute(): void {
    for (const dep of this._node.dependencies) {
      dep._unsubscribe(this._node as ComputationNode<unknown>);
    }
    this._node.dependencies.clear();

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
