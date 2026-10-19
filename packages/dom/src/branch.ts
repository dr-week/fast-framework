import { effect, type CleanupFn, type Signal } from '@zuari/signals';
import { render, type TemplateResult, type RenderInstance } from './index.js';

/**
 * Declarative conditional branching primitive (when).
 * Preserves DOM state, avoids unnecessary re-renders, and properly tears down unmounted branches.
 *
 * @param condition Signal or function evaluating to a truthy/falsy value
 * @param thenBranch Factory returning the TemplateResult to render when truthy
 * @param elseBranch Optional factory returning the TemplateResult to render when falsy
 *
 * @example
 * ```ts
 * const isLoggedIn = signal(false);
 * const view = html`
 *   <div>
 *     ${when(isLoggedIn, () => html`<span>Welcome back!</span>`, () => html`<button>Sign In</button>`)}
 *   </div>
 * `;
 * ```
 */
export function when<T>(
  condition: Signal<T> | (() => T) | T,
  thenBranch: (val: NonNullable<T>) => TemplateResult,
  elseBranch?: () => TemplateResult
): () => Node {
  return () => {
    const startMarker = document.createComment('zuari-when-start');
    const endMarker = document.createComment('zuari-when-end');
    const fragment = document.createDocumentFragment();
    fragment.appendChild(startMarker);
    fragment.appendChild(endMarker);

    let currentNodes: Node[] = [];
    let currentInstance: RenderInstance | null = null;
    let currentBranch: 'then' | 'else' | 'none' = 'none';

    const getCondition = (): unknown => {
      if (typeof condition === 'function') {
        return (condition as () => unknown)();
      }
      if (condition && typeof condition === 'object' && 'value' in condition) {
        return (condition as Signal<unknown>).value;
      }
      return condition;
    };

    effect(() => {
      const condVal = getCondition();
      const isTruthy = Boolean(condVal);
      const targetBranch = isTruthy ? 'then' : 'else';

      if (targetBranch === currentBranch) {
        return; // State branch unchanged, avoid redundant re-render
      }

      // 1. Teardown active instance
      if (currentInstance) {
        for (const node of currentNodes) {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
        currentInstance.destroy();
        currentInstance = null;
        currentNodes = [];
      }

      // 2. Render chosen branch
      const parent = startMarker.parentNode || fragment;
      let result: TemplateResult | undefined;

      if (isTruthy) {
        result = thenBranch(condVal as NonNullable<T>);
      } else if (elseBranch) {
        result = elseBranch();
      }

      if (result) {
        const inst = render(result);
        const childNodes = Array.from(inst.fragment.childNodes);
        currentInstance = inst;
        currentNodes = childNodes;

        parent.insertBefore(inst.fragment, endMarker);
      }

      currentBranch = targetBranch;
    });

    return fragment;
  };
}

/**
 * Multi-branch pattern matcher primitive (match).
 * Selects and renders the first matching case or the default fallback.
 *
 * @param valueSignal Signal or function producing the expression value to match
 * @param cases Map or array of [matchValue, branchFn] pairs
 * @param defaultBranch Optional fallback branch if no case matches
 *
 * @example
 * ```ts
 * const status = signal('loading');
 * const view = html`
 *   <div>
 *     ${match(status, [
 *       ['loading', () => html`<span>Loading...</span>`],
 *       ['success', () => html`<span>Loaded!</span>`],
 *       ['error', () => html`<span>Failed to load</span>`]
 *     ])}
 *   </div>
 * `;
 * ```
 */
export function match<K, V = unknown>(
  valueSignal: Signal<K> | (() => K) | K,
  cases: Iterable<readonly [K, () => TemplateResult]>,
  defaultBranch?: () => TemplateResult
): () => Node {
  return () => {
    const startMarker = document.createComment('zuari-match-start');
    const endMarker = document.createComment('zuari-match-end');
    const fragment = document.createDocumentFragment();
    fragment.appendChild(startMarker);
    fragment.appendChild(endMarker);

    let currentNodes: Node[] = [];
    let currentInstance: RenderInstance | null = null;
    let currentKey: unknown = Symbol();

    const getValue = (): unknown => {
      if (typeof valueSignal === 'function') {
        return (valueSignal as () => unknown)();
      }
      if (valueSignal && typeof valueSignal === 'object' && 'value' in valueSignal) {
        return (valueSignal as Signal<unknown>).value;
      }
      return valueSignal;
    };

    effect(() => {
      const val = getValue();
      if (val === currentKey) {
        return;
      }

      // Teardown previous
      if (currentInstance) {
        for (const node of currentNodes) {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
        currentInstance.destroy();
        currentInstance = null;
        currentNodes = [];
      }

      // Find matched case
      let matchedFn: (() => TemplateResult) | undefined;
      for (const [key, fn] of cases) {
        if (Object.is(key, val)) {
          matchedFn = fn;
          break;
        }
      }

      if (!matchedFn && defaultBranch) {
        matchedFn = defaultBranch;
      }

      if (matchedFn) {
        const parent = startMarker.parentNode || fragment;
        const result = matchedFn();
        const inst = render(result);
        const childNodes = Array.from(inst.fragment.childNodes);
        currentInstance = inst;
        currentNodes = childNodes;
        parent.insertBefore(inst.fragment, endMarker);
      }

      currentKey = val;
    });

    return fragment;
  };
}
