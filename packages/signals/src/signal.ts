import type { ComputationNode, DependencySignal } from './types.js';
import { getActiveSubscriber, scheduleExecution } from './scheduler.js';

/**
 * Mutable state primitive. Holds a value and alerts downstream
 * subscribers when modified.
 */
export class Signal<T> implements DependencySignal {
  private _value: T;
  private _subscribers: Set<ComputationNode<unknown>> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    const activeSub = getActiveSubscriber();
    if (activeSub) {
      this._subscribers.add(activeSub);
      activeSub.dependencies.add(this);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (Object.is(this._value, newValue)) return;
    this._value = newValue;
    this.notify();
  }

  /**
   * Peek at value without registering a reactive dependency.
   */
  peek(): T {
    return this._value;
  }

  private notify(): void {
    const subs = Array.from(this._subscribers);
    for (const sub of subs) {
      scheduleExecution(sub);
    }
  }

  _unsubscribe(node: ComputationNode<unknown>): void {
    this._subscribers.delete(node);
  }
}

/**
 * Creates a reactive state signal.
 */
export function signal<T>(initialValue: T): Signal<T> {
  return new Signal(initialValue);
}
