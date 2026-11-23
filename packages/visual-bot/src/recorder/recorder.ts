/**
 * @fileoverview Fail-Closed Interaction Recorder & Deterministic Workflow Replay.
 * Records safe click/fill/scroll steps while blocking sensitive inputs and destructive
 * actions. Supports optional Layer-2 Set-of-Mark self-healing during replay.
 */

import { signal, type Signal } from '@zuari/signals';
import type { RecordedStep, RecordedWorkflow } from '../types.js';
import { isSensitiveElement } from '../som/indexer.js';
import { resolveTargetWithCascade } from '../cascade/resolver.js';

const SAFE_ATTR_RE = /^[\w .:-]{1,80}$/;
const DEFAULT_UNSAFE_ACTION_RE =
  /\b(post|publish|submit|send|reply|comment|like|follow|unfollow|delete|remove|purchase|buy|pay|share|connect|invite)\b/i;

export interface InteractionRecorderOptions {
  maxSteps?: number;
  stepDelayMs?: number;
  unsafeActionPattern?: RegExp;
  selfHealOnReplay?: boolean;
  doc?: Document;
  win?: Window;
}

export interface ReplayStepResult {
  index: number;
  success: boolean;
  healed?: boolean;
  error?: string;
}

export interface InteractionRecorder {
  recording: Signal<boolean>;
  steps: Signal<RecordedStep[]>;
  start: () => { success: boolean; origin: string };
  stop: () => RecordedWorkflow;
  replay: (workflow: RecordedWorkflow) => Promise<{ success: boolean; results: ReplayStepResult[] }>;
  destroy: () => void;
}

function selectorFor(el: Element): string {
  const tag = el.tagName.toLowerCase();
  for (const attr of ['data-testid', 'aria-label', 'name', 'id', 'placeholder']) {
    const val = el.getAttribute(attr)?.trim();
    if (val && SAFE_ATTR_RE.test(val)) return `${tag}[${attr}="${val}"]`;
  }
  return '';
}

function labelFor(el: Element): string {
  for (const attr of ['aria-label', 'placeholder', 'name', 'data-testid']) {
    const val = el.getAttribute(attr)?.trim();
    if (val && SAFE_ATTR_RE.test(val)) return val;
  }
  return el.tagName.toLowerCase();
}

export function createInteractionRecorder(
  options: InteractionRecorderOptions = {}
): InteractionRecorder {
  const maxSteps = options.maxSteps ?? 100;
  const stepDelayMs = options.stepDelayMs ?? 120;
  const unsafeActionRe = options.unsafeActionPattern ?? DEFAULT_UNSAFE_ACTION_RE;
  const selfHeal = options.selfHealOnReplay ?? true;
  const doc = options.doc ?? document;
  const win = options.win ?? window;

  const recording = signal(false);
  const steps = signal<RecordedStep[]>([]);

  let lastScrollY = win.scrollY || 0;
  let scrollDelta = 0;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;

  function pushStep(step: Omit<RecordedStep, 'id'>): void {
    if (steps.value.length >= maxSteps) return;
    steps.value = [...steps.value, { id: String(steps.value.length + 1), ...step }];
  }

  function isSafeClickTarget(el: Element): boolean {
    if (el.tagName === 'A' || el.closest('form') || el.closest('a')) return false;
    if (el.getAttribute('type') === 'submit') return false;
    const text = `${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''} ${el.textContent || ''}`.trim();
    return !unsafeActionRe.test(text);
  }

  function onClick(event: Event): void {
    if (!recording.value || !(event.target instanceof Element)) return;
    const button = event.target.closest('button,[role="button"]');
    if (!button || !isSafeClickTarget(button)) return;
    const selector = selectorFor(button);
    if (!selector) return;
    pushStep({ action: 'click', selector, label: labelFor(button) });
  }

  function onInput(event: Event): void {
    if (!recording.value || !(event.target instanceof Element)) return;
    const field = event.target;
    const isEditable =
      field.tagName === 'INPUT' ||
      field.tagName === 'TEXTAREA' ||
      (field as HTMLElement).isContentEditable;
    if (!isEditable || isSensitiveElement(field)) return;
    const selector = selectorFor(field);
    if (!selector) return;
    const last = steps.value[steps.value.length - 1];
    if (last?.action === 'fill' && last.selector === selector) return;
    pushStep({ action: 'fill', selector, label: labelFor(field), value: '' });
  }

  function onScroll(): void {
    if (!recording.value) return;
    const y = win.scrollY || 0;
    scrollDelta += y - lastScrollY;
    lastScrollY = y;
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (scrollDelta) {
        pushStep({
          action: 'scroll',
          deltaY: Math.max(-2000, Math.min(2000, Math.round(scrollDelta))),
        });
      }
      scrollDelta = 0;
    }, 450);
  }

  function start(): { success: boolean; origin: string } {
    steps.value = [];
    lastScrollY = win.scrollY || 0;
    scrollDelta = 0;
    recording.value = true;
    doc.addEventListener('click', onClick, true);
    doc.addEventListener('input', onInput, true);
    win.addEventListener('scroll', onScroll, { passive: true });
    return { success: true, origin: win.location?.origin || '' };
  }

  function stop(): RecordedWorkflow {
    recording.value = false;
    doc.removeEventListener('click', onClick, true);
    doc.removeEventListener('input', onInput, true);
    win.removeEventListener('scroll', onScroll);
    if (scrollTimer) clearTimeout(scrollTimer);
    if (scrollDelta) {
      pushStep({
        action: 'scroll',
        deltaY: Math.max(-2000, Math.min(2000, Math.round(scrollDelta))),
      });
    }
    scrollDelta = 0;
    return { origin: win.location?.origin || '', steps: steps.value.slice() };
  }

  async function replay(
    workflow: RecordedWorkflow
  ): Promise<{ success: boolean; results: ReplayStepResult[] }> {
    const currentOrigin = win.location?.origin || '';
    if (
      !workflow ||
      workflow.origin !== currentOrigin ||
      !Array.isArray(workflow.steps) ||
      workflow.steps.length > maxSteps
    ) {
      return {
        success: false,
        results: [{ index: 0, success: false, error: 'Workflow origin does not match this page.' }],
      };
    }

    const results: ReplayStepResult[] = [];
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      if (!step) continue;
      try {
        let healed = false;
        if (step.action === 'wait') {
          const ms = Math.min(5000, Math.max(0, Number(step.durationMs) || 0));
          await new Promise((r) => setTimeout(r, ms));
        } else if (step.action === 'scroll') {
          const amount = Number(step.deltaY);
          if (!Number.isFinite(amount) || Math.abs(amount) > 2000) {
            throw new Error('Invalid scroll distance.');
          }
          win.scrollBy?.({ top: amount, behavior: 'smooth' });
        } else {
          let target = step.selector ? doc.querySelector(step.selector) : null;
          if (!target && selfHeal && step.label) {
            const res = resolveTargetWithCascade({
              query: step.label,
              ...(step.selector ? { cachedSelector: step.selector } : {}),
              root: doc,
            });
            if (res.found && res.selector) {
              target = doc.querySelector(res.selector);
              healed = res.healed;
            }
          }
          if (!target) throw new Error('Target is not on this page.');

          if (step.action === 'click') {
            if (!isSafeClickTarget(target)) throw new Error('This control is not replayable.');
            (target as HTMLElement).click();
          } else if (step.action === 'fill') {
            if (isSensitiveElement(target)) throw new Error('This field is not replayable.');
            const val = String(step.value || '');
            if (!val.trim()) throw new Error('Empty fill value.');
            (target as HTMLElement).focus?.();
            if ((target as HTMLElement).isContentEditable) {
              target.textContent = val;
            } else {
              (target as HTMLInputElement).value = val;
            }
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            throw new Error('Unsupported step.');
          }
          if (stepDelayMs > 0) await new Promise((r) => setTimeout(r, stepDelayMs));
        }
        results.push({ index: i + 1, success: true, ...(healed ? { healed: true } : {}) });
      } catch (err) {
        results.push({
          index: i + 1,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
        break;
      }
    }

    return { success: results.every((r) => r.success), results };
  }

  function destroy(): void {
    if (recording.value) stop();
    steps.value = [];
  }

  return { recording, steps, start, stop, replay, destroy };
}
