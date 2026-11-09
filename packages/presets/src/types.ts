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
 * - 'liquid': Rounded iridescent glass with color blooms and bright edge highlights
 * - 'canvas': Clean, minimal flat canvas surface
 * - 'cel': Crisp anime cel-shaded card with defined outline and zero blur
 */
export type SurfacePreset = 'paper' | 'frosted' | 'liquid' | 'canvas' | 'cel';

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

/** Minimal Storage-compatible interface, injectable for tests and non-browser hosts. */
export interface DesignPreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface PersistentDesignPresetOptions extends DesignPresetOptions {
  /** Pass null to disable persistence; otherwise localStorage is used when available. */
  readonly storage?: DesignPreferenceStorage | null | undefined;
  /** Namespaced key used for the serialized design preferences. */
  readonly storageKey?: string | undefined;
  /** Synchronize changes from other tabs using the browser storage event. */
  readonly syncAcrossTabs?: boolean | undefined;
}

export interface PersistentDesignPresetController extends DesignPresetController {
  readonly storageKey: string;
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

export interface ThemeSectionOptions {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly eyebrow?: string | undefined;
  readonly badge?: string | undefined;
  readonly theme?: ThemePresetName | undefined;
  readonly elevation?: ElevationPreset | undefined;
  readonly surface?: SurfacePreset | undefined;
  readonly actions?: readonly HTMLElement[] | undefined;
  readonly children?: readonly HTMLElement[] | undefined;
  readonly animation?: AnimationPresetName | false | undefined;
}

export interface MetricCardOptions {
  readonly label: string;
  readonly value: string;
  readonly meta?: string | undefined;
  readonly delta?: string | undefined;
  readonly tone?: 'positive' | 'neutral' | 'warning' | 'danger' | undefined;
  readonly icon?: string | SVGElement | undefined;
  readonly animation?: AnimationPresetName | false | undefined;
}

export interface InfographicBarOptions {
  readonly label: string;
  readonly value: number;
  readonly tone?: 'positive' | 'neutral' | 'warning' | 'danger' | undefined;
}

export interface InfographicPanelOptions {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly bars: readonly InfographicBarOptions[];
  readonly maxValue?: number | undefined;
  readonly elevation?: ElevationPreset | undefined;
  readonly surface?: SurfacePreset | undefined;
  readonly animation?: AnimationPresetName | false | undefined;
}


