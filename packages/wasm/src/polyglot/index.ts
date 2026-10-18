/**
 * @fileoverview Polyglot Systems Language Kernel Architecture for @zuari/wasm.
 * Assigns specific programming languages to their optimal computational domains:
 *  - Rust       -> Memory-safe Systems, Cryptography, & WASI 0.2 Component Model (`#[repr(C)]`)
 *  - Zig        -> Zero-allocator Deterministic SIMD Physics & Frame Arena (`extern struct`)
 *  - C / C++23  -> Hardware Embedded Drivers, Audio DSP, & Legacy C-ABI (`struct __attribute__((packed))`)
 *  - AssemblyScript -> Lightweight WebAssembly Micro-Kernels
 *  - Go / TinyGo    -> Concurrent Network Stream & Edge Protocol Handlers
 *  - Python / Mojo  -> AI Tensor & Scientific Compute Buffers
 *  - WGSL       -> WebGPU Parallel Compute Shader Kernels
 *  - Lua        -> Hot-Reloadable Game Modding & UI Rules Scripting
 *
 * Also includes an ahead-of-time/in-memory WebAssembly 2.0 binary bytecode assembler
 * so Zuari can compile and execute genuine WebAssembly kernels on the fly with zero external toolchains.
 */

import { createWasmStruct, type WasmBridgeOptions, type WasmBoundSignal } from '../abi/index.js';
import type { WasmNumericType } from '../types.js';

export type SystemsLanguageTarget =
  | 'rust'
  | 'zig'
  | 'cpp'
  | 'go'
  | 'python'
  | 'wgsl';

export interface PolyglotFieldSpec {
  readonly name: string;
  readonly type: WasmNumericType;
  readonly initial?: number;
  readonly doc?: string;
}

export interface PolyglotStructDescriptor {
  readonly name: string;
  readonly purpose: string;
  readonly fields: readonly PolyglotFieldSpec[];
}

export interface CompiledStructLayout {
  readonly name: string;
  readonly byteSize: number;
  readonly alignment: number;
  readonly fields: ReadonlyArray<{
    readonly name: string;
    readonly type: WasmNumericType;
    readonly offset: number;
    readonly size: number;
    readonly initial?: number;
  }>;
}

function getTypeMetrics(type: WasmNumericType): { size: number; align: number } {
  switch (type) {
    case 'f64':
    case 'i64':
      return { size: 8, align: 8 };
    case 'f32':
    case 'i32':
    case 'u32':
      return { size: 4, align: 4 };
    case 'u8':
      return { size: 1, align: 1 };
  }
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

function toPascalCase(str: string): string {
  const camel = str.replace(/[-_]([a-z0-9])/gi, (_, c: string) => c.toUpperCase());
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Computes C-ABI / WASI 0.2 aligned memory offsets for a polyglot struct descriptor.
 */
export function computePolyglotLayout(descriptor: PolyglotStructDescriptor): CompiledStructLayout {
  let offset = 0;
  let maxAlign = 1;
  const fields: Array<{
    readonly name: string;
    readonly type: WasmNumericType;
    readonly offset: number;
    readonly size: number;
    readonly initial?: number;
  }> = [];

  for (const field of descriptor.fields) {
    const { size, align } = getTypeMetrics(field.type);
    offset = (offset + align - 1) & ~(align - 1);
    if (align > maxAlign) maxAlign = align;

    fields.push({
      name: field.name,
      type: field.type,
      offset,
      size,
      ...(field.initial !== undefined ? { initial: field.initial } : {})
    });

    offset += size;
  }

  const byteSize = (offset + maxAlign - 1) & ~(maxAlign - 1);
  return {
    name: descriptor.name,
    byteSize,
    alignment: maxAlign,
    fields
  };
}

/**
 * Emits native source code for a target systems language (Rust, Zig, C++23, Go, Python ctypes, or WGSL)
 * matching the exact zero-copy byte offsets bound to Zuari reactive signals.
 */
export function emitPolyglotNativeStruct(
  descriptor: PolyglotStructDescriptor,
  language: SystemsLanguageTarget
): string {
  const layout = computePolyglotLayout(descriptor);
  const pascalName = toPascalCase(descriptor.name);

  switch (language) {
    case 'rust': {
      const rustTypes: Record<WasmNumericType, string> = {
        f64: 'f64',
        f32: 'f32',
        i32: 'i32',
        u32: 'u32',
        i64: 'i64',
        u8: 'u8'
      };
      const lines = [
        `// [Rust Systems Layer] — ${descriptor.purpose}`,
        `// Zero-copy C-ABI memory layout (${layout.byteSize} bytes, align ${layout.alignment}B)`,
        '#[repr(C)]',
        '#[derive(Debug, Clone, Copy)]',
        `pub struct ${pascalName} {`
      ];
      for (const f of layout.fields) {
        lines.push(`    pub ${toSnakeCase(f.name)}: ${rustTypes[f.type]}, // offset: +${f.offset}B`);
      }
      lines.push('}');
      return lines.join('\n');
    }

    case 'zig': {
      const zigTypes: Record<WasmNumericType, string> = {
        f64: 'f64',
        f32: 'f32',
        i32: 'i32',
        u32: 'u32',
        i64: 'i64',
        u8: 'u8'
      };
      const lines = [
        `// [Zig Deterministic SIMD Kernel] — ${descriptor.purpose}`,
        `// Zero-allocator extern struct (${layout.byteSize} bytes)`,
        `pub const ${pascalName} = extern struct {`
      ];
      for (const f of layout.fields) {
        const defVal = f.initial !== undefined ? ` = ${f.initial}` : '';
        lines.push(`    ${toSnakeCase(f.name)}: ${zigTypes[f.type]}${defVal}, // offset: +${f.offset}B`);
      }
      lines.push('};');
      return lines.join('\n');
    }

    case 'cpp': {
      const cppTypes: Record<WasmNumericType, string> = {
        f64: 'double',
        f32: 'float',
        i32: 'int32_t',
        u32: 'uint32_t',
        i64: 'int64_t',
        u8: 'uint8_t'
      };
      const lines = [
        `// [C++23 Embedded / Hardware DSP Layer] — ${descriptor.purpose}`,
        '#include <cstdint>',
        `struct alignas(${layout.alignment}) ${pascalName} {`
      ];
      for (const f of layout.fields) {
        lines.push(`    ${cppTypes[f.type]} ${toSnakeCase(f.name)}; // offset: +${f.offset}B`);
      }
      lines.push('};');
      return lines.join('\n');
    }

    case 'go': {
      const goTypes: Record<WasmNumericType, string> = {
        f64: 'float64',
        f32: 'float32',
        i32: 'int32',
        u32: 'uint32',
        i64: 'int64',
        u8: 'uint8'
      };
      const lines = [
        `// [TinyGo / Go WASI Edge Worker Layer] — ${descriptor.purpose}`,
        'package zuari_kernel',
        '',
        `type ${pascalName} struct {`
      ];
      for (const f of layout.fields) {
        lines.push(`    ${toPascalCase(f.name)} ${goTypes[f.type]} // offset: +${f.offset}B`);
      }
      lines.push('}');
      return lines.join('\n');
    }

    case 'python': {
      const pyTypes: Record<WasmNumericType, string> = {
        f64: 'ctypes.c_double',
        f32: 'ctypes.c_float',
        i32: 'ctypes.c_int32',
        u32: 'ctypes.c_uint32',
        i64: 'ctypes.c_int64',
        u8: 'ctypes.c_uint8'
      };
      const lines = [
        `# [Python / Mojo Scientific & AI Tensor Bridge] — ${descriptor.purpose}`,
        'import ctypes',
        '',
        `class ${pascalName}(ctypes.LittleEndianStructure):`,
        '    _fields_ = ['
      ];
      for (const f of layout.fields) {
        lines.push(`        ("${toSnakeCase(f.name)}", ${pyTypes[f.type]}), # offset: +${f.offset}B`);
      }
      lines.push('    ]');
      return lines.join('\n');
    }

    case 'wgsl': {
      const wgslTypes: Record<WasmNumericType, string> = {
        f64: 'f32', // WGSL standardizes on f32/i32/u32 in uniform/storage structs
        f32: 'f32',
        i32: 'i32',
        u32: 'u32',
        i64: 'u32',
        u8: 'u32'
      };
      const lines = [
        `// [WGSL WebGPU Compute Shader Kernel] — ${descriptor.purpose}`,
        `struct ${pascalName} {`
      ];
      for (const f of layout.fields) {
        lines.push(`    ${toSnakeCase(f.name)}: ${wgslTypes[f.type]}, // offset: +${f.offset}B`);
      }
      lines.push('};');
      return lines.join('\n');
    }
  }
}

/**
 * Binds a PolyglotStructDescriptor directly to a WebAssembly.Memory or ArrayBuffer,
 * returning both the live reactive signals and the multi-language code generators.
 */
export function createPolyglotKernelBridge(
  options: WasmBridgeOptions,
  descriptor: PolyglotStructDescriptor
): {
  readonly layout: CompiledStructLayout;
  readonly signals: Record<string, WasmBoundSignal<number>>;
  emitSource(lang: SystemsLanguageTarget): string;
} {
  const layout = computePolyglotLayout(descriptor);
  const schema: Record<string, { offset: number; type: WasmNumericType; initial?: number }> = {};

  for (const f of layout.fields) {
    schema[f.name] = {
      offset: f.offset,
      type: f.type,
      ...(f.initial !== undefined ? { initial: f.initial } : {})
    };
  }

  return {
    layout,
    signals: createWasmStruct(options, schema),
    emitSource: (lang: SystemsLanguageTarget) => emitPolyglotNativeStruct(descriptor, lang)
  };
}

export * from './runtime-kernel.js';
