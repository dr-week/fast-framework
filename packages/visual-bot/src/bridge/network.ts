/**
 * @fileoverview Zero-Network Passive Fetch Stream Interceptor.
 * Passively clones and inspects matching `fetch` JSON responses with zero extra
 * network requests, emitting captured payloads into a reactive @zuari/signals store.
 */

import { signal, type Signal } from '@zuari/signals';

export interface InterceptRule<T = unknown> {
  id: string;
  match: string | RegExp | ((url: string) => boolean);
  transform?: (json: unknown, url: string) => T | null | undefined;
}

export interface CapturedEvent<T = unknown> {
  ruleId: string;
  url: string;
  data: T;
  timestamp: number;
}

export interface FetchInterceptor {
  active: Signal<boolean>;
  events: Signal<CapturedEvent[]>;
  lastEvent: Signal<CapturedEvent | null>;
  install: () => void;
  uninstall: () => void;
  clear: () => void;
}

function matchesRule(rule: InterceptRule, url: string): boolean {
  if (typeof rule.match === 'string') return url.includes(rule.match);
  if (rule.match instanceof RegExp) return rule.match.test(url);
  return rule.match(url);
}

export function createFetchInterceptor(
  rules: InterceptRule[],
  options: { target?: { fetch: typeof fetch }; maxEvents?: number; onCapture?: (ev: CapturedEvent) => void } = {}
): FetchInterceptor {
  const target = options.target ?? (globalThis as unknown as { fetch: typeof fetch });
  const maxEvents = options.maxEvents ?? 100;

  const active = signal(false);
  const events = signal<CapturedEvent[]>([]);
  const lastEvent = signal<CapturedEvent | null>(null);

  let originalFetch: typeof fetch | null = null;

  function install(): void {
    if (active.value || typeof target.fetch !== 'function') return;
    originalFetch = target.fetch;
    active.value = true;

    target.fetch = async function interceptedFetch(...args: Parameters<typeof fetch>) {
      const response = await originalFetch!.apply(this, args);
      const url =
        typeof args[0] === 'string'
          ? args[0]
          : args[0] instanceof URL
            ? args[0].toString()
            : (args[0] as Request)?.url || '';

      for (const rule of rules) {
        if (!matchesRule(rule, url)) continue;
        try {
          const clone = response.clone();
          clone
            .json()
            .then((json: unknown) => {
              const payload = rule.transform ? rule.transform(json, url) : json;
              if (payload == null) return;
              const ev: CapturedEvent = {
                ruleId: rule.id,
                url,
                data: payload,
                timestamp: Date.now(),
              };
              lastEvent.value = ev;
              events.value = [...events.value.slice(-(maxEvents - 1)), ev];
              options.onCapture?.(ev);
            })
            .catch(() => {});
        } catch {
          // Non-JSON or uncloneable response
        }
      }

      return response;
    };
  }

  function uninstall(): void {
    if (!active.value || !originalFetch) return;
    target.fetch = originalFetch;
    originalFetch = null;
    active.value = false;
  }

  function clear(): void {
    events.value = [];
    lastEvent.value = null;
  }

  return { active, events, lastEvent, install, uninstall, clear };
}
