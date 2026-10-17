import { describe, it, expect, vi } from 'vitest';
import { signal, computed, effect, batch } from '../src/index.js';

describe('@zuari/signals', () => {
  it('creates an atomic signal and reads initial value', () => {
    const s = signal(10);
    expect(s.value).toBe(10);
    expect(s.peek()).toBe(10);
  });

  it('mutates value and triggers subscribers', () => {
    const s = signal('initial');
    s.value = 'updated';
    expect(s.value).toBe('updated');
  });

  it('does not re-trigger subscribers if assigned the exact same value', () => {
    const s = signal(5);
    const fn = vi.fn();
    effect(() => {
      fn(s.value);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    s.value = 5; // same value
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('correctly tracks and updates derived computed values', () => {
    const count = signal(2);
    const multiplier = signal(3);
    const total = computed(() => count.value * multiplier.value);

    expect(total.value).toBe(6);

    count.value = 4;
    expect(total.value).toBe(12);

    multiplier.value = 5;
    expect(total.value).toBe(20);
  });

  it('runs side effects and cleans up on update and disposal', () => {
    const name = signal('Alpha');
    const cleanupSpy = vi.fn();
    const effectSpy = vi.fn();

    const dispose = effect(() => {
      effectSpy(name.value);
      return () => {
        cleanupSpy();
      };
    });

    expect(effectSpy).toHaveBeenCalledWith('Alpha');
    expect(cleanupSpy).not.toHaveBeenCalled();

    name.value = 'Beta';
    expect(cleanupSpy).toHaveBeenCalledTimes(1);
    expect(effectSpy).toHaveBeenCalledWith('Beta');

    dispose();
    expect(cleanupSpy).toHaveBeenCalledTimes(2);

    // After dispose, state change should not trigger effect
    name.value = 'Gamma';
    expect(effectSpy).toHaveBeenCalledTimes(2);
  });

  it('synchronously batches multiple signal updates into one notification cycle', () => {
    const a = signal(1);
    const b = signal(10);
    const listener = vi.fn();

    effect(() => {
      listener(a.value + b.value);
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(11);

    batch(() => {
      a.value = 2;
      b.value = 20;
    });

    // Should only notify ONCE for the entire batch
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(22);
  });

  it('handles dynamic conditional branching dependencies correctly', () => {
    const condition = signal(true);
    const onTrue = signal('TRUE_BRANCH');
    const onFalse = signal('FALSE_BRANCH');

    const result = computed(() => (condition.value ? onTrue.value : onFalse.value));

    expect(result.value).toBe('TRUE_BRANCH');

    // Mutating onFalse should NOT trigger result recomputation yet
    onFalse.value = 'FALSE_BRANCH_2';
    expect(result.value).toBe('TRUE_BRANCH');

    // Switch branch
    condition.value = false;
    expect(result.value).toBe('FALSE_BRANCH_2');

    // Now mutating onTrue should NOT affect it
    onTrue.value = 'TRUE_MUTATED';
    expect(result.value).toBe('FALSE_BRANCH_2');
  });
});
