/**
 * @fileoverview Reactive UI/UX Design Preset Controller (`createDesignPresets`).
 * Coordinates simple, intuitive themes ('paper', 'blossom', 'matcha', 'twilight', 'midnight'),
 * lightweight elevations ('flat', 'soft', 'float', 'halo'),
 * spacing density ('compact', 'balanced', 'airy'), and surface materials ('paper', 'frosted', 'canvas', 'cel').
 */

import { signal, effect } from '@zuari/signals';
import {
  THEME_PRESETS,
  applyThemePreset,
  type ThemePresetName,
  type ElevationPreset,
  type NovaThemeContract
} from '@zuari/tokens';
import type {
  SpacingPreset,
  SurfacePreset,
  DesignPresetOptions,
  DesignPresetController
} from './types.js';

export const SPACING_PRESET_VALUES: Record<SpacingPreset, { gap: string; pad: string; lineHeight: string }> = {
  compact: { gap: '8px', pad: '14px', lineHeight: '1.4' },
  balanced: { gap: '16px', pad: '24px', lineHeight: '1.65' },
  airy: { gap: '28px', pad: '36px', lineHeight: '1.8' }
};

/**
 * Applies a lightweight elevation preset (`flat`, `soft`, `float`, `halo`) to an element.
 */
export function applyElevationPreset(
  element: HTMLElement,
  level: ElevationPreset = 'soft'
): void {
  element.setAttribute('data-zuari-elevation', level);
  element.style.boxShadow = `var(--zuari-elevation-${level})`;
}

/**
 * Applies a surface material preset (`paper`, `frosted`, `canvas`, `cel`) to an element.
 */
export function applySurfacePreset(
  element: HTMLElement,
  surface: SurfacePreset = 'paper'
): void {
  element.setAttribute('data-zuari-surface', surface);
  element.classList.remove(
    'zuari-surface-paper',
    'zuari-surface-frosted',
    'zuari-surface-canvas',
    'zuari-surface-cel'
  );
  element.classList.add(`zuari-surface-${surface}`);
}

/**
 * Creates a reactive UI/UX Design Preset Controller with simple, intuitive controls.
 */
export function createDesignPresets(
  options: DesignPresetOptions = {}
): DesignPresetController {
  const theme = signal<ThemePresetName>(options.theme ?? 'paper');
  const elevation = signal<ElevationPreset>(options.elevation ?? 'soft');
  const spacing = signal<SpacingPreset>(options.spacing ?? 'balanced');
  const surface = signal<SurfacePreset>(options.surface ?? 'paper');
  const activeTokens = signal<NovaThemeContract>(THEME_PRESETS[theme.peek()]);

  const disposeEffect = effect(() => {
    const currentTheme = theme.value;
    const currentElevation = elevation.value;
    const currentSpacing = spacing.value;
    const currentSurface = surface.value;

    const contract = applyThemePreset(currentTheme, options.targetElement);
    activeTokens.value = contract;

    const root =
      options.targetElement ??
      (typeof document !== 'undefined' ? document.documentElement : undefined);

    if (root) {
      root.setAttribute('data-zuari-elevation-default', currentElevation);
      root.setAttribute('data-zuari-spacing', currentSpacing);
      root.setAttribute('data-zuari-surface-default', currentSurface);

      const spaceSpec = SPACING_PRESET_VALUES[currentSpacing];
      root.style.setProperty('--zuari-layout-gap', spaceSpec.gap);
      root.style.setProperty('--zuari-layout-pad', spaceSpec.pad);
      root.style.setProperty('--zuari-layout-line-height', spaceSpec.lineHeight);
    }
  });

  return {
    theme,
    elevation,
    spacing,
    surface,
    activeTokens,
    setTheme: (nextTheme) => {
      theme.value = nextTheme;
    },
    setElevation: (nextLevel) => {
      elevation.value = nextLevel;
    },
    setSpacing: (nextMode) => {
      spacing.value = nextMode;
    },
    setSurface: (nextSurface) => {
      surface.value = nextSurface;
    },
    applyElevationTo: (el, level) => {
      applyElevationPreset(el, level ?? elevation.peek());
    },
    applySurfaceTo: (el, surf) => {
      applySurfacePreset(el, surf ?? surface.peek());
    },
    destroy: () => {
      disposeEffect();
    }
  };
}
