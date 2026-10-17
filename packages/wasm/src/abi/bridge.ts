/**
 * @fileoverview Zero-copy WebAssembly Linear Memory Bridge.
 * Binds TC39 fine-grained reactive signals directly to Wasm linear memory buffers
 * allocated by Rust (wasm-bindgen), Zig, or C compilers without serialization overhead.
 */

import { signal, effect, type Signal } from '@zuari/signals';
import type { WasmNumericType, WasmBridgeOptions, WasmBoundSignal } from '../types.js';

function getBuffer(memory: WebAssembly.Memory | ArrayBuffer): ArrayBuffer {
  if (memory instanceof ArrayBuffer) {
    return memory;
  }
  return memory.buffer;
}

/**
 * Creates a zero-copy reactive signal bound to a specific byte offset in WebAssembly memory.
 * Whenever the signal changes, it flushes directly to the Wasm buffer.
 * When syncFromWasm is called, it updates the signal value from Wasm.
 */
export function createWasmSignal<T extends number = number>(
  options: WasmBridgeOptions,
  offset: number,
  type: WasmNumericType = 'f64',
  initialValue?: T
): WasmBoundSignal<T> {
  const base = options.baseOffset ?? 0;
  const targetOffset = base + offset;

  function readFromBuffer(): number {
    const buf = getBuffer(options.memory);
    const view = new DataView(buf);
    switch (type) {
      case 'f64':
        return view.getFloat64(targetOffset, true);
      case 'f32':
        return view.getFloat32(targetOffset, true);
      case 'i32':
        return view.getInt32(targetOffset, true);
      case 'u32':
        return view.getUint32(targetOffset, true);
      case 'u8':
        return view.getUint8(targetOffset);
      case 'i64':
        return Number(view.getBigInt64(targetOffset, true));
      default:
        return view.getFloat64(targetOffset, true);
    }
  }

  function writeToBuffer(val: number): void {
    const buf = getBuffer(options.memory);
    const view = new DataView(buf);
    switch (type) {
      case 'f64':
        view.setFloat64(targetOffset, val, true);
        break;
      case 'f32':
        view.setFloat32(targetOffset, val, true);
        break;
      case 'i32':
        view.setInt32(targetOffset, val, true);
        break;
      case 'u32':
        view.setUint32(targetOffset, val, true);
        break;
      case 'u8':
        view.setUint8(targetOffset, val);
        break;
      case 'i64':
        view.setBigInt64(targetOffset, BigInt(Math.trunc(val)), true);
        break;
      default:
        view.setFloat64(targetOffset, val, true);
        break;
    }
  }

  const startingVal = initialValue !== undefined ? initialValue : (readFromBuffer() as T);
  const sig = signal<T>(startingVal);

  // If initial value was provided, flush to buffer immediately
  if (initialValue !== undefined) {
    writeToBuffer(initialValue);
  }

  let isSyncing = false;

  // Reactivity: Auto-flush signal mutations to Wasm linear memory
  effect(() => {
    const current = sig.value;
    if (!isSyncing) {
      writeToBuffer(current);
    }
  });

  return {
    signal: sig,
    offset: targetOffset,
    type,
    flushToWasm: () => {
      writeToBuffer(sig.value);
    },
    syncFromWasm: () => {
      isSyncing = true;
      try {
        sig.value = readFromBuffer() as T;
      } finally {
        isSyncing = false;
      }
    }
  };
}

/**
 * Creates a mapped struct of reactive signals from a WebAssembly memory layout.
 */
export function createWasmStruct<T extends Record<string, { offset: number; type: WasmNumericType; initial?: number }>>(
  options: WasmBridgeOptions,
  schema: T
): { [K in keyof T]: WasmBoundSignal<number> } {
  const result: Record<string, WasmBoundSignal<number>> = {};
  for (const [key, field] of Object.entries(schema)) {
    result[key] = createWasmSignal(options, field.offset, field.type, field.initial);
  }
  return result as { [K in keyof T]: WasmBoundSignal<number> };
}
