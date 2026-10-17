import { describe, it, expect } from 'vitest';
import { createWasmSignal, createWasmStruct } from './abi/bridge.js';
import { defineContract, emitTypeSpec, createComponentContract } from './spec/typespec.js';
import { parseWitRecord, witRecordToTypeSpec, createWitStructSignals } from './spec/wit.js';

describe('@zuari/wasm', () => {
  describe('Wasm Memory Signal Bridge', () => {
    it('synchronizes signal mutations directly to ArrayBuffer/Wasm memory', () => {
      const buffer = new ArrayBuffer(64);
      const wasmSignal = createWasmSignal<number>(
        { memory: buffer },
        0, // offset 0
        'f64',
        42.5
      );

      // Verify initial write
      const view = new DataView(buffer);
      expect(view.getFloat64(0, true)).toBe(42.5);
      expect(wasmSignal.signal.value).toBe(42.5);

      // Mutate signal value
      wasmSignal.signal.value = 100.25;
      expect(view.getFloat64(0, true)).toBe(100.25);

      // Simulate native Wasm/Rust code mutating the memory directly
      view.setFloat64(0, 999.75, true);
      expect(wasmSignal.signal.value).toBe(100.25); // not synced yet
      wasmSignal.syncFromWasm();
      expect(wasmSignal.signal.value).toBe(999.75);
    });

    it('creates structured zero-copy signal mapping for multi-field structs (Rust/Zig ABI)', () => {
      const buffer = new ArrayBuffer(128);
      const struct = createWasmStruct(
        { memory: buffer },
        {
          fps: { offset: 0, type: 'i32', initial: 60 },
          physicsDelta: { offset: 4, type: 'f32', initial: 0.016 },
          energy: { offset: 8, type: 'f64', initial: 1000.5 }
        }
      );

      const view = new DataView(buffer);
      expect(view.getInt32(0, true)).toBe(60);
      expect(Math.fround(view.getFloat32(4, true))).toBe(Math.fround(0.016));
      expect(view.getFloat64(8, true)).toBe(1000.5);

      struct.fps.signal.value = 120;
      expect(view.getInt32(0, true)).toBe(120);
    });
  });

  describe('TypeSpec & WASI 0.2 WIT Contract Definitions', () => {
    it('defines and emits clean TypeSpec schema contracts', () => {
      const contract = defineContract({
        name: 'QuantumNodeState',
        namespace: 'Zuari.Engine',
        fields: [
          { name: 'id', type: 'string', doc: 'Node unique identifier' },
          { name: 'coherence', type: 'number' },
          { name: 'entangled', type: 'boolean', optional: true }
        ],
        doc: 'State payload emitted by native Zig quantum simulation kernel'
      });

      const tspOutput = emitTypeSpec(contract);
      expect(tspOutput).toContain('namespace Zuari.Engine;');
      expect(tspOutput).toContain('model QuantumNodeState {');
      expect(tspOutput).toContain('  /** Node unique identifier */');
      expect(tspOutput).toContain('  id: string;');
      expect(tspOutput).toContain('  coherence: number;');
      expect(tspOutput).toContain('  entangled?: boolean;');
    });

    it('creates component contracts cleanly', () => {
      const contract = createComponentContract('ButtonProps', {
        label: { type: 'string' },
        disabled: { type: 'boolean', optional: true }
      });

      expect(contract.name).toBe('ButtonProps');
      expect(contract.fields).toHaveLength(2);
      const tsp = emitTypeSpec(contract);
      expect(tsp).toContain('model ButtonProps {');
      expect(tsp).toContain('label: string;');
      expect(tsp).toContain('disabled?: boolean;');
    });

    it('parses WASI 0.2 .wit records alongside TypeSpec and binds zero-copy signals', () => {
      const wit = `
        record telemetry-frame {
          frame-id: u32,
          gpu-temp: f32,
          clock-drift: f64
        }
      `;
      const spec = parseWitRecord(wit, 'telemetry-frame');
      expect(spec.byteSize).toBe(16);

      const tspContract = witRecordToTypeSpec(spec);
      expect(emitTypeSpec(tspContract)).toContain('model telemetry-frame');

      const memory = new ArrayBuffer(32);
      const signals = createWitStructSignals({ memory }, wit, 'telemetry-frame');
      signals.frameId!.signal.value = 144;
      const view = new DataView(memory);
      expect(view.getUint32(0, true)).toBe(144);
    });
  });

  describe('Polyglot Systems Language Emitter & Live Wasm VM Kernel', () => {
    it('emits identical zero-copy byte layouts across Rust, Zig, C++23, Go, Python, and WGSL', async () => {
      const { createPolyglotKernelBridge, instantiateEmbeddedWasmKernel } = await import('./polyglot/index.js');
      const buffer = new ArrayBuffer(64);
      const bridge = createPolyglotKernelBridge(
        { memory: buffer },
        {
          name: 'OrbitalState',
          purpose: 'High-frequency orbital mechanics & GPU telemetry packet',
          fields: [
            { name: 'epochTick', type: 'u32', initial: 1024 },
            { name: 'velocityKms', type: 'f64', initial: 7.66 },
            { name: 'shieldFlux', type: 'f32', initial: 0.98 }
          ]
        }
      );

      expect(bridge.layout.byteSize).toBe(24);
      expect(bridge.signals.epochTick!.offset).toBe(0);
      expect(bridge.signals.velocityKms!.offset).toBe(8);
      expect(bridge.signals.shieldFlux!.offset).toBe(16);

      expect(bridge.emitSource('rust')).toContain('#[repr(C)]');
      expect(bridge.emitSource('zig')).toContain('extern struct');
      expect(bridge.emitSource('cpp')).toContain('struct alignas(8) OrbitalState');
      expect(bridge.emitSource('go')).toContain('type OrbitalState struct');
      expect(bridge.emitSource('python')).toContain('ctypes.LittleEndianStructure');
      expect(bridge.emitSource('wgsl')).toContain('struct OrbitalState');

      const wasmKernel = instantiateEmbeddedWasmKernel();
      expect(wasmKernel.bytecodeSize).toBeGreaterThan(30);
      expect(wasmKernel.stepHarmonic(10, 5, 2)).toBe(20);
    });
  });
});


