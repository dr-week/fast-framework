/**
 * @fileoverview Ready-to-use, modular UI/UX layout & component templates for Zuari.
 * Provides human-artistic cards, clean Bento grids, stamp badges, and floating action pills
 * with lightweight elevations and built-in animation presets.
 */

import type {
  StoryCardTemplateOptions,
  BentoLayoutTemplateOptions
} from './types.js';
import { applyElevationPreset, applySurfacePreset, SPACING_PRESET_VALUES } from './aesthetics.js';
import { animatePreset, staggerPreset } from './animations.js';

/**
 * Creates an artistic, minimal Story Card template (`createStoryCard`) with:
 * - Lightweight elevation (`flat`, `soft`, `float`, `halo`)
 * - Surface finish (`paper`, `frosted`, `canvas`, `cel`)
 * - Optional red stamp badge (`stamp`) and category pill (`tag`)
 * - Automatic entrance animation preset (`floatUp`, `popIn`, etc.)
 */
export function createStoryCard(options: StoryCardTemplateOptions): HTMLElement {
  const card = document.createElement('article');
  card.className = 'zuari-story-card';

  // Apply contrasting boxiness
  card.style.border = '1px solid var(--nova-color-border, oklch(100% 0 0 / 0.18))';
  card.style.background = 'var(--nova-color-surface-elevated, var(--nova-color-surface, #151821))';
  card.style.borderRadius = 'var(--nova-radius-squircle, 8px)';

  applyElevationPreset(card, options.elevation ?? 'soft');
  applySurfacePreset(card, options.surface ?? 'paper');

  if (options.tag || options.stamp) {
    const metaRow = document.createElement('div');
    metaRow.className = 'zuari-story-meta';

    if (options.tag) {
      const tagEl = document.createElement('span');
      tagEl.className = 'zuari-tag-pill';
      tagEl.textContent = options.tag;
      metaRow.appendChild(tagEl);
    }

    if (options.stamp) {
      const stampEl = document.createElement('span');
      stampEl.className = 'zuari-stamp-badge';
      stampEl.textContent = options.stamp;
      metaRow.appendChild(stampEl);
    }

    card.appendChild(metaRow);
  }

  const titleEl = document.createElement('h3');
  titleEl.className = 'zuari-story-title';
  titleEl.textContent = options.title;
  card.appendChild(titleEl);

  if (options.subtitle) {
    const subEl = document.createElement('p');
    subEl.className = 'zuari-story-subtitle';
    subEl.textContent = options.subtitle;
    card.appendChild(subEl);
  }

  if (options.onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      animatePreset(card, 'ripple');
      options.onClick?.(e);
    });
  }

  if (options.animation !== false) {
    animatePreset(card, options.animation ?? 'floatUp');
  }

  return card;
}

/**
 * Creates a clean, modular Bento Grid layout (`createBentoGrid`) with balanced whitespace
 * and automatic staggered entrance animations for child cards.
 */
export function createBentoGrid(options: BentoLayoutTemplateOptions): HTMLElement {
  const grid = document.createElement('section');
  grid.className = 'zuari-bento-grid';

  const cols = options.columns ?? 3;
  const spacingMode = options.spacing ?? 'balanced';
  const spacingTokens = SPACING_PRESET_VALUES[spacingMode];

  grid.setAttribute('data-columns', String(cols));
  grid.setAttribute('data-zuari-spacing', spacingMode);
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  grid.style.gap = spacingTokens.gap;
  grid.style.setProperty('reading-flow', 'grid-rows');

  for (const item of options.items) {
    grid.appendChild(item);
  }

  if (options.staggerAnimation !== false) {
    staggerPreset(options.items, options.staggerAnimation ?? 'floatUp', 45);
  }

  return grid;
}

/**
 * Creates an artistic red stamp badge (`createStampBadge`) inspired by minimal studio seals.
 */
export function createStampBadge(label: string): HTMLSpanElement {
  const stamp = document.createElement('span');
  stamp.className = 'zuari-stamp-badge';
  stamp.textContent = label;
  return stamp;
}

/**
 * Creates a minimalist floating dock navigation bar with vast functionality:
 * - Fluid translucent backdrop blur
 * - Zero-clutter icons with hover-tethered tooltips
 * - Built-in spring ripple feedback
 */
export function createMinimalDock(options: import('./types.js').MinimalDockOptions): HTMLElement {
  const dock = document.createElement('nav');
  dock.className = 'zuari-minimal-dock';
  dock.setAttribute('role', 'toolbar');
  dock.setAttribute('aria-label', 'Dock Navigation');

  applyElevationPreset(dock, options.elevation ?? 'float');
  applySurfacePreset(dock, options.surface ?? 'frosted');

  for (const item of options.items) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'zuari-dock-item-btn';
    btn.setAttribute('aria-label', item.label);
    if (item.active) btn.setAttribute('data-active', 'true');

    if (item.icon instanceof Element) {
      btn.appendChild(item.icon);
    } else if (typeof item.icon === 'string') {
      const span = document.createElement('span');
      span.innerHTML = item.icon;
      btn.appendChild(span);
    } else {
      btn.textContent = item.label.slice(0, 2).toUpperCase();
    }

    if (item.badge) {
      const badge = document.createElement('span');
      badge.className = 'zuari-dock-badge';
      badge.textContent = item.badge;
      btn.appendChild(badge);
    }

    btn.addEventListener('click', () => {
      animatePreset(btn, 'ripple');
      item.onClick?.();
    });

    dock.appendChild(btn);
  }

  animatePreset(dock, 'floatUp');
  return dock;
}

