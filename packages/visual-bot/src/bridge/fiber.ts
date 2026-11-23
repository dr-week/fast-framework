/**
 * @fileoverview Framework-agnostic React Fiber DOM Extractor Bridge.
 * Traverses internal React Fiber trees to read structured component props,
 * bypassing obfuscated or regenerated CSS class names.
 */

export interface ReactFiberNode {
  memoizedProps?: Record<string, unknown>;
  return?: ReactFiberNode | null;
  type?: unknown;
  [key: string]: unknown;
}

/**
 * Returns the internal React Fiber node attached to a DOM element, if present.
 */
export function getReactFiber(domNode: object | null | undefined): ReactFiberNode | null {
  if (!domNode) return null;
  const record = domNode as Record<string, unknown>;
  const key = Object.keys(record).find(
    (k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
  );
  return key ? (record[key] as ReactFiberNode) : null;
}

/**
 * Returns the direct `__reactProps$` object attached to a DOM element, if present.
 */
export function getReactProps(
  domNode: object | null | undefined
): Record<string, unknown> | null {
  if (!domNode) return null;
  const record = domNode as Record<string, unknown>;
  const key = Object.keys(record).find((k) => k.startsWith('__reactProps$'));
  return key ? (record[key] as Record<string, unknown>) : null;
}

/**
 * Walks up the React Fiber `.return` chain until `predicate(props)` matches
 * or `maxDepth` is reached.
 */
export function traverseFiberUpwards<T extends Record<string, unknown> = Record<string, unknown>>(
  fiberNode: ReactFiberNode | null | undefined,
  predicate: (props: Record<string, unknown>) => boolean,
  maxDepth = 25
): T | null {
  let curr = fiberNode ?? null;
  let depth = 0;
  while (curr && depth < maxDepth) {
    if (curr.memoizedProps && predicate(curr.memoizedProps)) {
      return curr.memoizedProps as T;
    }
    curr = curr.return ?? null;
    depth++;
  }
  return null;
}
