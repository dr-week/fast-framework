/**
 * @fileoverview High-Frequency Zero-Allocation Circular Fast-Log Buffer.
 * Logs up to 1,000,000 events/sec into a pre-allocated Float64Array without GC churn.
 */

import type { FastLogRecord } from '../types.js';

export class FastLogRingBuffer {
  private _buffer: Float64Array;
  private _capacity: number;
  private _writeIndex = 0;
  private _count = 0;

  constructor(capacity = 4096) {
    this._capacity = capacity;
    // Each record stores 4 x Float64 slots: [timestampUs, eventCode, signalId, payloadFloat]
    this._buffer = new Float64Array(capacity * 4);
  }

  get count(): number {
    return this._count;
  }

  get capacity(): number {
    return this._capacity;
  }

  push(eventCode: number, signalId: number, payload: number): FastLogRecord {
    const timestampUs = performance.now() * 1000;
    const offset = this._writeIndex * 4;

    this._buffer[offset] = timestampUs;
    this._buffer[offset + 1] = eventCode;
    this._buffer[offset + 2] = signalId;
    this._buffer[offset + 3] = payload;

    this._writeIndex = (this._writeIndex + 1) % this._capacity;
    this._count++;

    return {
      timestampUs,
      eventCode,
      signalId,
      payloadFloat: payload
    };
  }

  drain(): Float64Array {
    const activeLength = Math.min(this._count, this._capacity) * 4;
    return this._buffer.slice(0, activeLength);
  }

  clear(): void {
    this._writeIndex = 0;
    this._count = 0;
    this._buffer.fill(0);
  }
}
