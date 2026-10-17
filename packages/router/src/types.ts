/**
 * @fileoverview Type definitions for @zuari/router.
 * Combines the Navigation API (`window.navigation`), Speculation Rules API,
 * and View Transitions Level 2 (`@view-transition { navigation: auto; }`).
 */

import type { Signal, CleanupFn } from '@zuari/signals';

export type SpeculationEagerness = 'immediate' | 'eager' | 'moderate' | 'conservative';

export interface RouteDefinition<T = unknown> {
  /** URL pattern string, e.g. '/users/:id' or '/settings' */
  readonly path: string;
  /** Handler or view factory invoked when route matches */
  readonly action?: ((params: Record<string, string>) => T | Promise<T>) | undefined;
  /** Optional Speculation Rules eagerness for automatic background prerendering */
  readonly prerender?: SpeculationEagerness | boolean | undefined;
}

export interface RouterOptions<T = unknown> {
  readonly routes: readonly RouteDefinition<T>[];
  readonly initialPath?: string | undefined;
  /** Enable automatic View Transitions Level 2 CSS injection & startViewTransition wrapping (default: true) */
  readonly viewTransitions?: boolean | undefined;
  /** Enable automatic Speculation Rules (<script type="speculationrules">) injection (default: true) */
  readonly speculationRules?: boolean | undefined;
  /** Default eagerness for Speculation Rules prerendering (default: 'moderate' on hover) */
  readonly defaultEagerness?: SpeculationEagerness | undefined;
}

export interface RouteMatch<T = unknown> {
  readonly path: string;
  readonly matchedPattern: string | null;
  readonly params: Record<string, string>;
  readonly data: T | null;
}

export interface RouterInstance<T = unknown> {
  readonly currentPath: Signal<string>;
  readonly currentMatch: Signal<RouteMatch<T>>;
  readonly isNavigating: Signal<boolean>;
  /** Navigates to `path` using `window.navigation` (or History API fallback) and View Transitions */
  navigate(path: string, options?: { replace?: boolean }): Promise<RouteMatch<T>>;
  /** Injects or updates `<script type="speculationrules">` for instant background prerendering */
  speculate(urls: readonly string[], eagerness?: SpeculationEagerness): HTMLScriptElement | null;
  /** Cleans up Navigation API listeners and injected speculation rules */
  destroy: CleanupFn;
}
