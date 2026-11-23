import { describe, expect, it } from 'vitest';
import {
  clearSetOfMarkOverlay,
  indexInteractiveDom,
  isSensitiveElement,
  querySemanticMark,
  renderSetOfMarkOverlay,
} from '../som/index.js';
import { createVisualBot, resolveTargetWithCascade } from '../cascade/index.js';
import type { DomElementLike, DomRootLike } from '../types.js';

function mkEl(
  tag: string,
  attrs: Record<string, string> = {},
  text = '',
  rect = { x: 10, y: 20, width: 120, height: 36 }
): DomElementLike {
  return {
    tagName: tag.toUpperCase(),
    id: attrs.id || '',
    textContent: text,
    getAttribute: (k: string) => attrs[k] ?? null,
    getBoundingClientRect: () => rect,
  };
}

describe('@zuari/visual-bot/som & cascade', () => {
  it('indexes interactive controls while blocking sensitive password/OTP/payment inputs', () => {
    const mockRoot: DomRootLike = {
      querySelectorAll: () => [
        mkEl('button', { 'data-testid': 'tweetButton', 'aria-label': 'Post reply' }, 'Post'),
        mkEl('input', { type: 'password', name: 'pass' }, ''),
        mkEl('input', { type: 'text', autocomplete: 'one-time-code', placeholder: 'Enter OTP' }, ''),
        mkEl('button', { 'aria-label': 'Pay Now' }, 'Pay Now'),
        mkEl('button', { 'aria-label': 'Following' }, 'Following'),
      ],
    };

    const indexed = indexInteractiveDom(mockRoot);
    expect(indexed.blockedCount).toBe(3);
    expect(indexed.totalIndexed).toBe(2);
    expect(isSensitiveElement(mkEl('input', { type: 'password' }))).toBe(true);

    const found = querySemanticMark(indexed.marks, 'following');
    expect(found).not.toBeNull();
    expect(found?.label).toBe('Following');
    expect(found?.markId).toBe(2);
  });

  it('falls back from broken Layer 1 selector to Layer 2 SoM and self-heals reactive cache', () => {
    const mockRoot: DomRootLike = {
      querySelector: (sel) =>
        sel === 'button[aria-label="Following"]'
          ? mkEl('button', { 'aria-label': 'Following' }, 'Following', { x: 40, y: 80, width: 90, height: 32 })
          : null,
      querySelectorAll: () => [
        mkEl('button', { 'aria-label': 'Following' }, 'Following', { x: 40, y: 80, width: 90, height: 32 }),
      ],
    };

    let healed = '';
    const direct = resolveTargetWithCascade({
      query: 'Following',
      cachedSelector: '.old-broken-class',
      root: mockRoot,
      onHealSelector: (sel) => {
        healed = sel;
      },
    });
    expect(direct.found).toBe(true);
    expect(direct.layer).toBe(2);
    expect(direct.healed).toBe(true);
    expect(healed).toBe('button[aria-label="Following"]');

    const bot = createVisualBot({
      root: mockRoot,
      initialSelectors: { followBtn: '.broken' },
    });

    const first = bot.resolve('followBtn', { query: 'Following' });
    expect(first.layer).toBe(2);
    expect(bot.status.value).toBe('healed');
    expect(bot.healCount.value).toBe(1);
    expect(bot.selectorCache.value.followBtn).toBe('button[aria-label="Following"]');

    // Second lookup hits healed Layer 1 cache directly
    const second = bot.resolve('followBtn', { query: 'Following' });
    expect(second.layer).toBe(1);
    expect(second.healed).toBe(false);
    expect(bot.status.value).toBe('resolved');

    // Overlay render and cleanup
    bot.scan();
    expect(bot.marks.value.length).toBe(1);
    expect(bot.showOverlay(1, document)).toBe(1);
    expect(bot.overlayVisible.value).toBe(true);
    expect(renderSetOfMarkOverlay(bot.marks.value, { doc: document })).toBe(1);
    expect(clearSetOfMarkOverlay(document)).toBe(true);
    bot.destroy(document);
    expect(bot.overlayVisible.value).toBe(false);
  });
});
