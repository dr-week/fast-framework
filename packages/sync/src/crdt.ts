/**
 * @fileoverview Binary CRDT Delta Codec & LWW-Element-Set / HLC Comparison.
 * Encodes and decodes CRDT envelopes into compact Uint8Array binary frames
 * suitable for OPFS, IndexedDB, BroadcastChannel, WebSockets, and WebTransport.
 */

import type { CRDTEnvelope, LamportClock } from './types.js';

const MAGIC_HEADER = 0x5a52; // 'ZR' in ASCII

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Compares two Lamport clocks deterministically (LWW tie-breaking by peerId).
 * Returns > 0 if `b` is strictly newer than `a`, < 0 if `a` is newer, 0 if identical.
 */
export function compareClocks(a: LamportClock, b: LamportClock): number {
  if (b.counter !== a.counter) {
    return b.counter - a.counter;
  }
  if (b.peerId === a.peerId) {
    return 0;
  }
  return b.peerId > a.peerId ? 1 : -1;
}

/**
 * Serializes a CRDTEnvelope<T> into a compact binary frame:
 * [2B Magic][4B Counter][2B PeerIdLen][2B KeyLen][4B PayloadLen][PeerId][Key][Payload UTF-8]
 */
export function encodeCRDTDelta<T>(envelope: CRDTEnvelope<T>): Uint8Array {
  const peerBytes = encoder.encode(envelope.clock.peerId);
  const keyBytes = encoder.encode(envelope.key);
  const payloadBytes = encoder.encode(JSON.stringify(envelope.value));

  const totalLength = 14 + peerBytes.byteLength + keyBytes.byteLength + payloadBytes.byteLength;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  view.setUint16(0, MAGIC_HEADER, true);
  view.setUint32(2, envelope.clock.counter, true);
  view.setUint16(6, peerBytes.byteLength, true);
  view.setUint16(8, keyBytes.byteLength, true);
  view.setUint32(10, payloadBytes.byteLength, true);

  let offset = 14;
  uint8.set(peerBytes, offset);
  offset += peerBytes.byteLength;

  uint8.set(keyBytes, offset);
  offset += keyBytes.byteLength;

  uint8.set(payloadBytes, offset);

  return uint8;
}

/**
 * Decodes a binary CRDT frame back into a CRDTEnvelope<T>.
 */
export function decodeCRDTDelta<T = unknown>(bytes: Uint8Array): CRDTEnvelope<T> {
  if (bytes.byteLength < 14) {
    throw new Error('[Zuari Sync]: Invalid binary CRDT frame (too short).');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = view.getUint16(0, true);
  if (magic !== MAGIC_HEADER) {
    throw new Error('[Zuari Sync]: Invalid binary CRDT magic header.');
  }

  const counter = view.getUint32(2, true);
  const peerLen = view.getUint16(6, true);
  const keyLen = view.getUint16(8, true);
  const payloadLen = view.getUint32(10, true);

  let offset = 14;
  const peerId = decoder.decode(bytes.subarray(offset, offset + peerLen));
  offset += peerLen;

  const key = decoder.decode(bytes.subarray(offset, offset + keyLen));
  offset += keyLen;

  const jsonStr = decoder.decode(bytes.subarray(offset, offset + payloadLen));
  const value = JSON.parse(jsonStr) as T;

  return {
    key,
    value,
    clock: {
      counter,
      peerId
    }
  };
}
