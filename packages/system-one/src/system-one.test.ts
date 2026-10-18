import { describe, it, expect, vi } from 'vitest';
import { createSystemOne, FastLogRingBuffer, createAutomationScheduler } from './index.js';

describe('@zuari/system-one Fast Reflex & Fast-Log Engine', () => {
  it('logs high-frequency events into pre-allocated circular ring buffer without allocation', () => {
    const ring = new FastLogRingBuffer(16);
    expect(ring.count).toBe(0);

    const rec = ring.push(101, 1, 42.5);
    expect(ring.count).toBe(1);
    expect(rec.eventCode).toBe(101);
    expect(rec.payloadFloat).toBe(42.5);

    // Drain buffer
    const raw = ring.drain();
    expect(raw.length).toBe(4);
    expect(raw[1]).toBe(101);
    expect(raw[2]).toBe(1);
    expect(raw[3]).toBe(42.5);
  });

  it('triggers sub-millisecond System 1 fast reflexes upon telemetry thresholds', () => {
    const sys1 = createSystemOne({ intentThreshold: 0.8 });

    // Register an intuitive reflex (predicting navigation to checkout if cursor speed crosses threshold)
    sys1.registerReflex(1, (velocity) => {
      if (velocity > 150) {
        return {
          targetSelector: '#checkout-button',
          probability: 0.92,
          latencyScoreMs: 0.4
        };
      }
      return null;
    });

    expect(sys1.predictedIntent.value).toBeNull();

    // Push slow velocity (below threshold)
    sys1.recordFastLog(1, 1, 50);
    expect(sys1.predictedIntent.value).toBeNull();

    // Push rapid velocity spike -> System 1 reflex fires
    sys1.recordFastLog(1, 1, 220);
    expect(sys1.predictedIntent.value).not.toBeNull();
    expect(sys1.predictedIntent.value?.targetSelector).toBe('#checkout-button');
    expect(sys1.predictedIntent.value?.probability).toBe(0.92);
  });

  it('schedules autonomous background tasks and cleans up safely', () => {
    const scheduler = createAutomationScheduler();
    const taskSpy = vi.fn();

    const unregister = scheduler.register({
      id: 'telemetry-rollup',
      intervalMs: 100,
      execute: taskSpy
    });

    expect(scheduler.activeTasks.value).toBe(1);

    unregister();
    expect(scheduler.activeTasks.value).toBe(0);
  });
});
