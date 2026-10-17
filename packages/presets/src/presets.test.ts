import { describe, it, expect } from 'vitest';
import {
  createAestheticController,
  animatePreset,
  staggerPreset,
  applyElevationPreset,
  ANIMATION_PRESETS
} from './index.js';
import { JAPANESE_THEME_PRESETS, generateCssVariables } from '@zuari/tokens';

describe('@zuari/presets (Japanese Minimal & Anime-Artistic UI/UX Presets)', () => {
  it('provides all 5 Japanese aesthetic theme presets with lightweight elevations and motion tokens', () => {
    expect(Object.keys(JAPANESE_THEME_PRESETS)).toEqual([
      'aether',
      'washi',
      'sakura',
      'komorebi',
      'tasogare'
    ]);

    const washiCss = generateCssVariables(JAPANESE_THEME_PRESETS.washi);
    expect(washiCss).toContain('--zuari-elevation-kami');
    expect(washiCss).toContain('--zuari-elevation-shoji');
    expect(washiCss).toContain('--zuari-elevation-kaze');
    expect(washiCss).toContain('--zuari-elevation-sora');
    expect(washiCss).toContain('--zuari-motion-snappy');
    expect(washiCss).toContain('--zuari-motion-spring');
  });

  it('reactively switches themes, elevations, and Ma (間) spacing on target element', () => {
    const container = document.createElement('div');
    const controller = createAestheticController({
      initialTheme: 'washi',
      initialElevation: 'shoji',
      initialSpacing: 'zen',
      targetElement: container
    });

    expect(container.getAttribute('data-zuari-theme')).toBe('washi');
    expect(container.getAttribute('data-zuari-ma')).toBe('zen');
    expect(container.style.getPropertyValue('--zuari-ma-gap')).toBe('16px');

    // Switch to Anime Twilight ('tasogare') and 'airy' Ma rhythm
    controller.setTheme('tasogare');
    controller.setSpacing('airy');
    controller.setElevation('kaze');

    expect(container.getAttribute('data-zuari-theme')).toBe('tasogare');
    expect(container.getAttribute('data-zuari-ma')).toBe('airy');
    expect(container.getAttribute('data-zuari-elevation-default')).toBe('kaze');
    expect(controller.activeTokens.value.name).toBe('tasogare');

    const card = document.createElement('div');
    applyElevationPreset(card, 'sora');
    expect(card.getAttribute('data-zuari-elevation')).toBe('sora');
    expect(card.style.boxShadow).toBe('var(--zuari-elevation-sora)');

    controller.destroy();
  });

  it('applies smooth anime & human-artistic keyframe animation presets and staggered cascades', async () => {
    expect(Object.keys(ANIMATION_PRESETS)).toContain('sakuraFloat');
    expect(Object.keys(ANIMATION_PRESETS)).toContain('inkBrushReveal');
    expect(Object.keys(ANIMATION_PRESETS)).toContain('animePop');

    const card = document.createElement('div');
    const handle = animatePreset(card, 'animePop', { duration: 180 });
    expect(handle.preset).toBe('animePop');
    expect(card.getAttribute('data-zuari-anim')).toBe('animePop');
    await handle.finished;

    const items = [document.createElement('div'), document.createElement('div')];
    const staggered = staggerPreset(items, 'sakuraFloat', 50);
    expect(staggered).toHaveLength(2);
    expect(items[0]?.getAttribute('data-zuari-anim')).toBe('sakuraFloat');
    expect(items[1]?.getAttribute('data-zuari-anim')).toBe('sakuraFloat');
  });
});
