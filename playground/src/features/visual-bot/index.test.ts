import { describe, expect, it, vi } from 'vitest';
import { createVisualBotStudio } from './index.js';

describe('visual-bot playground studio', () => {
  it('scans Set-of-Mark targets, blocks sensitive controls, self-heals selectors, and computes Sobel + Bezier', () => {
    const onInteraction = vi.fn();
    const studio = createVisualBotStudio(onInteraction);
    document.body.appendChild(studio);

    // Ensure non-zero rects in Happy-DOM for sandbox controls
    studio.querySelectorAll('[data-vb-sandbox] button, [data-vb-sandbox] input').forEach((el) => {
      (el as HTMLElement).getBoundingClientRect = () =>
        ({ x: 10, y: 10, width: 100, height: 32 } as DOMRect);
    });

    studio.querySelector<HTMLButtonElement>('[data-action="vb-scan"]')!.click();
    expect(studio.querySelector('[data-vb-indexed]')?.textContent).toBe('2');
    expect(studio.querySelector('[data-vb-blocked]')?.textContent).toBe('2');

    studio.querySelector<HTMLButtonElement>('[data-action="vb-heal"]')!.click();
    expect(studio.querySelector('[data-vb-selector]')?.textContent).toBe(
      'button[aria-label="Approve Action"]'
    );

    studio.querySelector<HTMLButtonElement>('[data-action="vb-vision"]')!.click();
    expect(studio.querySelector('[data-vb-bezier]')?.textContent).toContain('19 Bezier pts');
    expect(studio.querySelector('[data-vb-vision]')?.textContent).toContain('100.0%');
    expect(onInteraction).toHaveBeenCalledTimes(3);

    studio.remove();
  });
});
