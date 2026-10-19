import { describe, it, expect, vi } from 'vitest';
import {
  createDesignPresets,
  animatePreset,
  staggerPreset,
  applyElevationPreset,
  applySurfacePreset,
  createStoryCard,
  createBentoGrid,
  createStampBadge,
  createMinimalDock,
  createFeatureDivision,
  ANIMATION_PRESETS
} from './index.js';
import { THEME_PRESETS, generateCssVariables } from '@zuari/tokens';

describe('@zuari/presets (Easy-to-Use Minimal & Artistic UI/UX Presets & Templates)', () => {
  it('provides 5 easy-to-remember theme presets with lightweight elevations and motion tokens', () => {
    expect(Object.keys(THEME_PRESETS)).toEqual([
      'paper',
      'blossom',
      'matcha',
      'twilight',
      'midnight'
    ]);

    const paperCss = generateCssVariables(THEME_PRESETS.paper);
    expect(paperCss).toContain('--zuari-elevation-flat');
    expect(paperCss).toContain('--zuari-elevation-soft');
    expect(paperCss).toContain('--zuari-elevation-float');
    expect(paperCss).toContain('--zuari-elevation-halo');
    expect(paperCss).toContain('--zuari-motion-crisp');
    expect(paperCss).toContain('--zuari-motion-bounce');
  });

  it('reactively switches themes, elevations, spacing, and surfaces with createDesignPresets', () => {
    const container = document.createElement('div');
    const presets = createDesignPresets({
      theme: 'paper',
      elevation: 'soft',
      spacing: 'balanced',
      surface: 'paper',
      targetElement: container
    });

    expect(container.getAttribute('data-zuari-theme')).toBe('paper');
    expect(container.getAttribute('data-zuari-spacing')).toBe('balanced');
    expect(container.style.getPropertyValue('--zuari-layout-gap')).toBe('16px');

    // Switch to 'twilight' theme, 'airy' spacing, 'float' elevation, and 'cel' surface
    presets.setTheme('twilight');
    presets.setSpacing('airy');
    presets.setElevation('float');
    presets.setSurface('cel');

    expect(container.getAttribute('data-zuari-theme')).toBe('twilight');
    expect(container.getAttribute('data-zuari-spacing')).toBe('airy');
    expect(container.getAttribute('data-zuari-elevation-default')).toBe('float');
    expect(container.getAttribute('data-zuari-surface-default')).toBe('cel');
    expect(presets.activeTokens.value.name).toBe('twilight');

    const card = document.createElement('div');
    applyElevationPreset(card, 'halo');
    applySurfacePreset(card, 'frosted');
    expect(card.getAttribute('data-zuari-elevation')).toBe('halo');
    expect(card.getAttribute('data-zuari-surface')).toBe('frosted');
    expect(card.classList.contains('zuari-surface-frosted')).toBe(true);

    presets.destroy();
  });

  it('plays smooth animation presets (floatUp, popIn, slideIn, brushIn, softPulse, ripple)', async () => {
    expect(Object.keys(ANIMATION_PRESETS)).toEqual([
      'floatUp',
      'popIn',
      'slideIn',
      'brushIn',
      'softPulse',
      'ripple'
    ]);

    const card = document.createElement('div');
    const handle = animatePreset(card, 'popIn', { duration: 180 });
    expect(handle.preset).toBe('popIn');
    expect(card.getAttribute('data-zuari-anim')).toBe('popIn');
    await handle.finished;

    const items = [document.createElement('div'), document.createElement('div')];
    const staggered = staggerPreset(items, 'floatUp', 50);
    expect(staggered).toHaveLength(2);
    expect(items[0]?.getAttribute('data-zuari-anim')).toBe('floatUp');
    expect(items[1]?.getAttribute('data-zuari-anim')).toBe('floatUp');
  });

  it('builds modular UI templates (createStoryCard, createBentoGrid, createStampBadge)', () => {
    const onClick = vi.fn();
    const card1 = createStoryCard({
      tag: 'Chapter 01',
      stamp: 'NEW',
      title: 'Minimal Canvas',
      subtitle: 'Lightweight elevation and clean layout.',
      elevation: 'soft',
      surface: 'paper',
      animation: 'floatUp',
      onClick
    });

    expect(card1.classList.contains('zuari-story-card')).toBe(true);
    expect(card1.getAttribute('data-zuari-elevation')).toBe('soft');
    expect(card1.getAttribute('data-zuari-surface')).toBe('paper');
    expect(card1.querySelector('.zuari-story-title')?.textContent).toBe('Minimal Canvas');
    expect(card1.querySelector('.zuari-stamp-badge')?.textContent).toBe('NEW');

    card1.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(card1.getAttribute('data-zuari-anim')).toBe('ripple');

    const card2 = createStoryCard({ title: 'Second Panel' });
    const bento = createBentoGrid({
      columns: 2,
      spacing: 'airy',
      staggerAnimation: 'popIn',
      items: [card1, card2]
    });

    expect(bento.getAttribute('data-columns')).toBe('2');
    expect(bento.getAttribute('data-zuari-spacing')).toBe('airy');
    expect(bento.children).toHaveLength(2);
    expect(card2.getAttribute('data-zuari-anim')).toBe('popIn');

    const stamp = createStampBadge('STUDIO');
    expect(stamp.className).toBe('zuari-stamp-badge');
    expect(stamp.textContent).toBe('STUDIO');
  });

  it('renders a minimalistic floating dock with responsive item interactions', () => {
    const onSelect = vi.fn();
    const dock = createMinimalDock({
      items: [
        { id: 'home', label: 'Home', active: true, onClick: onSelect },
        { id: 'settings', label: 'Settings', badge: '3', onClick: onSelect }
      ],
      elevation: 'float',
      surface: 'frosted'
    });

    expect(dock.classList.contains('zuari-minimal-dock')).toBe(true);
    expect(dock.getAttribute('role')).toBe('toolbar');
    expect(dock.getAttribute('data-zuari-elevation')).toBe('float');
    expect(dock.children).toHaveLength(2);

    const firstBtn = dock.children[0] as HTMLButtonElement;
    expect(firstBtn.getAttribute('data-active')).toBe('true');
    firstBtn.click();
    expect(onSelect).toHaveBeenCalled();
  });

  it('divides software features cleanly into UI/UX planes (surface, dock, drawer, command, ambient)', () => {
    const { matrix, getFeaturesForPlane } = createFeatureDivision([
      { id: 'canvas', label: 'Main Canvas', category: 'core', recommendedPlane: 'surface' },
      { id: 'tools', label: 'Quick Tools', category: 'tools', recommendedPlane: 'dock' },
      { id: 'inspector', label: 'Layer Inspector', category: 'tools', recommendedPlane: 'drawer' },
      { id: 'search', label: 'Omni Search', category: 'core', recommendedPlane: 'command' },
      { id: 'fps', label: 'FPS Telemetry', category: 'systems', recommendedPlane: 'ambient' }
    ]);

    expect(matrix.surfaceFeatures).toHaveLength(1);
    expect(matrix.dockFeatures).toHaveLength(1);
    expect(matrix.drawerFeatures).toHaveLength(1);
    expect(matrix.commandFeatures).toHaveLength(1);
    expect(matrix.ambientFeatures).toHaveLength(1);
    expect(getFeaturesForPlane('drawer')[0]?.id).toBe('inspector');
  });
});


