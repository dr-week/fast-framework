/**
 * @fileoverview Minimal floating dock navigation template for @zuari/presets.
 */

import type { MinimalDockOptions } from '../types.js';
import { applyElevationPreset, applySurfacePreset } from '../aesthetics.js';
import { animatePreset } from '../animations.js';

/**
 * Creates a minimalist floating dock navigation bar with vast functionality:
 * - Fluid translucent backdrop blur
 * - Zero-clutter icons with hover-tethered tooltips
 * - Built-in spring ripple feedback
 */
export function createMinimalDock(options: MinimalDockOptions): HTMLElement {
  const dock = document.createElement('nav');
  dock.className = 'zuari-minimal-dock';
  dock.setAttribute('role', 'toolbar');
  dock.setAttribute('aria-label', 'Dock Navigation');

  const elevation = options.elevation ?? 'float';
  const surface = options.surface ?? 'frosted';

  applyElevationPreset(dock, elevation);
  applySurfacePreset(dock, surface);

  // Contrasting Boxiness & Liquid Glass specular top-rim
  dock.style.border = '1px solid var(--nova-color-border, oklch(100% 0 0 / 0.18))';
  const elevationShadow =
    elevation === 'float'
      ? 'var(--zuari-elevation-float, 0 12px 32px -8px rgba(0,0,0,0.45))'
      : `var(--zuari-elevation-${elevation}, 0 12px 32px -8px rgba(0,0,0,0.45))`;
  dock.style.boxShadow = `var(--zuari-glass-rim-shadow, inset 0 1px 0 oklch(100% 0 0 / 0.16)), ${elevationShadow}`;

  if (surface === 'liquid' || surface === 'frosted') {
    dock.setAttribute('data-zuari-optics', 'liquid-glass');
  }

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
