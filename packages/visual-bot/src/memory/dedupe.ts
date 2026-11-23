/**
 * @fileoverview Persistent Bounded Zero-Repeat Memory.
 * Tracks seen keys (titles, URLs, selectors, IDs) in a FIFO-capped Set backed
 * by @zuari/signals and an optional storage adapter (e.g. localStorage).
 */

import { signal, type Signal } from '@zuari/signals';
import type { StorageLike } from '../types.js';

export interface DedupeMemoryOptions {
  storageKey?: string;
  maxItems?: number;
  normalize?: (key: string) => string;
  storage?: StorageLike | null;
}

export interface DedupeMemory {
  items: Signal<string[]>;
  size: () => number;
  has: (key: string) => boolean;
  add: (key: string) => boolean;
  addMany: (keys: Iterable<string>) => number;
  filterUnseen: <T>(list: T[], getKey: (item: T) => string) => T[];
  clear: () => void;
  exportList: () => string[];
  importList: (keys: string[]) => void;
}

function defaultNormalize(key: string): string {
  return key.trim().toLowerCase();
}

export function createDedupeMemory(options: DedupeMemoryOptions = {}): DedupeMemory {
  const maxItems = Math.max(1, options.maxItems ?? 500);
  const normalize = options.normalize ?? defaultNormalize;
  const storageKey = options.storageKey;
  const storage =
    options.storage !== undefined
      ? options.storage
      : typeof localStorage !== 'undefined'
        ? localStorage
        : null;

  const initialSet = new Set<string>();
  if (storage && storageKey) {
    try {
      const raw = storage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        for (const item of parsed.slice(-maxItems)) {
          if (typeof item === 'string' && item) initialSet.add(normalize(item));
        }
      }
    } catch {
      // Ignore corrupt storage payloads
    }
  }

  const seen = initialSet;
  const items = signal<string[]>(Array.from(seen));

  function persist(): void {
    const arr = Array.from(seen).slice(-maxItems);
    if (arr.length < seen.size) {
      seen.clear();
      for (const k of arr) seen.add(k);
    }
    items.value = arr;
    if (storage && storageKey) {
      try {
        storage.setItem(storageKey, JSON.stringify(arr));
      } catch {
        // Ignore quota errors
      }
    }
  }

  function has(key: string): boolean {
    const norm = normalize(key);
    return norm.length > 0 && seen.has(norm);
  }

  function add(key: string): boolean {
    const norm = normalize(key);
    if (!norm || seen.has(norm)) return false;
    seen.add(norm);
    persist();
    return true;
  }

  function addMany(keys: Iterable<string>): number {
    let added = 0;
    for (const key of keys) {
      const norm = normalize(key);
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        added++;
      }
    }
    if (added > 0) persist();
    return added;
  }

  function filterUnseen<T>(list: T[], getKey: (item: T) => string): T[] {
    return list.filter((item) => !has(getKey(item)));
  }

  function clear(): void {
    seen.clear();
    persist();
  }

  function exportList(): string[] {
    return items.value.slice();
  }

  function importList(keys: string[]): void {
    seen.clear();
    for (const k of keys.slice(-maxItems)) {
      if (typeof k === 'string') {
        const norm = normalize(k);
        if (norm) seen.add(norm);
      }
    }
    persist();
  }

  return {
    items,
    size: () => seen.size,
    has,
    add,
    addMany,
    filterUnseen,
    clear,
    exportList,
    importList,
  };
}
