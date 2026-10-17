/**
 * @fileoverview WASI 0.2 WebAssembly Interface Types (.wit) specification & TypeSpec interop in @zuari/wasm.
 * Allows @zuari/wasm to parse .wit definitions alongside TypeSpec contracts and generate zero-copy signal bindings.
 */

import { createWasmStruct, type WasmBridgeOptions, type WasmBoundSignal } from '../abi/index.js';
import { defineContract } from './typespec.js';
import type { TypeSpecInterface, TypeSpecField, WasmNumericType } from '../types.js';

export interface WasmWitFieldSpec {
  readonly name: string;
  readonly camelName: string;
  readonly witType: string;
  readonly wasmType: WasmNumericType;
  readonly offset: number;
}

export interface WasmWitRecordSpec {
  readonly name: string;
  readonly fields: readonly WasmWitFieldSpec[];
  readonly byteSize: number;
}

function toCamel(s: string): string {
  return s.replace(/-([a-z0-9])/gi, (_, c: string) => c.toUpperCase());
}

function resolveWitAbi(witType: string): { wasmType: WasmNumericType; size: number; align: number } {
  switch (witType.trim()) {
    case 'f64':
      return { wasmType: 'f64', size: 8, align: 8 };
    case 's64':
    case 'u64':
      return { wasmType: 'i64', size: 8, align: 8 };
    case 'f32':
      return { wasmType: 'f32', size: 4, align: 4 };
    case 's32':
      return { wasmType: 'i32', size: 4, align: 4 };
    case 'u8':
    case 's8':
    case 'bool':
      return { wasmType: 'u8', size: 1, align: 1 };
    case 'u32':
    default:
      return { wasmType: 'u32', size: 4, align: 4 };
  }
}

/**
 * Parses a WASI 0.2 `.wit` record definition into a Canonical ABI memory layout descriptor
 * and converts it alongside TypeSpec contracts.
 */
export function parseWitRecord(witSource: string, recordName?: string): WasmWitRecordSpec {
  const regex = /record\s+([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(witSource)) !== null) {
    const rName = match[1]!;
    if (recordName && rName !== recordName) continue;

    const body = match[2]!.replace(/\/\/.*$/gm, '');
    const entries = body
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const fields: WasmWitFieldSpec[] = [];
    let offset = 0;
    let maxAlign = 1;

    for (const entry of entries) {
      const [rawName, rawType] = entry.split(':').map((s) => s.trim());
      if (!rawName || !rawType) continue;
      const { wasmType, size, align } = resolveWitAbi(rawType);
      offset = (offset + align - 1) & ~(align - 1);
      if (align > maxAlign) maxAlign = align;

      fields.push({
        name: rawName,
        camelName: toCamel(rawName),
        witType: rawType,
        wasmType,
        offset
      });
      offset += size;
    }

    const byteSize = (offset + maxAlign - 1) & ~(maxAlign - 1);
    return { name: rName, fields, byteSize };
  }

  throw new Error(`[Zuari Wasm WIT]: No matching WIT record found.`);
}

/**
 * Converts a parsed WASI 0.2 `.wit` record into a validated Zuari TypeSpec contract.
 */
export function witRecordToTypeSpec(
  record: WasmWitRecordSpec,
  namespace = 'Zuari.Wasi'
): TypeSpecInterface {
  const fields: TypeSpecField[] = record.fields.map((f) => ({
    name: f.camelName,
    type: f.witType === 'bool' ? 'boolean' : f.witType === 'string' ? 'string' : 'number',
    doc: `WIT ${f.witType} @ offset ${f.offset}B`
  }));

  return defineContract({
    name: record.name,
    namespace,
    fields,
    doc: `WASI 0.2 WIT record (${record.byteSize} bytes)`
  });
}

/**
 * Creates zero-copy reactive signal bindings directly from a `.wit` source string.
 */
export function createWitStructSignals(
  options: WasmBridgeOptions,
  witSource: string,
  recordName?: string
): Record<string, WasmBoundSignal<number>> {
  const spec = parseWitRecord(witSource, recordName);
  const schema: Record<string, { offset: number; type: WasmNumericType }> = {};
  for (const field of spec.fields) {
    schema[field.camelName] = { offset: field.offset, type: field.wasmType };
  }
  return createWasmStruct(options, schema);
}
