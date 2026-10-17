import { describe, it, expect, vi } from 'vitest';
import { syncedSignal, encodeCRDTDelta, decodeCRDTDelta, compareClocks } from './index.js';

describe('@zuari/sync', () => {
  it('encodes and decodes binary CRDT deltas losslessly', () => {
    const envelope = {
      key: 'doc-title',
      value: { text: 'Zuari 2028', tags: ['crdt', 'local-first'] },
      clock: { counter: 7, peerId: 'node-alpha' }
    };

    const binary = encodeCRDTDelta(envelope);
    expect(binary).toBeInstanceOf(Uint8Array);

    const decoded = decodeCRDTDelta<typeof envelope.value>(binary);
    expect(decoded).toEqual(envelope);
  });

  it('synchronizes two syncedSignal replicas via binary CRDT deltas with LWW resolution', () => {
    const sentDeltas: Uint8Array[] = [];
    let remoteHandler: ((bytes: Uint8Array) => void) | null = null;

    const replicaA = syncedSignal('counter', 0, {
      peerId: 'peer-a',
      channelName: false,
      transport: {
        sendDelta: (bytes) => {
          sentDeltas.push(bytes);
          remoteHandler?.(bytes);
        },
        onDelta: () => () => {}
      }
    });

    const replicaB = syncedSignal('counter', 0, {
      peerId: 'peer-b',
      channelName: false,
      transport: {
        sendDelta: () => {},
        onDelta: (handler) => {
          remoteHandler = handler;
          return () => {
            remoteHandler = null;
          };
        }
      }
    });

    // Mutate replica A -> automatically encodes binary delta and replicates to B
    replicaA.value = 42;
    expect(replicaA.clock.value.counter).toBe(1);
    expect(sentDeltas.length).toBe(1);
    expect(replicaB.value).toBe(42);
    expect(replicaB.clock.value.counter).toBe(1);

    // Outdated delta with lower counter is ignored by CRDT LWW rules
    const staleDelta = encodeCRDTDelta({
      key: 'counter',
      value: 999,
      clock: { counter: 0, peerId: 'peer-z' }
    });
    expect(replicaB.applyBinaryDelta(staleDelta)).toBe(false);
    expect(replicaB.value).toBe(42);

    replicaA.destroy();
    replicaB.destroy();
  });

  it('deterministically resolves concurrent Lamport clock ties via peerId', () => {
    expect(compareClocks({ counter: 5, peerId: 'a' }, { counter: 5, peerId: 'b' })).toBeGreaterThan(0);
    expect(compareClocks({ counter: 5, peerId: 'b' }, { counter: 5, peerId: 'a' })).toBeLessThan(0);
    expect(compareClocks({ counter: 5, peerId: 'a' }, { counter: 5, peerId: 'a' })).toBe(0);
  });
});
