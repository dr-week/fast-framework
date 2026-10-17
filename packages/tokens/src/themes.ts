import type {
  NovaThemeContract,
  NovaElevationsContract,
  NovaMotionContract,
  ThemePresetName
} from './contract.js';

/**
 * Lightweight Dark Elevations (`flat`, `soft`, `float`, `halo`)
 * Uses airy, whisper-thin borders and subtle depth instead of heavy drop shadows.
 */
export const darkElevations: NovaElevationsContract = {
  flat: '0 1px 2px oklch(0% 0 0 / 0.14), 0 0 0 1px oklch(100% 0 0 / 0.06)',
  soft: '0 4px 14px -2px oklch(0% 0 0 / 0.22), 0 0 0 1px oklch(100% 0 0 / 0.08)',
  float: '0 10px 28px -6px oklch(0% 0 0 / 0.28), 0 2px 6px oklch(0% 0 0 / 0.12)',
  halo: '0 20px 44px -10px oklch(0% 0 0 / 0.36), 0 0 24px oklch(75% 0.15 200 / 0.12)'
};

/**
 * Lightweight Daylight Elevations (`flat`, `soft`, `float`, `halo`)
 * Feels like layered art paper in natural sunlight.
 */
export const lightElevations: NovaElevationsContract = {
  flat: '0 1px 2px oklch(20% 0.02 60 / 0.04), 0 0 0 1px oklch(20% 0.02 60 / 0.07)',
  soft: '0 4px 12px -2px oklch(20% 0.02 60 / 0.06), 0 1px 3px oklch(20% 0.02 60 / 0.04)',
  float: '0 10px 24px -6px oklch(20% 0.02 60 / 0.08), 0 2px 6px oklch(20% 0.02 60 / 0.04)',
  halo: '0 18px 40px -8px oklch(20% 0.02 60 / 0.11), 0 4px 12px oklch(20% 0.02 60 / 0.05)'
};

/**
 * Smooth & Expressive Motion Curves (`crisp`, `smooth`, `calm`, `bounce`)
 */
export const motionPresets: NovaMotionContract = {
  crisp: 'cubic-bezier(0.22, 1, 0.36, 1)',
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
  calm: 'cubic-bezier(0.33, 1, 0.68, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  fast: '140ms',
  normal: '240ms',
  slow: '420ms'
};

const baseSpacing = {
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '32px'
} as const;

const baseRadii = {
  none: '0',
  sm: '6px',
  squircle: '14px',
  full: '9999px'
} as const;

/**
 * 1. Midnight Theme (`midnight` / `aetherDarkTokens`) — Deep Spatial Glass & Cyan Glow
 */
export const midnightTokens: NovaThemeContract = {
  name: 'midnight',
  colors: {
    background: 'oklch(14% 0.015 260)',
    surface: 'oklch(19% 0.02 260 / 0.7)',
    surfaceHover: 'oklch(25% 0.03 260 / 0.85)',
    border: 'oklch(100% 0 0 / 0.09)',
    glyph: 'oklch(78% 0.015 260)',
    glyphActive: 'oklch(96% 0.01 260)',
    accent: 'oklch(75% 0.18 190)',
    danger: 'oklch(62% 0.22 25)'
  },
  spacing: baseSpacing,
  radii: baseRadii,
  elevations: darkElevations,
  motion: motionPresets
};

/** Alias for backwards compatibility */
export const aetherDarkTokens: NovaThemeContract = midnightTokens;

/**
 * 2. Paper Theme (`paper`) — Warm Minimal Art Paper, Charcoal Ink & Stamp-Red Accent
 */
export const paperTokens: NovaThemeContract = {
  name: 'paper',
  colors: {
    background: 'oklch(97% 0.012 85)',
    surface: 'oklch(99% 0.008 85 / 0.82)',
    surfaceHover: 'oklch(95% 0.016 85 / 0.92)',
    border: 'oklch(25% 0.02 70 / 0.11)',
    glyph: 'oklch(38% 0.02 70)',
    glyphActive: 'oklch(18% 0.015 70)',
    accent: 'oklch(58% 0.21 32)',
    danger: 'oklch(52% 0.22 25)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '4px',
    squircle: '10px',
    full: '9999px'
  },
  elevations: lightElevations,
  motion: motionPresets
};

/**
 * 3. Blossom Theme (`blossom`) — Soft Anime Daylight, Pastel Pink Blush & Clear Sky
 */
export const blossomTokens: NovaThemeContract = {
  name: 'blossom',
  colors: {
    background: 'oklch(98% 0.01 350)',
    surface: 'oklch(99% 0.008 350 / 0.78)',
    surfaceHover: 'oklch(96% 0.02 350 / 0.9)',
    border: 'oklch(45% 0.08 350 / 0.12)',
    glyph: 'oklch(42% 0.035 340)',
    glyphActive: 'oklch(22% 0.04 340)',
    accent: 'oklch(70% 0.17 352)',
    danger: 'oklch(60% 0.21 22)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '8px',
    squircle: '16px',
    full: '9999px'
  },
  elevations: lightElevations,
  motion: motionPresets
};

/**
 * 4. Matcha Theme (`matcha`) — Calm Garden Greens, Soft Sunlight & Natural Warmth
 */
export const matchaTokens: NovaThemeContract = {
  name: 'matcha',
  colors: {
    background: 'oklch(97% 0.014 135)',
    surface: 'oklch(99% 0.01 135 / 0.8)',
    surfaceHover: 'oklch(94% 0.022 135 / 0.9)',
    border: 'oklch(30% 0.04 145 / 0.11)',
    glyph: 'oklch(38% 0.04 145)',
    glyphActive: 'oklch(20% 0.04 145)',
    accent: 'oklch(62% 0.15 148)',
    danger: 'oklch(58% 0.2 28)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '6px',
    squircle: '14px',
    full: '9999px'
  },
  elevations: lightElevations,
  motion: motionPresets
};

/**
 * 5. Twilight Theme (`twilight`) — Anime Sunset Dusk, Deep Indigo & Warm Lantern Amber
 */
export const twilightTokens: NovaThemeContract = {
  name: 'twilight',
  colors: {
    background: 'oklch(17% 0.035 275)',
    surface: 'oklch(23% 0.04 275 / 0.72)',
    surfaceHover: 'oklch(29% 0.05 275 / 0.86)',
    border: 'oklch(90% 0.06 55 / 0.14)',
    glyph: 'oklch(82% 0.03 275)',
    glyphActive: 'oklch(98% 0.015 65)',
    accent: 'oklch(76% 0.17 55)',
    danger: 'oklch(64% 0.22 25)'
  },
  spacing: baseSpacing,
  radii: baseRadii,
  elevations: darkElevations,
  motion: motionPresets
};

/**
 * Easy-to-use dictionary of all built-in Theme Presets.
 */
export const THEME_PRESETS: Record<ThemePresetName, NovaThemeContract> = {
  paper: paperTokens,
  blossom: blossomTokens,
  matcha: matchaTokens,
  twilight: twilightTokens,
  midnight: midnightTokens
};


