/**
 * @fileoverview Section and infographic panel templates for @zuari/presets.
 */

import type {
  ThemeSectionOptions,
  InfographicPanelOptions
} from '../types.js';
import { applyElevationPreset, applySurfacePreset } from '../aesthetics.js';
import { animatePreset } from '../animations.js';

/**
 * Creates a modular theme section for product pages, dashboards, and launch surfaces.
 */
export function createThemeSection(options: ThemeSectionOptions): HTMLElement {
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
export function createInfoGraphicPanel(options: InfographicPanelOptions): HTMLElement {
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
