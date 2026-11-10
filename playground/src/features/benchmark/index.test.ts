import { describe, expect, it, vi } from 'vitest';
import { createProofBenchView, ZUARI_BUNDLE_MANIFEST } from './index.js';

describe('@zuari/playground benchmark feature', () => {
  it('renders the stress benchmark and updates interaction telemetry when run', () => {
    const onInteract = vi.fn();
    const bench = createProofBenchView(onInteract);
    document.body.appendChild(bench);

    expect(ZUARI_BUNDLE_MANIFEST.length).toBeGreaterThanOrEqual(5);
    expect(bench.innerHTML).toContain('Krausest Stress Test');
    expect(bench.innerHTML).toContain('@zuari/signals');

    bench.querySelector<HTMLButtonElement>('.repl-action-btn')!.click();
    expect(onInteract).toHaveBeenCalled();
    document.body.removeChild(bench);
  });
});
