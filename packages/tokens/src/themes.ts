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
  flat: '0 0 0 1px oklch(100% 0 0 / 0.16)',
  soft: '0 4px 16px -2px oklch(0% 0 0 / 0.45), 0 0 0 1px oklch(100% 0 0 / 0.18)',
  float: '0 12px 32px -6px oklch(0% 0 0 / 0.6), 0 0 0 1px oklch(100% 0 0 / 0.22)',
  halo: '0 20px 48px -8px oklch(0% 0 0 / 0.75), 0 0 0 1px oklch(100% 0 0 / 0.28), 0 0 24px oklch(75% 0.15 200 / 0.2)'
};

/**
 * High-Contrast Daylight Elevations (`flat`, `soft`, `float`, `halo`)
 * Crisp boxy outlines and defined separation so panels never blend into the page.
 */
export const lightElevations: NovaElevationsContract = {
  flat: '0 0 0 1px oklch(20% 0.02 60 / 0.18)',
  soft: '0 4px 16px -2px oklch(20% 0.02 60 / 0.12), 0 0 0 1px oklch(20% 0.02 60 / 0.18)',
  float: '0 12px 30px -6px oklch(20% 0.02 60 / 0.16), 0 0 0 1px oklch(20% 0.02 60 / 0.22)',
  halo: '0 20px 44px -8px oklch(20% 0.02 60 / 0.2), 0 0 0 1px oklch(20% 0.02 60 / 0.28)'
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
  sm: '4px',
  squircle: '8px',
  full: '9999px'
} as const;

/**
 * 1. Midnight Theme (`midnight` / `aetherDarkTokens`) — Deep Spatial Glass & Cyan Glow
 */
export const midnightTokens: NovaThemeContract = {
  name: 'midnight',
  colors: {
    background: 'oklch(12% 0.015 260)',
    surface: 'oklch(18% 0.02 260 / 0.85)',
    surfaceElevated: 'oklch(22% 0.025 260 / 0.95)',
    surfaceHover: 'oklch(26% 0.03 260 / 0.9)',
    border: 'oklch(100% 0 0 / 0.16)',
    borderMuted: 'oklch(100% 0 0 / 0.08)',
    glyph: 'oklch(78% 0.015 260)',
    glyphActive: 'oklch(96% 0.01 260)',
    accent: 'oklch(75% 0.18 190)',
    accentSecondary: 'oklch(72% 0.16 230)',
    accentGlow: 'oklch(75% 0.18 190 / 0.24)',
    onAccent: 'oklch(18% 0.02 260)',
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
    background: 'oklch(96% 0.012 85)',
    surface: 'oklch(99% 0.005 85)',
    surfaceElevated: 'oklch(100% 0 0)',
    surfaceHover: 'oklch(94% 0.018 85)',
    border: 'oklch(25% 0.02 70 / 0.22)',
    borderMuted: 'oklch(25% 0.02 70 / 0.12)',
    glyph: 'oklch(38% 0.02 70)',
    glyphActive: 'oklch(18% 0.015 70)',
    accent: 'oklch(58% 0.21 32)',
    accentSecondary: 'oklch(62% 0.19 15)',
    accentGlow: 'oklch(58% 0.21 32 / 0.18)',
    onAccent: 'oklch(100% 0 0)',
    danger: 'oklch(52% 0.22 25)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '4px',
    squircle: '8px',
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
    background: 'oklch(97% 0.012 350)',
    surface: 'oklch(99% 0.006 350 / 0.95)',
    surfaceElevated: 'oklch(100% 0 0)',
    surfaceHover: 'oklch(95% 0.022 350 / 0.95)',
    border: 'oklch(45% 0.08 350 / 0.22)',
    borderMuted: 'oklch(45% 0.08 350 / 0.12)',
    glyph: 'oklch(42% 0.035 340)',
    glyphActive: 'oklch(22% 0.04 340)',
    accent: 'oklch(70% 0.17 352)',
    accentSecondary: 'oklch(68% 0.16 5)',
    accentGlow: 'oklch(70% 0.17 352 / 0.2)',
    onAccent: 'oklch(25% 0.04 340)',
    danger: 'oklch(60% 0.21 22)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '4px',
    squircle: '8px',
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
    background: 'oklch(96% 0.015 135)',
    surface: 'oklch(99% 0.008 135 / 0.95)',
    surfaceElevated: 'oklch(100% 0 0)',
    surfaceHover: 'oklch(93% 0.025 135 / 0.95)',
    border: 'oklch(30% 0.04 145 / 0.22)',
    borderMuted: 'oklch(30% 0.04 145 / 0.12)',
    glyph: 'oklch(38% 0.04 145)',
    glyphActive: 'oklch(20% 0.04 145)',
    accent: 'oklch(62% 0.15 148)',
    accentSecondary: 'oklch(68% 0.14 125)',
    accentGlow: 'oklch(62% 0.15 148 / 0.18)',
    onAccent: 'oklch(18% 0.04 145)',
    danger: 'oklch(58% 0.2 28)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '4px',
    squircle: '8px',
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
    background: 'oklch(15% 0.035 275)',
    surface: 'oklch(20% 0.04 275 / 0.85)',
    surfaceElevated: 'oklch(25% 0.045 275 / 0.95)',
    surfaceHover: 'oklch(30% 0.05 275 / 0.9)',
    border: 'oklch(90% 0.06 55 / 0.22)',
    borderMuted: 'oklch(90% 0.06 55 / 0.12)',
    glyph: 'oklch(82% 0.03 275)',
    glyphActive: 'oklch(98% 0.015 65)',
    accent: 'oklch(76% 0.17 55)',
    accentSecondary: 'oklch(72% 0.16 35)',
    accentGlow: 'oklch(76% 0.17 55 / 0.23)',
    onAccent: 'oklch(20% 0.04 275)',
    danger: 'oklch(64% 0.22 25)'
  },
  spacing: baseSpacing,
  radii: baseRadii,
  elevations: darkElevations,
  motion: motionPresets
};

/**
 * 6. Studio Theme — Warm daylight backdrop, iridescent rose actions, and liquid-glass surfaces.
 * Keep the ambient effects opt-in via recipes.
 */
export const studioTokens: NovaThemeContract = {
  name: 'studio',
  colors: {
    background: 'oklch(90% 0.045 55)',
    surface: 'oklch(99% 0.025 45 / 0.56)',
    surfaceElevated: 'oklch(100% 0.01 45 / 0.76)',
    surfaceHover: 'oklch(100% 0.02 45 / 0.86)',
    border: 'oklch(100% 0.02 40 / 0.58)',
    borderMuted: 'oklch(100% 0.02 40 / 0.34)',
    glyph: 'oklch(36% 0.035 270)',
    glyphActive: 'oklch(22% 0.03 270)',
    accent: 'oklch(52% 0.19 23)',
    accentSecondary: 'oklch(53% 0.17 350)',
    accentGlow: 'oklch(66% 0.2 20 / 0.26)',
    onAccent: 'oklch(100% 0 0)',
    danger: 'oklch(65% 0.2 25)'
  },
  spacing: baseSpacing,
  radii: { ...baseRadii, squircle: '22px' },
  elevations: {
    flat: '0 0 0 1px oklch(100% 0.02 40 / 0.58), 0 1px 2px oklch(25% 0.04 30 / 0.06)',
    soft: '0 12px 30px -14px oklch(30% 0.05 30 / 0.2), 0 0 0 1px oklch(100% 0.02 40 / 0.56)',
    float: '0 22px 48px -18px oklch(30% 0.05 30 / 0.28), 0 0 0 1px oklch(100% 0.02 40 / 0.62)',
    halo: '0 26px 58px -18px oklch(30% 0.05 30 / 0.28), 0 0 0 1px oklch(100% 0.02 40 / 0.66), 0 0 30px oklch(66% 0.2 20 / 0.2)'
  },
  motion: motionPresets
};

/** 7. Noir Theme — editorial dark glass with restrained spectral violet and blue accents. */
export const noirTokens: NovaThemeContract = {
  name: 'noir',
  colors: {
    background: 'oklch(12% 0.012 270)',
    surface: 'oklch(18% 0.018 270 / 0.82)',
    surfaceElevated: 'oklch(22% 0.022 270 / 0.94)',
    surfaceHover: 'oklch(25% 0.025 270 / 0.92)',
    border: 'oklch(88% 0.025 270 / 0.16)',
    borderMuted: 'oklch(88% 0.025 270 / 0.09)',
    glyph: 'oklch(76% 0.018 270)',
    glyphActive: 'oklch(97% 0.01 270)',
    accent: 'oklch(72% 0.2 295)',
    accentSecondary: 'oklch(75% 0.18 220)',
    accentGlow: 'oklch(70% 0.22 295 / 0.24)',
    onAccent: 'oklch(15% 0.02 270)',
    danger: 'oklch(70% 0.2 25)'
  },
  spacing: baseSpacing,
  radii: { ...baseRadii, squircle: '18px' },
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
  midnight: midnightTokens,
  studio: studioTokens,
  noir: noirTokens
};


