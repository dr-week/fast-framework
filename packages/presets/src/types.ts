/**
 * @fileoverview Type definitions for @zuari/presets.
 * Modular Japanese Minimal & Anime-Artistic UI/UX Presets, Lightweight Elevations,
 * Ma (間) Spatial Rhythm, and Web Animations API (WAAPI) Keyframe Presets.
 */

import type { Signal, CleanupFn } from '@zuari/signals';
import type {
  JapaneseAestheticPresetName,
  ElevationPresetTier,
  NovaThemeContract
} from '@zuari/tokens';

/**
 * Anime & Human-Artistic Animation Preset Names:
 * - 'sakuraFloat': Gentle upward petal drift with subtle rotation settle
 * - 'inkBrushReveal': Calligraphic sumi-e horizontal stroke clip/scale reveal
 * - 'shojiGlide': Smooth Japanese sliding screen horizontal/vertical entrance
 * - 'animePop': Expressive anime keyframe impact snap with subtle overshoot
 * - 'komorebiPulse': Soft dappled-sunlight breathing luminescence
 * - 'zenRipple': Tactile concentric water-drop micro-interaction
 */
export type AnimationPresetName =
  | 'sakuraFloat'
  | 'inkBrushReveal'
  | 'shojiGlide'
  | 'animePop'
  | 'komorebiPulse'
  | 'zenRipple';

/**
 * Japanese Ma (間) Spatial Density & Rhythm Presets:
 * - 'compact': High-information density (Bento utility grid)
 * - 'zen': Balanced human reading & interaction rhythm
 * - 'airy': Gallery / Tokonoma contemplative open whitespace
 */
export type MaSpacingMode = 'compact' | 'zen' | 'airy';

export interface AnimationPresetConfig {
  readonly name: AnimationPresetName;
  readonly label: string;
  readonly japaneseTitle: string;
  readonly keyframes: Keyframe[];
  readonly options: KeyframeAnimationOptions;
}

export interface AnimatePresetOverrides {
  readonly duration?: number | undefined;
  readonly delay?: number | undefined;
  readonly easing?: string | undefined;
  readonly iterations?: number | undefined;
  readonly fill?: FillMode | undefined;
}

export interface AnimationHandle {
  readonly preset: AnimationPresetName;
  readonly finished: Promise<void>;
  cancel(): void;
}

export interface AestheticControllerOptions {
  readonly initialTheme?: JapaneseAestheticPresetName | undefined;
  readonly initialElevation?: ElevationPresetTier | undefined;
  readonly initialSpacing?: MaSpacingMode | undefined;
  readonly targetElement?: HTMLElement | undefined;
}

export interface AestheticController {
  readonly theme: Signal<JapaneseAestheticPresetName>;
  readonly elevation: Signal<ElevationPresetTier>;
  readonly spacing: Signal<MaSpacingMode>;
  readonly activeTokens: Signal<NovaThemeContract>;
  setTheme(theme: JapaneseAestheticPresetName): void;
  setElevation(tier: ElevationPresetTier): void;
  setSpacing(mode: MaSpacingMode): void;
  applyElevationTo(element: HTMLElement, tier?: ElevationPresetTier): void;
  destroy: CleanupFn;
}
