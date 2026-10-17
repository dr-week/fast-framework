/**
 * @fileoverview Type definitions for WASI 0.2 Component Model & WebAssembly Interface Types (.wit).
 */

import type { WasmNumericType, WasmBridgeOptions, WasmBoundSignal } from '@zuari/wasm';

export type WitPrimitiveType =
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 's8'
  | 's16'
  | 's32'
  | 's64'
  | 'f32'
  | 'f64'
  | 'char'
  | 'bool'
  | 'string';

export interface WitRecordField {
  readonly name: string;
  readonly camelName: string;
  readonly witType: WitPrimitiveType | string;
  readonly wasmType: WasmNumericType;
  readonly byteSize: number;
  readonly byteAlignment: number;
  readonly byteOffset: number;
}

export interface WitRecordDescriptor {
  readonly name: string;
  readonly fields: readonly WitRecordField[];
  readonly totalByteSize: number;
  readonly alignment: number;
}

export interface WitFunctionParam {
  readonly name: string;
  readonly type: string;
}

export interface WitFunctionDescriptor {
  readonly name: string;
  readonly camelName: string;
  readonly params: readonly WitFunctionParam[];
  readonly results: readonly string[];
}

export interface WitInterfaceDescriptor {
  readonly name: string;
  readonly records: readonly WitRecordDescriptor[];
  readonly functions: readonly WitFunctionDescriptor[];
}

export interface WitDocumentAST {
  readonly packageName: string | null;
  readonly records: readonly WitRecordDescriptor[];
  readonly interfaces: readonly WitInterfaceDescriptor[];
  readonly worldName: string | null;
  readonly exports: readonly string[];
  readonly imports: readonly string[];
}

export type WitSignalRecordInstance = Record<string, WasmBoundSignal<number>>;

export interface WasiComponentBindingOptions extends WasmBridgeOptions {
  readonly witSource: string;
  readonly recordName: string;
}
