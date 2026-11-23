/**
 * @fileoverview Pluggable Multi-Platform Driver Contract & Biometric Action Runner.
 * Allows the same automation logic to run across Browser DOM, Chrome Extensions,
 * Playwright/CDP, Headless Mocks, or Android ADB devices.
 */

import type {
  BezierPathPoint,
  CascadeResolution,
  CascadeResolveOptions,
  Point2D,
  ScrollStep,
} from '../types.js';
import {
  generateBezierPath,
  generateHumanScrollSteps,
  getKeystrokeDelay,
} from '../motion/kinematics.js';
import { createQuotaGuard, type QuotaGuard } from '../runtime/quota.js';

export interface BotDriver {
  readonly name: string;
  move: (x: number, y: number) => void | Promise<void>;
  click: (x: number, y: number) => void | Promise<void>;
  type: (text: string) => void | Promise<void>;
  scroll: (deltaY: number) => void | Promise<void>;
  resolve?: (
    targetKey: string,
    options?: Omit<CascadeResolveOptions, 'cachedSelector' | 'onHealSelector'>
  ) => CascadeResolution | Promise<CascadeResolution>;
}

export interface ActionRunnerOptions {
  quota?: QuotaGuard;
  maxActionsPerHour?: number;
  simulateDelays?: boolean;
  startPosition?: Point2D;
}

export interface ActionLogEntry {
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
}

export interface ActionRunner {
  readonly driver: BotDriver;
  readonly quota: QuotaGuard;
  getPosition: () => Point2D;
  getLog: () => ActionLogEntry[];
  humanMove: (targetX: number, targetY: number) => Promise<{ path: BezierPathPoint[] }>;
  humanClick: (targetX: number, targetY: number) => Promise<{ path: BezierPathPoint[] }>;
  humanType: (text: string) => Promise<{ totalDelayMs: number; keystrokes: number }>;
  scrollAndRead: (pixels?: number) => Promise<{ steps: ScrollStep[]; readPauses: number }>;
  resolveAndClick: (
    targetKey: string,
    options?: Omit<CascadeResolveOptions, 'cachedSelector' | 'onHealSelector'>
  ) => Promise<CascadeResolution>;
}

export function createActionRunner(
  driver: BotDriver,
  options: ActionRunnerOptions = {}
): ActionRunner {
  const quota =
    options.quota ?? createQuotaGuard({ maxPerWindow: options.maxActionsPerHour ?? 30 });
  const simulateDelays = options.simulateDelays ?? false;
  let pos: Point2D = { ...(options.startPosition ?? { x: 100, y: 100 }) };
  const log: ActionLogEntry[] = [];

  function pushLog(action: string, details: Record<string, unknown>): void {
    log.push({ timestamp: new Date().toISOString(), action, details });
    if (log.length > 200) log.shift();
  }

  async function sleep(ms: number): Promise<void> {
    if (simulateDelays && ms > 0) {
      await new Promise((r) => setTimeout(r, ms));
    }
  }

  async function humanMove(targetX: number, targetY: number): Promise<{ path: BezierPathPoint[] }> {
    const path = generateBezierPath(pos.x, pos.y, targetX, targetY);
    for (const pt of path) {
      await driver.move(pt.x, pt.y);
    }
    pos = { x: targetX, y: targetY };
    pushLog('human_move', { targetX, targetY, points: path.length });
    return { path };
  }

  async function humanClick(targetX: number, targetY: number): Promise<{ path: BezierPathPoint[] }> {
    quota.record();
    const { path } = await humanMove(targetX, targetY);
    await driver.click(targetX, targetY);
    pushLog('human_click', { targetX, targetY });
    return { path };
  }

  async function humanType(text: string): Promise<{ totalDelayMs: number; keystrokes: number }> {
    quota.record();
    let totalDelayMs = 0;
    const chars = Array.from(String(text));
    for (const ch of chars) {
      const delay = getKeystrokeDelay(ch);
      totalDelayMs += delay;
      await sleep(delay);
    }
    await driver.type(text);
    pushLog('human_type', { length: chars.length, totalDelayMs });
    return { totalDelayMs, keystrokes: chars.length };
  }

  async function scrollAndRead(pixels = 600): Promise<{ steps: ScrollStep[]; readPauses: number }> {
    const steps = generateHumanScrollSteps(pixels);
    let readPauses = 0;
    for (const step of steps) {
      if (step.isReadingPause) {
        readPauses++;
      } else if (step.deltaY !== 0) {
        await driver.scroll(step.deltaY);
      }
      await sleep(step.delayMs);
    }
    pushLog('scroll_and_read', { pixels, steps: steps.length, readPauses });
    return { steps, readPauses };
  }

  async function resolveAndClick(
    targetKey: string,
    resolveOpts?: Omit<CascadeResolveOptions, 'cachedSelector' | 'onHealSelector'>
  ): Promise<CascadeResolution> {
    if (!driver.resolve) {
      return { found: false, layer: 0, healed: false, durationMs: 0 };
    }
    const res = await driver.resolve(targetKey, resolveOpts);
    if (res.found) {
      const cx = res.center?.x ?? (res.rect ? Math.round(res.rect.x + res.rect.width / 2) : pos.x);
      const cy = res.center?.y ?? (res.rect ? Math.round(res.rect.y + res.rect.height / 2) : pos.y);
      await humanClick(cx, cy);
    }
    return res;
  }

  return {
    driver,
    quota,
    getPosition: () => ({ ...pos }),
    getLog: () => log.slice(),
    humanMove,
    humanClick,
    humanType,
    scrollAndRead,
    resolveAndClick,
  };
}
