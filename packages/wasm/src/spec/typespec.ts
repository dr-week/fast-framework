/**
 * @fileoverview TypeSpec AST generator & contract definition utility for Zuari.
 * Enables compile-time architectural contract verification across
 * systems languages and micro-frontend boundaries.
 */

import type { TypeSpecInterface, TypeSpecField } from '../types.js';

/**
 * Creates a validated TypeSpec interface definition.
 */
export function defineContract(definition: TypeSpecInterface): TypeSpecInterface {
  return Object.freeze({
    ...definition,
    fields: Object.freeze([...definition.fields])
  });
}

/**
 * Emits a valid TypeSpec (.tsp) syntax string representation of the contract.
 */
export function emitTypeSpec(contract: TypeSpecInterface): string {
  const lines: string[] = [];
  if (contract.doc) {
    lines.push(`/** ${contract.doc} */`);
  }
  if (contract.namespace) {
    lines.push(`namespace ${contract.namespace};`);
    lines.push('');
  }
  lines.push(`model ${contract.name} {`);
  for (const field of contract.fields) {
    if (field.doc) {
      lines.push(`  /** ${field.doc} */`);
    }
    const optionalMarker = field.optional ? '?' : '';
    lines.push(`  ${field.name}${optionalMarker}: ${field.type};`);
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Helper to build common Zuari reactive component interface contracts.
 */
export function createComponentContract(
  name: string,
  fields: Record<string, { type: string; optional?: boolean; doc?: string }>,
  namespace = 'Zuari.Components'
): TypeSpecInterface {
  const specFields: TypeSpecField[] = Object.entries(fields).map(([fieldName, spec]) => ({
    name: fieldName,
    type: spec.type,
    optional: spec.optional,
    doc: spec.doc
  }));

  return defineContract({
    name,
    namespace,
    fields: specFields,
    doc: `Auto-generated TypeSpec model for ${name}`
  });
}
