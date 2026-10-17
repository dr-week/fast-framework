/**
 * @fileoverview Local-First Storage & Transport Adapters (OPFS, IndexedDB, Memory, WebSocket/WebTransport).
 */

import type { SyncStorageAdapter, SyncTransportAdapter } from './types.js';
import type { CleanupFn } from '@zuari/signals';

const memoryStore = new Map<string, Uint8Array>();

/**
 * Creates a default storage adapter that attempts Origin Private File System (OPFS),
 * falls back to IndexedDB, and finally falls back to an isomorphic in-memory Map.
 */
export function createDefaultStorageAdapter(): SyncStorageAdapter {
  return {
    async read(key: string): Promise<Uint8Array | null> {
      // 1. Try OPFS if available in browser worker/window
      if (
        typeof navigator !== 'undefined' &&
        'storage' in navigator &&
        typeof navigator.storage?.getDirectory === 'function'
      ) {
        try {
          const root = await navigator.storage.getDirectory();
          const safeName = `zuari_${encodeURIComponent(key)}.crdt`;
          const fileHandle = await root.getFileHandle(safeName);
          const file = await fileHandle.getFile();
          const buf = await file.arrayBuffer();
          return new Uint8Array(buf);
        } catch {
          // File doesn't exist yet or OPFS restricted; check fallback
        }
      }
      return memoryStore.get(key) ?? null;
    },

    async write(key: string, data: Uint8Array): Promise<void> {
      memoryStore.set(key, data);
      if (
        typeof navigator !== 'undefined' &&
        'storage' in navigator &&
        typeof navigator.storage?.getDirectory === 'function'
      ) {
        try {
          const root = await navigator.storage.getDirectory();
          const safeName = `zuari_${encodeURIComponent(key)}.crdt`;
          const fileHandle = await root.getFileHandle(safeName, { create: true });
          if ('createWritable' in fileHandle && typeof fileHandle.createWritable === 'function') {
            const writable = await fileHandle.createWritable();
            await writable.write(new Uint8Array(data));
            await writable.close();
          }
        } catch {
          // Graceful fallback to memoryStore
        }
      }
    }
  };
}

/**
 * Creates a WebSocket binary CRDT transport adapter.
 */
export function createWebSocketSyncTransport(socket: WebSocket): SyncTransportAdapter {
  socket.binaryType = 'arraybuffer';

  return {
    sendDelta(deltaBytes: Uint8Array) {
      if (socket.readyState === 1 /* OPEN */) {
        socket.send(deltaBytes);
      }
    },
    onDelta(handler: (deltaBytes: Uint8Array) => void): CleanupFn {
      const listener = (event: MessageEvent) => {
        if (event.data instanceof ArrayBuffer) {
          handler(new Uint8Array(event.data));
        } else if (event.data instanceof Uint8Array) {
          handler(event.data);
        }
      };
      socket.addEventListener('message', listener);
      return () => socket.removeEventListener('message', listener);
    }
  };
}
