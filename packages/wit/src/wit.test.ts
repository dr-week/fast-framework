import { describe, it, expect } from 'vitest';
import {
  parseWIT,
  generateWITSignalBindings,
  bindWITComponentRecord
} from './index.js';

const SAMPLE_WIT = `
package zuari:physics@0.2.0;

interface simulation {
  record particle-state {
    entity-id: u32,
    velocity-x: f32,
    velocity-y: f32,
    total-energy: f64,
  }

  step-world: func(dt: f32) -> u32;
}

world physics-engine {
  export simulation;
}
`;

describe('@zuari/wit (WASI 0.2 Component Model & WIT Auto-Gen)', () => {
  it('parses .wit package, records, Canonical ABI alignments, interfaces, and worlds', () => {
    const ast = parseWIT(SAMPLE_WIT);

    expect(ast.packageName).toBe('zuari:physics@0.2.0');
    expect(ast.worldName).toBe('physics-engine');
    expect(ast.exports).toContain('simulation');
    expect(ast.records).toHaveLength(1);

    const record = ast.records[0]!;
    expect(record.name).toBe('particle-state');
    expect(record.fields).toHaveLength(4);

    // Check Canonical ABI offsets: u32 (0..4), f32 (4..8), f32 (8..12), f64 aligned to 8 -> offset 16 (16..24)
    expect(record.fields[0]?.byteOffset).toBe(0);
    expect(record.fields[1]?.byteOffset).toBe(4);
    expect(record.fields[2]?.byteOffset).toBe(8);
    expect(record.fields[3]?.byteOffset).toBe(16);
    expect(record.totalByteSize).toBe(24);
  });

  it('auto-generates TypeScript zero-copy signal bindings from .wit source', () => {
    const code = generateWITSignalBindings(SAMPLE_WIT);
    expect(code).toContain('export interface ParticleStateSignals');
    expect(code).toContain('export function bindParticleStateSignals');
    expect(code).toContain("totalEnergy: { offset: 16, type: 'f64' }");
  });

  it('binds a live WASI 0.2 WIT record directly to WebAssembly memory signals', () => {
    const memory = new ArrayBuffer(64);
    const signals = bindWITComponentRecord({
      memory,
      witSource: SAMPLE_WIT,
      recordName: 'particle-state'
    });

    signals.entityId!.signal.value = 7;
    signals.velocityX!.signal.value = 12.5;
    signals.totalEnergy!.signal.value = 512.75;

    const view = new DataView(memory);
    expect(view.getUint32(0, true)).toBe(7);
    expect(view.getFloat32(4, true)).toBe(12.5);
    expect(view.getFloat64(16, true)).toBe(512.75);
  });
});
