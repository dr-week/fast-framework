/**
 * @fileoverview Type definitions for the Zuari WebAssembly & Native Systems Interop ABI.
 * Supports zero-copy linear memory bridges for Rust, Zig, and native C-ABIs,
 * alongside compile-time TypeSpec interface definitions.
 */

import type { Signal } from '@zuari/signals';

/** Supported primitive numeric types in Wasm linear memory buffers */
export type WasmNumericType = 'f64' | 'f32' | 'i32' | 'i64' | 'u32' | 'u8';

/** Layout descriptor for a reactive property mapped to WebAssembly linear memory */
export interface WasmMemoryFieldDescriptor {
  readonly offset: number;
  readonly type: WasmNumericType;
  readonly name: string;
}

/** Configuration options for instantiating a zero-copy Wasm signal bridge */
export interface WasmBridgeOptions {
  /** The WebAssembly.Memory instance or raw ArrayBuffer */
  readonly memory: WebAssembly.Memory | ArrayBuffer;
  /** Byte offset where the reactive struct starts in linear memory */
  readonly baseOffset?: number;
}

/** A reactive signal directly synchronized with a WebAssembly linear memory slot */
export interface WasmBoundSignal<T extends number = number> {
  readonly signal: Signal<T>;
  readonly offset: number;
  readonly type: WasmNumericType;
  /** Writes the current signal value into the underlying Wasm memory buffer */
  flushToWasm(): void;
  /** Reads the latest value from Wasm linear memory and notifies signal subscribers */
  syncFromWasm(): void;
}

/** TypeSpec AST Contract Definitions for compile-time UI component interfaces */
export type TypeSpecPrimitiveKind = 'string' | 'number' | 'boolean' | 'bytes' | 'duration' | 'void';

export interface TypeSpecField {
  readonly name: string;
  readonly type: TypeSpecPrimitiveKind | string;
  readonly optional?: boolean | undefined;
  readonly doc?: string | undefined;
}

export interface TypeSpecInterface {
  readonly name: string;
  readonly namespace?: string;
  readonly fields: readonly TypeSpecField[];
  readonly doc?: string;
}
