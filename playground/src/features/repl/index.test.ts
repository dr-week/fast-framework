import { describe, it, expect, vi } from 'vitest';
import { REPL_PRESETS, createReplView } from './index.js';

describe('@zuari/playground Interactive REPL & Proof Benchmarks', () => {
  it('exposes 7 turnkey interactive REPL presets (Direct DOM, Spatial HUD, Wasm FFI, Hardware, Quantum, Drawer, Liquid Glass)', () => {
    expect(REPL_PRESETS.length).toBe(7);
    expect(REPL_PRESETS.map((p) => p.id)).toEqual([
      'counter',
      'spatial-hud',
      'wasm-ffi',
      'hardware-hud',
      'quantum-state',
      'smooth-drawer',
      'liquid-glass'
    ]);
  });

  it('mounts the live in-browser REPL, executes user code, and switches presets', () => {
    const onInteract = vi.fn();
    const replEl = createReplView(onInteract);
    document.body.appendChild(replEl);

    const preview = replEl.querySelector('.repl-preview-stage')!;
    expect(preview.innerHTML).toContain('0ms Hydration');

    // Switch to Wasm FFI preset
    const presetBtns = replEl.querySelectorAll<HTMLButtonElement>('.repl-preset-btn');
    expect(presetBtns.length).toBe(7);
    presetBtns[2]!.click();

    expect(onInteract).toHaveBeenCalled();
    expect(preview.innerHTML).toContain('Zero Serialization');

    // Switch to Quantum preset
    presetBtns[4]!.click();
    expect(preview.innerHTML).toContain('@zuari/quantum');

    // Switch to Liquid Glass preset
    presetBtns[6]!.click();
    expect(preview.querySelector('[data-zuari-optics="liquid-glass"]')).not.toBeNull();

    document.body.removeChild(replEl);
  });
});
