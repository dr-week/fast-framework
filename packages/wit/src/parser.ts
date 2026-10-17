/**
 * @fileoverview WASI 0.2 Component Model & WebAssembly Interface Types (.wit) Parser & Signal Auto-Gen.
 * Parses `.wit` packages, records, interfaces, and worlds, computes Canonical ABI byte offsets/alignments,
 * and generates zero-copy TypeScript reactive signal bindings or live Wasm struct instances.
 */

import { createWasmStruct, type WasmNumericType, type WasmBoundSignal } from '@zuari/wasm';
import type {
  WitDocumentAST,
  WitRecordDescriptor,
  WitRecordField,
  WitInterfaceDescriptor,
  WitFunctionDescriptor,
  WasiComponentBindingOptions,
  WitSignalRecordInstance
} from './types.js';

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z0-9])/gi, (_, ch: string) => ch.toUpperCase());
}

function kebabToPascal(str: string): string {
  const camel = kebabToCamel(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function mapWitTypeToCanonicalABI(witType: string): {
  wasmType: WasmNumericType;
  byteSize: number;
  alignment: number;
} {
  switch (witType.trim()) {
    case 'f64':
      return { wasmType: 'f64', byteSize: 8, alignment: 8 };
    case 's64':
    case 'u64':
    case 'i64':
      return { wasmType: 'i64', byteSize: 8, alignment: 8 };
    case 'f32':
      return { wasmType: 'f32', byteSize: 4, alignment: 4 };
    case 's32':
    case 'i32':
      return { wasmType: 'i32', byteSize: 4, alignment: 4 };
    case 'u32':
    case 'char':
      return { wasmType: 'u32', byteSize: 4, alignment: 4 };
    case 'u8':
    case 's8':
    case 'bool':
      return { wasmType: 'u8', byteSize: 1, alignment: 1 };
    case 'u16':
    case 's16':
      return { wasmType: 'u32', byteSize: 2, alignment: 2 };
    default:
      // Pointers / handles in WASI 0.2 32-bit linear memory default to 4-byte aligned i32/u32
      return { wasmType: 'u32', byteSize: 4, alignment: 4 };
  }
}

function alignUp(offset: number, alignment: number): number {
  return (offset + alignment - 1) & ~(alignment - 1);
}

function parseRecordBlock(name: string, body: string): WitRecordDescriptor {
  const fields: WitRecordField[] = [];
  let currentOffset = 0;
  let maxAlignment = 1;

  const cleanBody = body.replace(/\/\/.*$/gm, '');
  const rawEntries = cleanBody
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const entry of rawEntries) {
    const colonIdx = entry.indexOf(':');
    if (colonIdx === -1) continue;
    const fieldName = entry.slice(0, colonIdx).trim();
    const fieldType = entry.slice(colonIdx + 1).trim();

    const { wasmType, byteSize, alignment } = mapWitTypeToCanonicalABI(fieldType);
    currentOffset = alignUp(currentOffset, alignment);
    if (alignment > maxAlignment) {
      maxAlignment = alignment;
    }

    fields.push({
      name: fieldName,
      camelName: kebabToCamel(fieldName),
      witType: fieldType,
      wasmType,
      byteSize,
      byteAlignment: alignment,
      byteOffset: currentOffset
    });

    currentOffset += byteSize;
  }

  const totalByteSize = alignUp(currentOffset, maxAlignment);

  return {
    name,
    fields,
    totalByteSize,
    alignment: maxAlignment
  };
}

function parseFunctionsFromBody(body: string): WitFunctionDescriptor[] {
  const funcs: WitFunctionDescriptor[] = [];
  const fnRegex = /([a-zA-Z0-9_-]+)\s*:\s*func\s*\(([^)]*)\)(?:\s*->\s*([^;]+))?\s*;/g;
  let match: RegExpExecArray | null;

  while ((match = fnRegex.exec(body)) !== null) {
    const fnName = match[1]!;
    const rawParams = match[2] ?? '';
    const rawReturn = match[3]?.trim();

    const params = rawParams
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((paramStr) => {
        const [pName, pType] = paramStr.split(':').map((s) => s.trim());
        return { name: pName ?? 'arg', type: pType ?? 'u32' };
      });

    const results = rawReturn ? [rawReturn] : [];

    funcs.push({
      name: fnName,
      camelName: kebabToCamel(fnName),
      params,
      results
    });
  }

  return funcs;
}

/**
 * Parses a WASI 0.2 WebAssembly Interface Types (`.wit`) source string into a structured AST
 * with Canonical ABI field offsets and alignments.
 */
export function parseWIT(source: string): WitDocumentAST {
  const pkgMatch = source.match(/package\s+([^\s;]+)\s*;/);
  const packageName = pkgMatch ? pkgMatch[1]! : null;

  const records: WitRecordDescriptor[] = [];
  const interfaces: WitInterfaceDescriptor[] = [];

  // Parse top-level and nested records
  const recordRegex = /record\s+([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
  let recMatch: RegExpExecArray | null;
  while ((recMatch = recordRegex.exec(source)) !== null) {
    records.push(parseRecordBlock(recMatch[1]!, recMatch[2]!));
  }

  // Parse interfaces
  const ifaceRegex = /interface\s+([a-zA-Z0-9_-]+)\s*\{([\s\S]*?)\n\s*\}/g;
  let ifaceMatch: RegExpExecArray | null;
  while ((ifaceMatch = ifaceRegex.exec(source)) !== null) {
    const ifaceName = ifaceMatch[1]!;
    const ifaceBody = ifaceMatch[2]!;
    const ifaceRecords: WitRecordDescriptor[] = [];
    let nestedRec: RegExpExecArray | null;
    const localRecRegex = /record\s+([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
    while ((nestedRec = localRecRegex.exec(ifaceBody)) !== null) {
      ifaceRecords.push(parseRecordBlock(nestedRec[1]!, nestedRec[2]!));
    }
    const functions = parseFunctionsFromBody(ifaceBody);
    interfaces.push({
      name: ifaceName,
      records: ifaceRecords,
      functions
    });
  }

  // Fallback for single-line interface blocks not matching newline closing brace
  if (interfaces.length === 0) {
    const simpleIfaceRegex = /interface\s+([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = simpleIfaceRegex.exec(source)) !== null) {
      interfaces.push({
        name: m[1]!,
        records: [],
        functions: parseFunctionsFromBody(m[2]!)
      });
    }
  }

  // Parse world
  const worldMatch = source.match(/world\s+([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/);
  const worldName = worldMatch ? worldMatch[1]! : null;
  const exportsList: string[] = [];
  const importsList: string[] = [];

  if (worldMatch) {
    const worldBody = worldMatch[2]!;
    const expRegex = /export\s+([^\s;]+)\s*;/g;
    let em: RegExpExecArray | null;
    while ((em = expRegex.exec(worldBody)) !== null) {
      exportsList.push(em[1]!);
    }
    const impRegex = /import\s+([^\s;]+)\s*;/g;
    let im: RegExpExecArray | null;
    while ((im = impRegex.exec(worldBody)) !== null) {
      importsList.push(im[1]!);
    }
  }

  return {
    packageName,
    records,
    interfaces,
    worldName,
    exports: exportsList,
    imports: importsList
  };
}

/**
 * Generates zero-copy TypeScript reactive signal bindings source code from a parsed `.wit` AST
 * or `.wit` source string.
 */
export function generateWITSignalBindings(witOrAst: string | WitDocumentAST): string {
  const ast = typeof witOrAst === 'string' ? parseWIT(witOrAst) : witOrAst;
  const lines: string[] = [
    '// Auto-generated by @zuari/wit (WASI 0.2 Component Model Zero-Copy Signal Bindings)',
    "import { createWasmStruct, type WasmBridgeOptions, type WasmBoundSignal } from '@zuari/wasm';",
    ''
  ];

  for (const record of ast.records) {
    const pascalName = kebabToPascal(record.name);
    lines.push(`export interface ${pascalName}Signals {`);
    for (const field of record.fields) {
      lines.push(`  readonly ${field.camelName}: WasmBoundSignal<number>; // offset: ${field.byteOffset}, wit: ${field.witType}`);
    }
    lines.push('}');
    lines.push('');
    lines.push(`export function bind${pascalName}Signals(options: WasmBridgeOptions): ${pascalName}Signals {`);
    lines.push('  return createWasmStruct(options, {');
    for (const field of record.fields) {
      lines.push(`    ${field.camelName}: { offset: ${field.byteOffset}, type: '${field.wasmType}' },`);
    }
    lines.push('  });');
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Dynamically binds a WASI 0.2 Component `.wit` record definition directly to live
 * WebAssembly linear memory as zero-copy reactive signals.
 */
export function bindWITComponentRecord(
  options: WasiComponentBindingOptions
): WitSignalRecordInstance {
  const ast = parseWIT(options.witSource);
  const record = ast.records.find(
    (r) => r.name === options.recordName || kebabToPascal(r.name) === options.recordName
  );

  if (!record) {
    throw new Error(`[Zuari WIT]: Record "${options.recordName}" not found in WIT specification.`);
  }

  const schema: Record<string, { offset: number; type: WasmNumericType }> = {};
  for (const field of record.fields) {
    schema[field.camelName] = {
      offset: field.byteOffset,
      type: field.wasmType
    };
  }

  return createWasmStruct(
    {
      memory: options.memory,
      ...(options.baseOffset !== undefined ? { baseOffset: options.baseOffset } : {})
    },
    schema
  ) as Record<string, WasmBoundSignal<number>>;
}
