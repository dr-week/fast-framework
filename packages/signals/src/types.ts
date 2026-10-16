export type CleanupFn = () => void;
export type Computation<T> = () => T;
export type EffectFn = () => void | CleanupFn;

export interface ComputationNode<T = unknown> {
  dependencies: Set<DependencySignal>;
  execute: () => T | void;
  isStale: boolean;
}

export interface DependencySignal {
  _unsubscribe(node: ComputationNode<unknown>): void;
}
