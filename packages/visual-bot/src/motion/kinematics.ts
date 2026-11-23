/**
 * @fileoverview Biometric Human Motion & Stochastic Dynamics Synthesizer.
 * Generates natural cubic Bezier pointer trajectories with micro-tremor,
 * Box-Muller Gaussian delays, keystroke cadence, and stochastic scroll steps.
 */

import type { BezierPathPoint, ScrollStep } from '../types.js';

export interface BezierPathOptions {
  steps?: number;
  deviation?: number;
  tremorAmplitude?: number;
  rng?: () => number;
}

export interface KeystrokeOptions {
  mean?: number;
  stdDev?: number;
  rng?: () => number;
}

/**
 * Generates a cubic Bezier curve trajectory between two points with
 * ease-in/out acceleration and endpoint-exact micro hand-tremor.
 */
export function generateBezierPath(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  options: BezierPathOptions = {}
): BezierPathPoint[] {
  const rng = options.rng ?? Math.random;
  const steps =
    options.steps ??
    Math.max(15, Math.floor(Math.hypot(targetX - startX, targetY - startY) / 18));
  const deviation = options.deviation ?? 40;
  const tremorAmplitude = options.tremorAmplitude ?? 1.5;

  const midX = (startX + targetX) / 2;
  const midY = (startY + targetY) / 2;

  const cp1X = startX + (midX - startX) * 0.5 + (rng() - 0.5) * deviation;
  const cp1Y = startY + (midY - startY) * 0.5 + (rng() - 0.5) * deviation;
  const cp2X = midX + (targetX - midX) * 0.5 + (rng() - 0.5) * deviation;
  const cp2Y = midY + (targetY - midY) * 0.5 + (rng() - 0.5) * deviation;

  const path: BezierPathPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const inv = 1 - easeT;

    const x =
      inv * inv * inv * startX +
      3 * inv * inv * easeT * cp1X +
      3 * inv * easeT * easeT * cp2X +
      easeT * easeT * easeT * targetX;
    const y =
      inv * inv * inv * startY +
      3 * inv * inv * easeT * cp1Y +
      3 * inv * easeT * easeT * cp2Y +
      easeT * easeT * easeT * targetY;

    const isEndpoint = i === 0 || i === steps;
    const tremorX = isEndpoint ? 0 : (rng() - 0.5) * tremorAmplitude;
    const tremorY = isEndpoint ? 0 : (rng() - 0.5) * tremorAmplitude;

    path.push({ x: Math.round(x + tremorX), y: Math.round(y + tremorY), t });
  }

  return path;
}

/**
 * Returns a Gaussian (Normal) random delay using the Box-Muller transform.
 */
export function gaussianRandom(mean = 110, stdDev = 35, rng: () => number = Math.random): number {
  let u = rng();
  let v = rng();
  if (u <= 0) u = 0.0001;
  if (v <= 0) v = 0.0001;
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(30, Math.round(mean + z * stdDev));
}

/**
 * Generates a bounded human-like randomized delay using Box-Muller jitter.
 */
export function computeHumanJitterMs(
  baseMs = 140,
  varianceMs = 90,
  rng: () => number = Math.random
): number {
  const u1 = Math.max(0.0001, rng());
  const u2 = rng();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const jitter = Math.round(baseMs + z * varianceMs);
  return Math.max(45, Math.min(baseMs * 3, jitter));
}

/**
 * Sleeps for a randomized human cognitive reading pause before interacting.
 */
export function cognitivePause(
  minMs = 180,
  maxMs = 520,
  rng: () => number = Math.random
): Promise<void> {
  const ms = Math.floor(minMs + rng() * (maxMs - minMs));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculates human keystroke timing with contextual punctuation pauses.
 */
export function getKeystrokeDelay(char: string, options: KeystrokeOptions = {}): number {
  const rng = options.rng ?? Math.random;
  const baseMean = options.mean ?? 110;
  const baseStdDev = options.stdDev ?? 35;
  let delay = gaussianRandom(baseMean, baseStdDev, rng);

  if (char === '.' || char === '!' || char === '?' || char === '\n') {
    delay += Math.floor(rng() * 120) + 160;
  } else if (char === ',' || char === ';' || char === ':') {
    delay += Math.floor(rng() * 70) + 90;
  } else if (char === ' ') {
    delay += Math.floor(rng() * 40) + 20;
  }

  return delay;
}

/**
 * Generates natural chunked browsing scroll steps with stochastic reading pauses.
 */
export function generateHumanScrollSteps(
  totalPixels: number,
  options: { pauseProbability?: number; rng?: () => number } = {}
): ScrollStep[] {
  const rng = options.rng ?? Math.random;
  const pauseProbability = options.pauseProbability ?? 0.18;
  const direction = totalPixels >= 0 ? 1 : -1;
  let remaining = Math.abs(totalPixels);
  const steps: ScrollStep[] = [];

  while (remaining > 0) {
    const chunk = Math.min(remaining, Math.floor(rng() * 80) + 40);
    const stepDelay = Math.floor(rng() * 25) + 15;
    remaining -= chunk;
    steps.push({ deltaY: chunk * direction, delayMs: stepDelay });

    if (rng() < pauseProbability) {
      steps.push({
        deltaY: 0,
        delayMs: Math.floor(rng() * 1200) + 600,
        isReadingPause: true,
      });
    }
  }

  return steps;
}
