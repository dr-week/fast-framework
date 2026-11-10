import { describe, expect, it, vi } from 'vitest';
import { createCoreShowcase } from './core.js';

describe('kinetic showcase feature', () => {
  it('supports keyboard activation of the vector morph control', () => {
    const onInteraction = vi.fn();
    const showcase = createCoreShowcase(onInteraction);
    const control = showcase.querySelector<HTMLElement>('[role="button"]')!;

    control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(onInteraction).toHaveBeenCalledTimes(1);
  });
});
