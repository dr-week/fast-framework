/**
 * @fileoverview Type definitions for @zuari/presets.
 * Easy-to-use, memorable UI/UX Design Presets, Lightweight Elevations,
 * Smooth Animation Presets, and Ready-Made Artistic UI Templates.
 */

import type { Signal, CleanupFn } from '@zuari/signals';
import type {
  ThemePresetName,
  ElevationPreset,
  NovaThemeContract
} from '@zuari/tokens';

/**
 * Easy-to-remember Animation Preset Names:
 * - 'floatUp': Gentle upward drift with a soft settle (cards, panels, hero items)
 * - 'popIn': Crisp anime-style keyframe pop with subtle bounce (buttons, badges, dialogs)
 * - 'slideIn': Smooth horizontal glide entrance (drawers, menus, list items)
 * - 'brushIn': Artistic ink-stroke reveal from left to right (headers, banners)
 * - 'softPulse': Calm breathing glow (status dots, active indicators)
 * - 'ripple': Quick tactile press feedback (interactive buttons, tiles)
 */
export type AnimationPresetName =
  | 'floatUp'
  | 'popIn'
  | 'slideIn'
  | 'brushIn'
  | 'softPulse'
  | 'ripple';

/**
 * Clean Whitespace & Density Presets:
 * - 'compact': Tight, efficient spacing for data-dense toolbars and dashboards
 * - 'balanced': Natural, comfortable everyday reading and interaction spacing
 * - 'airy': Open gallery-like whitespace for calm, artistic layouts
 */
export type SpacingPreset = 'compact' | 'balanced' | 'airy';

/**
 * Surface Material Presets:
 * - 'paper': Matte, tactile warm card surface with crisp 1px border
 * - 'frosted': Soft translucent frosted glass with subtle blur
 * - 'canvas': Clean, minimal flat canvas surface
 * - 'cel': Crisp anime cel-shaded card with defined outline and zero blur
 */
export type SurfacePreset = 'paper' | 'frosted' | 'canvas' | 'cel';

export interface AnimationPresetConfig {
  readonly name: AnimationPresetName;
  readonly label: string;
  readonly description: string;
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

export interface DesignPresetOptions {
  readonly theme?: ThemePresetName | undefined;
  readonly elevation?: ElevationPreset | undefined;
  readonly spacing?: SpacingPreset | undefined;
  readonly surface?: SurfacePreset | undefined;
  readonly targetElement?: HTMLElement | undefined;
}

export interface DesignPresetController {
  readonly theme: Signal<ThemePresetName>;
  readonly elevation: Signal<ElevationPreset>;
  readonly spacing: Signal<SpacingPreset>;
  readonly surface: Signal<SurfacePreset>;
  readonly activeTokens: Signal<NovaThemeContract>;
  setTheme(theme: ThemePresetName): void;
  setElevation(level: ElevationPreset): void;
  setSpacing(mode: SpacingPreset): void;
  setSurface(surface: SurfacePreset): void;
  applyElevationTo(element: HTMLElement, level?: ElevationPreset): void;
  applySurfaceTo(element: HTMLElement, surface?: SurfacePreset): void;
  destroy: CleanupFn;
}

/**
 * Options for ready-to-use artistic UI/UX templates
 */
export interface StoryCardTemplateOptions {
  readonly tag?: string | undefined;
  readonly stamp?: string | undefined;
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly elevation?: ElevationPreset | undefined;
  readonly surface?: SurfacePreset | undefined;
  readonly animation?: AnimationPresetName | false | undefined;
  readonly onClick?: ((event: MouseEvent) => void) | undefined;
}

export interface BentoLayoutTemplateOptions {
  readonly columns?: 2 | 3 | 4 | undefined;
  readonly spacing?: SpacingPreset | undefined;
  readonly staggerAnimation?: AnimationPresetName | false | undefined;
  readonly items: readonly HTMLElement[];
}

export interface SectionHeaderTemplateOptions {
  readonly eyebrow?: string | undefined;
  readonly title: string;
  readonly description?: string | undefined;
  readonly align?: 'left' | 'center' | undefined;
}

export interface MinimalDockItem {
  id: string;
  icon?: string | SVGElement;
  label: string;
  badge?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface MinimalDockOptions {
  items: MinimalDockItem[];
  elevation?: ElevationPreset;
  surface?: SurfacePreset;
  position?: 'bottom' | 'top' | 'left' | 'right';
}


