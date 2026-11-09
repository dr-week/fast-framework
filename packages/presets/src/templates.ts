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
 * Creates a compact KPI metric block for a dashboard or portfolio section.
 */
export function createMetricCard(options: import('./types.js').MetricCardOptions): HTMLElement {
  const card = document.createElement('article');
  card.className = 'zuari-metric-card';
  card.dataset.tone = options.tone ?? 'neutral';

  applyElevationPreset(card, 'soft');
  applySurfacePreset(card, 'paper');

  if (options.icon) {
    const iconWrap = document.createElement('div');
    iconWrap.className = 'zuari-metric-icon';
    if (typeof options.icon === 'string') {
      iconWrap.textContent = options.icon;
    } else {
      iconWrap.appendChild(options.icon);
    }
    card.appendChild(iconWrap);
  }

  const body = document.createElement('div');
  body.className = 'zuari-metric-body';

  const label = document.createElement('span');
  label.className = 'zuari-metric-label';
  label.textContent = options.label;
  body.appendChild(label);

  const value = document.createElement('strong');
  value.className = 'zuari-metric-value';
  value.textContent = options.value;
  body.appendChild(value);

  if (options.meta || options.delta) {
    const meta = document.createElement('small');
    meta.className = 'zuari-metric-meta';
    meta.textContent = options.delta ?? options.meta ?? '';
    if (options.delta) {
      meta.dataset.delta = options.delta;
    }
    body.appendChild(meta);
  }

  card.appendChild(body);

  if (options.animation !== false) {
    animatePreset(card, options.animation ?? 'floatUp');
  }

  return card;
}

/**
 * Creates a modular theme section for product pages, dashboards, and launch surfaces.
 */
export function createThemeSection(options: import('./types.js').ThemeSectionOptions): HTMLElement {
  const section = document.createElement('section');
  section.className = 'zuari-theme-section';

  applyElevationPreset(section, options.elevation ?? 'soft');
  applySurfacePreset(section, options.surface ?? 'canvas');

  const header = document.createElement('header');
  header.className = 'zuari-theme-header';

  if (options.eyebrow || options.badge) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 'zuari-theme-eyebrow';
    eyebrow.textContent = options.badge ?? options.eyebrow ?? '';
    header.appendChild(eyebrow);
  }

  const titleWrap = document.createElement('div');
  titleWrap.className = 'zuari-theme-title-wrap';

  const title = document.createElement('h3');
  title.className = 'zuari-theme-title';
  title.textContent = options.title;
  titleWrap.appendChild(title);

  if (options.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'zuari-theme-subtitle';
    subtitle.textContent = options.subtitle;
    titleWrap.appendChild(subtitle);
  }

  header.appendChild(titleWrap);

  if (options.actions && options.actions.length > 0) {
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'zuari-theme-actions';
    for (const action of options.actions) {
      actionsWrap.appendChild(action);
    }
    header.appendChild(actionsWrap);
  }

  section.appendChild(header);

  const body = document.createElement('div');
  body.className = 'zuari-theme-body';

  if (options.children) {
    for (const child of options.children) {
      body.appendChild(child);
    }
  }

  section.appendChild(body);

  if (options.animation !== false) {
    animatePreset(section, options.animation ?? 'floatUp');
  }

  return section;
}

/**
 * Creates a lightweight infographic panel for modular dashboards, analytics surfaces, and landing sections.
 */
export function createInfoGraphicPanel(options: import('./types.js').InfographicPanelOptions): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'zuari-infographic-panel';

  applyElevationPreset(panel, options.elevation ?? 'soft');
  applySurfacePreset(panel, options.surface ?? 'paper');

  const header = document.createElement('header');
  header.className = 'zuari-infographic-header';

  const title = document.createElement('h4');
  title.className = 'zuari-infographic-title';
  title.textContent = options.title;
  header.appendChild(title);

  if (options.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'zuari-infographic-subtitle';
    subtitle.textContent = options.subtitle;
    header.appendChild(subtitle);
  }

  panel.appendChild(header);

  const maxValue = options.maxValue ?? Math.max(1, ...options.bars.map((bar) => bar.value));
  const list = document.createElement('div');
  list.className = 'zuari-infographic-list';

  for (const bar of options.bars) {
    const item = document.createElement('div');
    item.className = 'zuari-infographic-row';
    item.dataset.tone = bar.tone ?? 'neutral';

    const label = document.createElement('span');
    label.className = 'zuari-infographic-label';
    label.textContent = bar.label;

    const track = document.createElement('div');
    track.className = 'zuari-infographic-track';

    const fill = document.createElement('span');
    fill.className = 'zuari-infographic-fill';
    fill.style.width = `${(bar.value / maxValue) * 100}%`;
    fill.dataset.tone = bar.tone ?? 'neutral';
    track.appendChild(fill);

    const value = document.createElement('strong');
    value.className = 'zuari-infographic-value';
    value.textContent = String(bar.value);

    item.append(label, track, value);
    list.appendChild(item);
  }

  panel.appendChild(list);

  if (options.animation !== false) {
    animatePreset(panel, options.animation ?? 'floatUp');
  }

  return panel;
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

