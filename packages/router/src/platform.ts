/**
 * @fileoverview W3C Speculation Rules & View Transitions Level 2 helpers for @zuari/router.
 */

import type { SpeculationEagerness } from './types.js';

/**
 * Matches a URL pathname against a route pattern (e.g., `/users/:id` or `*`).
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
