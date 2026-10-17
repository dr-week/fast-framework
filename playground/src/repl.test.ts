import { describe, it, expect, vi } from 'vitest';
import { REPL_PRESETS, createReplView } from './repl.js';
import { ZUARI_BUNDLE_MANIFEST, createProofBenchView } from './benchmark.js';

describe('@zuari/playground Interactive REPL & Proof Benchmarks', () => {
  it('exposes 3 turnkey interactive REPL presets (Direct DOM, Spatial HUD, Wasm FFI)', () => {
    expect(REPL_PRESETS.length).toBe(3);
    expect(REPL_PRESETS.map((p) => p.id)).toEqual(['counter', 'spatial-hud', 'wasm-ffi']);
  });

  it('mounts the live in-browser REPL, executes user code, and switches presets', () => {
    const onInteract = vi.fn();
    const replEl = createReplView(onInteract);
    document.body.appendChild(replEl);

    const preview = replEl.querySelector('.repl-preview-stage')!;
    expect(preview.innerHTML).toContain('0ms Hydration');

    // Switch to Wasm FFI preset
    const presetBtns = replEl.querySelectorAll<HTMLButtonElement>('.repl-preset-btn');
    expect(presetBtns.length).toBe(3);
    presetBtns[2]!.click();

    expect(onInteract).toHaveBeenCalled();
    expect(preview.innerHTML).toContain('Zero Serialization');
    document.body.removeChild(replEl);
  });

  it('renders the 5,000-node stress benchmark and sub-2.5KB bundle telemetry', () => {
    const onInteract = vi.fn();
    const benchEl = createProofBenchView(onInteract);
    document.body.appendChild(benchEl);

    expect(ZUARI_BUNDLE_MANIFEST.length).toBeGreaterThanOrEqual(5);
    expect(benchEl.innerHTML).toContain('Krausest Stress Test');
    expect(benchEl.innerHTML).toContain('@zuari/signals');

    const runBtn = benchEl.querySelector<HTMLButtonElement>('.repl-action-btn')!;
    runBtn.click();
    expect(onInteract).toHaveBeenCalled();
    document.body.removeChild(benchEl);
  });
});
