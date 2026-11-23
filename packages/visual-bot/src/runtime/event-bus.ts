/**
 * @fileoverview Typed Reactive Event Bus for @zuari/visual-bot/runtime.
 * Supports strongly typed topic subscriptions, wildcard listeners, async fan-out,
 * and a reactive @zuari/signals `lastEvent` stream.
 */

import { signal, type Signal } from '@zuari/signals';

export interface BusEnvelope<K extends string = string, P = unknown> {
  type: K;
  payload: P;
  timestamp: number;
}

export type EventHandler<P = unknown> = (payload: P, envelope: BusEnvelope<string, P>) => void | Promise<void>;
export type WildcardHandler = (envelope: BusEnvelope) => void | Promise<void>;

export interface EventBus<EventMap extends Record<string, unknown> = Record<string, unknown>> {
  lastEvent: Signal<BusEnvelope | null>;
  eventCount: Signal<number>;
  on: <K extends keyof EventMap & string>(type: K, handler: EventHandler<EventMap[K]>) => () => void;
  onAny: (handler: WildcardHandler) => () => void;
  emit: <K extends keyof EventMap & string>(type: K, payload: EventMap[K]) => Promise<BusEnvelope<K, EventMap[K]>>;
  clear: () => void;
}

export function createEventBus<
  EventMap extends Record<string, unknown> = Record<string, unknown>
>(): EventBus<EventMap> {
  const listeners = new Map<string, Set<EventHandler>>();
  const wildcards = new Set<WildcardHandler>();
  const lastEvent = signal<BusEnvelope | null>(null);
  const eventCount = signal(0);

  function on<K extends keyof EventMap & string>(
    type: K,
    handler: EventHandler<EventMap[K]>
  ): () => void {
    let set = listeners.get(type);
    if (!set) {
      set = new Set();
      listeners.set(type, set);
    }
    const wrapped = handler as EventHandler;
    set.add(wrapped);
    return () => {
      set?.delete(wrapped);
      if (set && set.size === 0) listeners.delete(type);
    };
  }

  function onAny(handler: WildcardHandler): () => void {
    wildcards.add(handler);
    return () => {
      wildcards.delete(handler);
    };
  }

  async function emit<K extends keyof EventMap & string>(
    type: K,
    payload: EventMap[K]
  ): Promise<BusEnvelope<K, EventMap[K]>> {
    const envelope: BusEnvelope<K, EventMap[K]> = {
      type,
      payload,
      timestamp: Date.now(),
    };
    lastEvent.value = envelope;
    eventCount.value += 1;

    const topicSet = listeners.get(type);
    if (topicSet) {
      for (const fn of Array.from(topicSet)) {
        await fn(payload, envelope);
      }
    }
    for (const fn of Array.from(wildcards)) {
      await fn(envelope);
    }
    return envelope;
  }

  function clear(): void {
    listeners.clear();
    wildcards.clear();
  }

  return { lastEvent, eventCount, on, onAny, emit, clear };
}
