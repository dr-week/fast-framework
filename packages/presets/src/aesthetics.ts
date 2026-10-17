/**
 * @fileoverview Reactive Japanese Minimal & Anime-Artistic UI/UX Preset Controller.
 * Orchestrates OKLCH theme palettes (Washi, Sakura, Komorebi, Tasogare, Aether),
 * lightweight Japanese paper/shoji elevations (Kami, Shoji, Kaze, Sora),
 * and Ma (間) negative-space rhythm.
 */

import { signal, effect } from '@zuari/signals';
import {
  JAPANESE_THEME_PRESETS,
  applyThemePreset,
  type JapaneseAestheticPresetName,
  type ElevationPresetTier,
  type NovaThemeContract
} from '@zuari/tokens';
import type {
  MaSpacingMode,
  AestheticControllerOptions,
  AestheticController
} from './types.js';

export const MA_SPACING_MULTIPLIERS: Record<MaSpacingMode, { gap: string; pad: string; leading: string }> = {
  compact: { gap: '8px', pad: '14px', leading: '1.4' },
  zen: { gap: '16px', pad: '24px', leading: '1.65' },
  airy: { gap: '28px', pad: '36px', leading: '1.8' }
};

/**
 * Applies a lightweight Japanese elevation tier (`kami`, `shoji`, `kaze`, `sora`)
 * to an element via CSS custom properties and data attributes.
 */
export function applyElevationPreset(
  element: HTMLElement,
  tier: ElevationPresetTier = 'shoji'
): void {
  element.setAttribute('data-zuari-elevation', tier);
  element.style.boxShadow = `var(--zuari-elevation-${tier})`;
}

/**
 * Creates a reactive UI/UX Aesthetic Preset Controller that synchronizes
 * Japanese minimal themes, lightweight paper elevations, and Ma (間) spatial rhythm.
 */
export function createAestheticController(
  options: AestheticControllerOptions = {}
): AestheticController {
  const theme = signal<JapaneseAestheticPresetName>(options.initialTheme ?? 'washi');
  const elevation = signal<ElevationPresetTier>(options.initialElevation ?? 'shoji');
  const spacing = signal<MaSpacingMode>(options.initialSpacing ?? 'zen');
  const activeTokens = signal<NovaThemeContract>(JAPANESE_THEME_PRESETS[theme.peek()]);

  const disposeEffect = effect(() => {
    const currentTheme = theme.value;
    const currentElevation = elevation.value;
    const currentSpacing = spacing.value;

    const contract = applyThemePreset(currentTheme, options.targetElement);
    activeTokens.value = contract;

    const root =
      options.targetElement ??
      (typeof document !== 'undefined' ? document.documentElement : undefined);

    if (root) {
      root.setAttribute('data-zuari-elevation-default', currentElevation);
      root.setAttribute('data-zuari-ma', currentSpacing);

      const maSpec = MA_SPACING_MULTIPLIERS[currentSpacing];
      root.style.setProperty('--zuari-ma-gap', maSpec.gap);
      root.style.setProperty('--zuari-ma-pad', maSpec.pad);
      root.style.setProperty('--zuari-ma-leading', maSpec.leading);
    }
  });

  return {
    theme,
    elevation,
    spacing,
    activeTokens,
    setTheme: (nextTheme) => {
      theme.value = nextTheme;
    },
    setElevation: (nextTier) => {
      elevation.value = nextTier;
    },
    setSpacing: (nextMode) => {
      spacing.value = nextMode;
    },
    applyElevationTo: (el, tier) => {
      applyElevationPreset(el, tier ?? elevation.peek());
    },
    destroy: () => {
      disposeEffect();
    }
  };
}
