import { describe, it, expect, vi } from 'vitest';
import { createTransition } from './index.js';

describe('@zuari/dom View Transitions API Engine', () => {
  it('initializes with idle transition state', () => {
    const t = createTransition();
    expect(t.isTransitioning.value).toBe(false);
  });

  it('executes mutation callback and restores idle state', async () => {
    const t = createTransition();
    const mutationSpy = vi.fn();

    await t.start(async () => {
      mutationSpy();
    });

    expect(mutationSpy).toHaveBeenCalledTimes(1);
    expect(t.isTransitioning.value).toBe(false);
  });

  it('delegates to native startViewTransition when available', async () => {
    const t = createTransition();
    const mockFinished = Promise.resolve();
    const mockStart = vi.fn((cb: () => void) => {
      cb();
      return {
        finished: mockFinished,
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: () => {}
      };
    });

    // Mock document.startViewTransition
    (document as unknown as { startViewTransition: unknown }).startViewTransition = mockStart;

    await t.start(() => {});
    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(t.isTransitioning.value).toBe(false);

    // Cleanup mock
    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition;
  });
});
