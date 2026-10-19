import { describe, it, expect } from 'vitest';
import { signal } from '@zuari/signals';
import { zuariDevTools } from './index.js';

describe('@zuari/devtools Engine', () => {
  it('registers signals and tracks values dynamically', () => {
    const testSig = signal(42);
    zuariDevTools.registerSignal('sig_1', 'Counter', testSig);

    const record = zuariDevTools.state.signals.get('sig_1');
    expect(record).toBeDefined();
    expect(record?.label).toBe('Counter');
    expect(record?.value).toBe(42);

    testSig.value = 100;
    expect(zuariDevTools.state.signals.get('sig_1')?.value).toBe(100);
  });

  it('registers Wasm linear memory buffers for inspection', () => {
    zuariDevTools.registerWasmBuffer('wasm_buf_0', 1024, 0x1000, 'f32_vec4');
    const buf = zuariDevTools.state.buffers.get('wasm_buf_0');
    expect(buf).toBeDefined();
    expect(buf?.byteLength).toBe(1024);
    expect(buf?.format).toBe('f32_vec4');
  });

  it('increments DOM parts tracking', () => {
    const initial = zuariDevTools.state.activePartsCount.value;
    zuariDevTools.incrementParts(3);
    expect(zuariDevTools.state.activePartsCount.value).toBe(initial + 3);
  });

  it('mounts DevTools HUD into DOM and cleans up', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const teardown = zuariDevTools.mountOverlay(container);
    expect(container.querySelector('#zuari-devtools-hud')).not.toBeNull();

    teardown();
    expect(container.querySelector('#zuari-devtools-hud')).toBeNull();
  });
});
