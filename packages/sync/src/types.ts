/**
 * @fileoverview Type definitions for @zuari/sync.
 * Local-First CRDT & Sync Signals backed by OPFS/IndexedDB, BroadcastChannel, and WebSockets/WebTransport.
 */

import type { Signal, CleanupFn, DependencySignal } from '@zuari/signals';

export interface LamportClock {
  /** Logical Lamport / Hybrid Logical Clock counter */
  readonly counter: number;
  /** Unique replica/node ID for deterministic tie-breaking */
  readonly peerId: string;
}

export interface CRDTEnvelope<T> {
  readonly key: string;
  readonly value: T;
  readonly clock: LamportClock;
}

export interface SyncTransportAdapter {
  /** Sends a compact binary CRDT delta over WebSockets or WebTransport */
  sendDelta(deltaBytes: Uint8Array): void | Promise<void>;
  /** Registers a listener for incoming binary CRDT deltas */
  onDelta(handler: (deltaBytes: Uint8Array) => void): CleanupFn;
}

export interface SyncStorageAdapter {
  read(key: string): Promise<Uint8Array | null>;
  write(key: string, data: Uint8Array): Promise<void>;
}

export interface SyncedSignalOptions<T> {
  /** Unique peer/node identifier (auto-generated if omitted) */
  readonly peerId?: string | undefined;
  /** BroadcastChannel name for instant cross-tab sync (default: 'zuari-sync-channel') */
  readonly channelName?: string | false | undefined;
  /** Optional custom storage backend (defaults to OPFS -> IndexedDB -> in-memory fallback) */
  readonly storage?: SyncStorageAdapter | undefined;
  /** Optional WebSocket / WebTransport binary delta adapter */
  readonly transport?: SyncTransportAdapter | undefined;
  /** Optional custom CRDT merge resolver for complex structures */
  readonly merge?: ((local: T, remote: T, localClock: LamportClock, remoteClock: LamportClock) => T) | undefined;
}

export interface SyncedSignal<T> extends DependencySignal {
  value: T;
  peek(): T;
  readonly key: string;
  readonly peerId: string;
  readonly clock: Signal<LamportClock>;
  /** Encodes the current state & Lamport clock into a compact binary CRDT delta */
  encodeBinaryDelta(): Uint8Array;
  /** Applies a binary CRDT delta from a remote peer (idempotent & commutative) */
  applyBinaryDelta(deltaBytes: Uint8Array): boolean;
  /** Applies a decoded CRDT envelope */
  applyRemoteEnvelope(envelope: CRDTEnvelope<T>): boolean;
  /** Flushes state immediately to persistent storage */
  persist(): Promise<void>;
  /** Disposes BroadcastChannel, transport listeners, and reactive effects */
  destroy: CleanupFn;
}

