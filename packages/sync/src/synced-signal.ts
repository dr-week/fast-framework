/**
 * @fileoverview Local-First CRDT & Cross-Tab Sync Signal implementation.
 */

import { signal, type CleanupFn } from '@zuari/signals';

import type {
  CRDTEnvelope,
  LamportClock,
  SyncedSignal,
  SyncedSignalOptions
} from './types.js';
import { compareClocks, encodeCRDTDelta, decodeCRDTDelta } from './crdt.js';
import { createDefaultStorageAdapter } from './storage.js';

let peerCounter = 0;

function generatePeerId(): string {
  return `peer-${Date.now().toString(36)}-${(++peerCounter).toString(36)}`;
}

/**
 * Creates a reactive `syncedSignal(key, initialValue)` backed by OPFS/IndexedDB,
 * BroadcastChannel (instant cross-tab sync), and binary CRDT deltas over WebSockets/WebTransport.
 */
export function syncedSignal<T>(
  key: string,
  initialValue: T,
  options: SyncedSignalOptions<T> = {}
): SyncedSignal<T> {
  const peerId = options.peerId ?? generatePeerId();
  const storage = options.storage ?? createDefaultStorageAdapter();
  const baseSignal = signal<T>(initialValue);
  const clockSignal = signal<LamportClock>({ counter: 0, peerId });

  let isApplyingRemote = false;

  // BroadcastChannel setup for zero-latency cross-tab synchronization
  const channelName =
    options.channelName === undefined ? 'zuari-sync-channel' : options.channelName;
  const channel =
    channelName !== false && typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(channelName)
      : null;

  const encodeBinaryDelta = (): Uint8Array => {
    return encodeCRDTDelta<T>({
      key,
      value: baseSignal.value,
      clock: clockSignal.value
    });
  };

  const applyRemoteEnvelope = (envelope: CRDTEnvelope<T>): boolean => {
    if (envelope.key !== key) return false;

    const currentClock = clockSignal.value;
    const cmp = compareClocks(currentClock, envelope.clock);
    if (cmp <= 0) {
      // Local state is already newer or equal
      return false;
    }

    const mergedValue = options.merge
      ? options.merge(baseSignal.value, envelope.value, currentClock, envelope.clock)
      : envelope.value;

    isApplyingRemote = true;
    try {
      clockSignal.value = {
        counter: Math.max(currentClock.counter, envelope.clock.counter),
        peerId: envelope.clock.peerId
      };
      baseSignal.value = mergedValue;
    } finally {
      isApplyingRemote = false;
    }

    void storage.write(key, encodeBinaryDelta());
    return true;
  };

  const applyBinaryDelta = (deltaBytes: Uint8Array): boolean => {
    try {
      const envelope = decodeCRDTDelta<T>(deltaBytes);
      return applyRemoteEnvelope(envelope);
    } catch {
      return false;
    }
  };

  // Listen to BroadcastChannel events from sibling browser tabs
  const handleChannelMessage = (event: MessageEvent) => {
    if (event.data instanceof Uint8Array) {
      applyBinaryDelta(event.data);
    } else if (event.data && typeof event.data === 'object' && 'key' in event.data) {
      applyRemoteEnvelope(event.data as CRDTEnvelope<T>);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleChannelMessage);
  }

  // Listen to remote WebSocket / WebTransport binary CRDT deltas
  const disposeTransport: CleanupFn | null = options.transport
    ? options.transport.onDelta((bytes) => {
        applyBinaryDelta(bytes);
      })
    : null;

  // Hydrate initial state asynchronously from OPFS / IndexedDB
  void storage.read(key).then((storedBytes) => {
    if (storedBytes) {
      applyBinaryDelta(storedBytes);
    }
  });

  const persist = async (): Promise<void> => {
    await storage.write(key, encodeBinaryDelta());
  };

  const broadcastLocalMutation = (newVal: T) => {
    const nextClock: LamportClock = {
      counter: clockSignal.peek().counter + 1,
      peerId
    };
    clockSignal.value = nextClock;
    baseSignal.value = newVal;

    const delta = encodeCRDTDelta<T>({
      key,
      value: newVal,
      clock: nextClock
    });

    void storage.write(key, delta);
    channel?.postMessage(delta);
    void options.transport?.sendDelta(delta);
  };

  const destroy: CleanupFn = () => {
    disposeTransport?.();
    if (channel) {
      channel.removeEventListener('message', handleChannelMessage);
      channel.close();
    }
  };

  return {
    get value(): T {
      return baseSignal.value;
    },
    set value(newVal: T) {
      if (Object.is(baseSignal.peek(), newVal)) return;
      if (isApplyingRemote) {
        baseSignal.value = newVal;
        return;
      }
      broadcastLocalMutation(newVal);
    },
    peek(): T {
      return baseSignal.peek();
    },
    _unsubscribe(node) {
      baseSignal._unsubscribe(node);
    },
    key,
    peerId,
    clock: clockSignal,
    encodeBinaryDelta,
    applyBinaryDelta,
    applyRemoteEnvelope,
    persist,
    destroy
  };
}

