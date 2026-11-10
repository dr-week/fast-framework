import { describe, expect, it, vi } from 'vitest';
import { signal } from '@zuari/signals';
import type { ActiveTab } from '../state.js';
import { createFeatureDeck } from './index.js';

describe('feature mission deck', () => {
  it('reveals missions, launches the selected station, and tracks progress', () => {
    const currentTab = signal<ActiveTab>('repl');
    const onOpenDemo = vi.fn();
    const onInteraction = vi.fn();
    const deck = createFeatureDeck({
      getActiveTab: () => currentTab.value,
      onSelect: (tab) => { currentTab.value = tab; },
      onOpenDemo,
      onInteraction
    });
    const cards = deck.querySelectorAll<HTMLElement>('.feature-flashcard');
    const scaleCard = deck.querySelector<HTMLElement>('[data-feature="bench"]')!;

    expect(cards).toHaveLength(8);
    expect(deck.querySelector('[data-feature="repl"]')?.dataset.active).toBe('true');
    expect(scaleCard.style.getPropertyValue('--card-artwork')).toContain('images/arcade/star-arc.jpg');
    expect(scaleCard.style.getPropertyValue('--mission-artwork')).toContain('images/arcade/grid-horizon.jpg');
    expect(deck.querySelector('.feature-deck-eyebrow')).toBeNull();
    expect(deck.querySelector('.feature-flashcard-art')).toBeNull();
    expect(scaleCard.querySelector('.feature-flashcard-icon svg')).not.toBeNull();

    scaleCard.querySelector<HTMLButtonElement>('[data-action="reveal"]')!.click();
    expect(scaleCard.dataset.face).toBe('mission');
    expect(scaleCard.querySelector('.feature-flashcard-mission')?.textContent).toContain('5,000-node');
    expect(scaleCard.querySelector('.feature-flashcard-face--front')?.getAttribute('aria-hidden')).toBe('true');

    scaleCard.querySelector<HTMLButtonElement>('[data-action="launch"]')!.click();

    expect(currentTab.value).toBe('bench');
    expect(scaleCard.dataset.active).toBe('true');
    expect((deck.querySelector('.feature-deck-progress') as HTMLProgressElement).value).toBe(1);
    expect(deck.querySelector('.feature-deck-progress-copy')?.textContent).toBe('1 / 8 stations explored');
    expect(onOpenDemo).toHaveBeenCalledOnce();
    expect(onInteraction).toHaveBeenCalledTimes(2);
  });
});
