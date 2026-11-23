import { describe, expect, it } from 'vitest';
import {
  computeHumanJitterMs,
  gaussianRandom,
  generateBezierPath,
  generateHumanScrollSteps,
  getKeystrokeDelay,
} from '../motion/index.js';
import { createInteractionRecorder } from '../recorder/index.js';

describe('@zuari/visual-bot/motion & recorder', () => {
  it('generates endpoint-exact Bezier trajectories, bounded jitter, keystrokes, and scroll steps', () => {
    const path = generateBezierPath(10, 20, 210, 140, { steps: 20 });
    expect(path.length).toBe(21);
    expect(path[0]).toEqual({ x: 10, y: 20, t: 0 });
    expect(path[20]).toEqual({ x: 210, y: 140, t: 1 });

    const jitter = computeHumanJitterMs(140, 90);
    expect(jitter).toBeGreaterThanOrEqual(45);
    expect(jitter).toBeLessThanOrEqual(420);

    expect(gaussianRandom(110, 35)).toBeGreaterThanOrEqual(30);
    const periodDelay = getKeystrokeDelay('.', { rng: () => 0.5 });
    const letterDelay = getKeystrokeDelay('a', { rng: () => 0.5 });
    expect(periodDelay).toBeGreaterThan(letterDelay);

    const scrollSteps = generateHumanScrollSteps(300, { rng: () => 0.1 });
    const totalScroll = scrollSteps.reduce((acc, s) => acc + s.deltaY, 0);
    expect(totalScroll).toBe(300);
    expect(scrollSteps.some((s) => s.isReadingPause)).toBe(true);
  });

  it('records safe interactions, blocks sensitive/unsafe targets, and self-heals on replay', async () => {
    document.body.innerHTML = `
      <div>
        <button data-testid="filter-btn" aria-label="Filter results">Filter</button>
        <button data-testid="danger-btn" aria-label="Delete account">Delete</button>
        <input data-testid="search-box" type="text" placeholder="Search items" />
        <input data-testid="pass-box" type="password" placeholder="Password" />
      </div>
    `;

    let filterClicks = 0;
    const filterBtn = document.querySelector('[data-testid="filter-btn"]') as HTMLButtonElement;
    filterBtn.addEventListener('click', () => {
      filterClicks++;
    });

    const recorder = createInteractionRecorder({ stepDelayMs: 0, doc: document, win: window });
    recorder.start();
    expect(recorder.recording.value).toBe(true);

    filterBtn.click();
    (document.querySelector('[data-testid="danger-btn"]') as HTMLButtonElement).click();

    const searchInput = document.querySelector('[data-testid="search-box"]') as HTMLInputElement;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    const passInput = document.querySelector('[data-testid="pass-box"]') as HTMLInputElement;
    passInput.dispatchEvent(new Event('input', { bubbles: true }));

    const workflow = recorder.stop();
    expect(recorder.recording.value).toBe(false);
    expect(workflow.steps.length).toBe(2);
    expect(workflow.steps[0].action).toBe('click');
    expect(workflow.steps[1].action).toBe('fill');

    // Break selector on step 1 to verify Layer-2 Set-of-Mark self-healing during replay
    workflow.steps[0].selector = '[data-testid="stale-missing-id"]';
    workflow.steps[1].value = 'zuari';
    filterBtn.getBoundingClientRect = () => ({ x: 0, y: 0, width: 100, height: 32 } as DOMRect);

    const replayRes = await recorder.replay(workflow);
    expect(replayRes.success).toBe(true);
    expect(replayRes.results[0].healed).toBe(true);
    expect(filterClicks).toBe(2);
    expect(searchInput.value).toBe('zuari');

    recorder.destroy();
  });
});
