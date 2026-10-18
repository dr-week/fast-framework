/**
 * @fileoverview Autonomous Background Workflow Scheduler for Zuari.
 * Executes self-healing tasks, telemetry rollups, and cache prefetching without blocking the UI thread.
 */

import { signal, effect, type Signal } from '@zuari/signals';

export interface AutomationTask {
  readonly id: string;
  readonly intervalMs: number;
  readonly execute: () => Promise<void> | void;
}

export interface AutomationScheduler {
  readonly activeTasks: Signal<number>;
  register(task: AutomationTask): () => void;
  stopAll(): void;
}

export function createAutomationScheduler(): AutomationScheduler {
  const activeTasks = signal<number>(0);
  const timers = new Map<string, number>();

  function register(task: AutomationTask): () => void {
    if (timers.has(task.id)) {
      clearInterval(timers.get(task.id));
    }

    const timerId = window.setInterval(async () => {
      try {
        await task.execute();
      } catch (err) {
        console.warn(`[Zuari Automation] Task "${task.id}" execution error:`, err);
      }
    }, task.intervalMs);

    timers.set(task.id, timerId);
    activeTasks.value = timers.size;

    return () => {
      if (timers.has(task.id)) {
        clearInterval(timers.get(task.id));
        timers.delete(task.id);
        activeTasks.value = timers.size;
      }
    };
  }

  function stopAll(): void {
    for (const [, timerId] of timers) {
      clearInterval(timerId);
    }
    timers.clear();
    activeTasks.value = 0;
  }

  return {
    activeTasks,
    register,
    stopAll
  };
}
