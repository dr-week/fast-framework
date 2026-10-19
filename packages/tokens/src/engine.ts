/**
 * @fileoverview Modular, plug-and-play UI/UX Theme Engine for Zuari.
 * Like Lego bricks: compose colors, typography, elevations, motion, density, and surfaces independently
 * into custom theme presets, scope them to subtrees, or switch globally with zero Virtual DOM re-rendering.
 */

import { signal, computed, effect, batch, type Signal, type Computed, type CleanupFn } from '@zuari/signals';
import type {
  NovaThemeContract,
  ThemePresetName,
  ElevationPreset,
  NovaElevationsContract,
  NovaMotionContract
} from './contract.js';
import { THEME_PRESETS, darkElevations, lightElevations, motionPresets } from './themes.js';
import { applyThemePreset } from './generator.js';

export interface ThemeLegoBricks {
  /** Color palette brick (background, surface, accent, text/glyph, border, danger) */
  colors?: Partial<NovaThemeContract['colors']>;
  /** Elevation brick (flat, soft, float, halo) */
  elevations?: Partial<NovaElevationsContract>;
  /** Motion & animation physics brick (crisp, smooth, calm, bounce, durations) */
  motion?: Partial<NovaMotionContract>;
  /** Spacing scale brick (xxs to xl) */
  spacing?: Partial<NovaThemeContract['spacing']>;
  /** Corner radii squircle brick (none, sm, squircle, full) */
  radii?: Partial<NovaThemeContract['radii']>;
}

export interface ModularThemeEngine {
  /** Active theme preset name signal */
  themeName: Signal<ThemePresetName | string>;
  /** Active assembled theme contract signal */
  activeContract: Signal<NovaThemeContract>;
  /** Active elevation preset signal */
  elevation: Signal<ElevationPreset>;
  /** Whether the current theme is dark mode */
  isDark: Computed<boolean>;
  /** Switch to any registered theme preset ('paper', 'blossom', 'matcha', 'twilight', 'midnight', etc.) */
  setTheme: (name: ThemePresetName | string) => void;
  /** Set elevation level ('flat', 'soft', 'float', 'halo') */
  setElevation: (level: ElevationPreset) => void;
  /** Register or override a theme preset like a Lego brick */
  registerTheme: (name: string, base: ThemePresetName | NovaThemeContract, overrides?: ThemeLegoBricks) => void;
  /** Compose and apply a modular theme brick to a specific DOM subtree */
  applyScopedBricks: (element: HTMLElement, bricks: ThemeLegoBricks) => CleanupFn;
  /** Clean up listeners and reactive bindings */
  destroy: CleanupFn;
}

export interface ThemeEngineOptions {
  initialTheme?: ThemePresetName | string;
  initialElevation?: ElevationPreset;
  targetElement?: HTMLElement;
}

/**
 * Creates a reactive, modular Theme Engine instance.
 * Allows assembling themes modularly (colors + elevations + motion + radii) like Lego bricks.
 */
export function createThemeEngine(options: ThemeEngineOptions = {}): ModularThemeEngine {
  const customRegistry = new Map<string, NovaThemeContract>();
  const initial = options.initialTheme ?? 'paper';

  const themeName = signal<ThemePresetName | string>(initial);
  const elevation = signal<ElevationPreset>(options.initialElevation ?? 'soft');

  const resolveContract = (name: string): NovaThemeContract => {
    if (customRegistry.has(name)) {
      return customRegistry.get(name)!;
    }
    if (name in THEME_PRESETS) {
      return THEME_PRESETS[name as ThemePresetName];
    }
    return THEME_PRESETS.paper;
  };

  const activeContract = signal<NovaThemeContract>(resolveContract(themeName.peek()));

  const isDark = computed(() => {
    const bg = activeContract.value.colors.background;
    const match = bg.match(/oklch\(\s*([0-9\.]+)%/);
    if (match && match[1]) {
      return parseFloat(match[1]) < 50;
    }
    return themeName.value === 'midnight' || themeName.value === 'twilight';
  });

  const dispose = effect(() => {
    const currentName = themeName.value;
    const contract = resolveContract(currentName);
    activeContract.value = contract;

    applyThemePreset(contract, options.targetElement);

    const root = options.targetElement ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
    if (root) {
      root.setAttribute('data-zuari-theme', currentName);
      root.setAttribute('data-zuari-elevation', elevation.value);
      root.setAttribute('data-theme-mode', isDark.value ? 'dark' : 'light');
    }
  });

  function setTheme(name: ThemePresetName | string): void {
    themeName.value = name;
  }

  function setElevation(level: ElevationPreset): void {
    elevation.value = level;
  }

  function registerTheme(
    name: string,
    base: ThemePresetName | NovaThemeContract,
    overrides?: ThemeLegoBricks
  ): void {
    const baseContract = typeof base === 'string' ? resolveContract(base) : base;
    const assembled: NovaThemeContract = {
      name: name as ThemePresetName,
      colors: { ...baseContract.colors, ...(overrides?.colors ?? {}) },
      spacing: { ...baseContract.spacing, ...(overrides?.spacing ?? {}) },
      radii: { ...baseContract.radii, ...(overrides?.radii ?? {}) },
      elevations: { ...(baseContract.elevations ?? darkElevations), ...(overrides?.elevations ?? {}) },
      motion: { ...(baseContract.motion ?? motionPresets), ...(overrides?.motion ?? {}) }
    };

    customRegistry.set(name, assembled);
    if (themeName.value === name) {
      // Re-trigger effect
      activeContract.value = assembled;
      applyThemePreset(assembled, options.targetElement);
    }
  }

  function applyScopedBricks(element: HTMLElement, bricks: ThemeLegoBricks): CleanupFn {
    const previousStyles: Array<{ prop: string; val: string }> = [];

    const setProp = (prop: string, val: string | undefined) => {
      if (val !== undefined) {
        previousStyles.push({ prop, val: element.style.getPropertyValue(prop) });
        element.style.setProperty(prop, val);
      }
    };

    if (bricks.colors) {
      for (const [k, v] of Object.entries(bricks.colors)) {
        setProp(`--nova-color-${k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`, v);
      }
    }
    if (bricks.elevations) {
      for (const [k, v] of Object.entries(bricks.elevations)) {
        setProp(`--zuari-elevation-${k}`, v);
      }
    }
    if (bricks.motion) {
      for (const [k, v] of Object.entries(bricks.motion)) {
        setProp(`--zuari-motion-${k}`, v);
      }
    }
    if (bricks.spacing) {
      for (const [k, v] of Object.entries(bricks.spacing)) {
        setProp(`--nova-space-${k}`, v);
      }
    }
    if (bricks.radii) {
      for (const [k, v] of Object.entries(bricks.radii)) {
        setProp(`--nova-radius-${k}`, v);
      }
    }

    return () => {
      for (const item of previousStyles) {
        if (item.val) {
          element.style.setProperty(item.prop, item.val);
        } else {
          element.style.removeProperty(item.prop);
        }
      }
    };
  }

  return {
    themeName,
    activeContract,
    elevation,
    isDark,
    setTheme,
    setElevation,
    registerTheme,
    applyScopedBricks,
    destroy: dispose
  };
}
