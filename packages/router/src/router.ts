/**
 * @fileoverview Ultra-lightweight (<1KB) Platform-First Router for Zuari.
 * Unifies:
 * 1. Navigation API (`window.navigation.addEventListener('navigate', ...)`)
 * 2. Speculation Rules API (`<script type="speculationrules">` prerendering on hover)
 * 3. View Transitions Level 2 (`@view-transition { navigation: auto; }` + `document.startViewTransition`)
 */

import { signal, type CleanupFn } from '@zuari/signals';
import type {
  RouteDefinition,
  RouterOptions,
  RouteMatch,
  RouterInstance,
  SpeculationEagerness
} from './types.js';

/**
 * Matches a URL pathname against a route pattern (e.g., `/users/:id`).
 */
export function matchRoutePattern(
  pattern: string,
  pathname: string
): Record<string, string> | null {
  if (pattern === '*') return {};
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pat = patternParts[i]!;
    const seg = pathParts[i]!;
    if (pat.startsWith(':')) {
      params[pat.slice(1)] = decodeURIComponent(seg);
    } else if (pat !== seg) {
      return null;
    }
  }
  return params;
}

/**
 * Injects the View Transitions Level 2 `@view-transition { navigation: auto; }` rule
 * for zero-JS cross-document view transitions.
 */
export function enableCrossDocumentViewTransitions(): HTMLStyleElement | null {
  if (typeof document === 'undefined') return null;
  const existing = document.getElementById('zuari-view-transition-v2') as HTMLStyleElement | null;
  if (existing) return existing;

  const style = document.createElement('style');
  style.id = 'zuari-view-transition-v2';
  style.textContent = '@view-transition { navigation: auto; }';
  document.head.appendChild(style);
  return style;
}

/**
 * Injects a W3C Speculation Rules `<script type="speculationrules">` tag
 * to enable instant background prerendering on hover (`eagerness: "moderate"`).
 */
export function injectSpeculationRules(
  urls: readonly string[],
  eagerness: SpeculationEagerness = 'moderate'
): HTMLScriptElement | null {
  if (typeof document === 'undefined') return null;

  const script = document.createElement('script');
  script.type = 'speculationrules';
  script.setAttribute('data-zuari-speculation', 'true');

  const rulesPayload = {
    prerender: [
      {
        source: 'list',
        urls: [...urls],
        eagerness
      },
      {
        where: { href_matches: '/*' },
        eagerness
      }
    ]
  };

  script.textContent = JSON.stringify(rulesPayload);
  document.head.appendChild(script);
  return script;
}

/**
 * Creates a `< 1 KB` reactive router powered by the Navigation API, Speculation Rules, and View Transitions.
 */
export function createRouter<T = unknown>(options: RouterOptions<T>): RouterInstance<T> {
  const initialPath =
    options.initialPath ??
    (typeof location !== 'undefined' ? location.pathname : '/');

  const currentPath = signal<string>(initialPath);
  const isNavigating = signal<boolean>(false);

  const resolveMatchSync = (pathname: string): { def?: RouteDefinition<T>; params: Record<string, string> } => {
    for (const route of options.routes) {
      const params = matchRoutePattern(route.path, pathname);
      if (params !== null) {
        return { def: route, params };
      }
    }
    return { params: {} };
  };

  const initialResolved = resolveMatchSync(initialPath);
  const currentMatch = signal<RouteMatch<T>>({
    path: initialPath,
    matchedPattern: initialResolved.def?.path ?? null,
    params: initialResolved.params,
    data: null
  });

  const cleanups: CleanupFn[] = [];

  if (options.viewTransitions ?? true) {
    const vtStyle = enableCrossDocumentViewTransitions();
    if (vtStyle) {
      cleanups.push(() => vtStyle.remove());
    }
  }

  const speculate = (
    urls: readonly string[],
    eagerness: SpeculationEagerness = options.defaultEagerness ?? 'moderate'
  ): HTMLScriptElement | null => {
    const scriptEl = injectSpeculationRules(urls, eagerness);
    if (scriptEl) {
      cleanups.push(() => scriptEl.remove());
    }
    return scriptEl;
  };

  if (options.speculationRules ?? true) {
    const staticUrls = options.routes
      .filter((r) => r.prerender !== false && !r.path.includes(':') && r.path !== '*')
      .map((r) => r.path);
    if (staticUrls.length > 0) {
      speculate(staticUrls, options.defaultEagerness ?? 'moderate');
    }
  }

  const executeRouteTransition = async (pathname: string): Promise<RouteMatch<T>> => {
    isNavigating.value = true;
    const { def, params } = resolveMatchSync(pathname);

    const runAction = async () => {
      const data = def?.action ? await def.action(params) : null;
      const match: RouteMatch<T> = {
        path: pathname,
        matchedPattern: def?.path ?? null,
        params,
        data
      };
      currentPath.value = pathname;
      currentMatch.value = match;
      return match;
    };

    try {
      if (
        (options.viewTransitions ?? true) &&
        typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        typeof (document as unknown as { startViewTransition: unknown }).startViewTransition === 'function'
      ) {
        let matchResult!: RouteMatch<T>;
        const transition = (
          document as unknown as {
            startViewTransition: (cb: () => Promise<void>) => { finished: Promise<void> };
          }
        ).startViewTransition(async () => {
          matchResult = await runAction();
        });
        await transition.finished;
        return matchResult;
      }

      return await runAction();
    } finally {
      isNavigating.value = false;
    }
  };

  // Bind W3C Navigation API (`window.navigation`) when available
  const navApi =
    typeof window !== 'undefined'
      ? (window as unknown as {
          navigation?: {
            addEventListener(
              type: 'navigate',
              listener: (e: {
                canIntercept?: boolean;
                destination: { url: string };
                intercept(opts: { handler: () => Promise<void> }): void;
              }) => void
            ): void;
            removeEventListener(type: 'navigate', listener: unknown): void;
            navigate?(url: string, opts?: { history?: 'push' | 'replace' }): unknown;
          };
        }).navigation
      : undefined;

  if (navApi && typeof navApi.addEventListener === 'function') {
    const onNavigate = (event: {
      canIntercept?: boolean;
      destination: { url: string };
      intercept(opts: { handler: () => Promise<void> }): void;
    }) => {
      if (event.canIntercept === false) return;
      const url = new URL(event.destination.url, 'http://localhost');
      event.intercept({
        handler: async () => {
          await executeRouteTransition(url.pathname);
        }
      });
    };
    navApi.addEventListener('navigate', onNavigate);
    cleanups.push(() => navApi.removeEventListener('navigate', onNavigate));
  }

  const navigate = async (
    path: string,
    navOptions?: { replace?: boolean }
  ): Promise<RouteMatch<T>> => {
    if (typeof history !== 'undefined' && typeof history.pushState === 'function') {
      try {
        if (navOptions?.replace) {
          history.replaceState(null, '', path);
        } else {
          history.pushState(null, '', path);
        }
      } catch {
        // Ignore security error in opaque origins
      }
    }
    return executeRouteTransition(path);
  };

  return {
    currentPath,
    currentMatch,
    isNavigating,
    navigate,
    speculate,
    destroy: () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
      cleanups.length = 0;
    }
  };
}
