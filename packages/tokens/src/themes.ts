import type {
  NovaThemeContract,
  NovaElevationsContract,
  NovaMotionContract,
  JapaneseAestheticPresetName
} from './contract.js';

/**
 * Lightweight Japanese Paper & Shoji Elevation Presets (Dark/Ambient)
 * Uses ultra-lightweight layered air shadows and 1px ink/luminescent borders.
 */
export const japaneseDarkElevations: NovaElevationsContract = {
  kami: '0 1px 2px oklch(0% 0 0 / 0.14), 0 0 0 1px oklch(100% 0 0 / 0.06)',
  shoji: '0 4px 14px -2px oklch(0% 0 0 / 0.22), 0 0 0 1px oklch(100% 0 0 / 0.08)',
  kaze: '0 10px 28px -6px oklch(0% 0 0 / 0.28), 0 2px 6px oklch(0% 0 0 / 0.12)',
  sora: '0 20px 44px -10px oklch(0% 0 0 / 0.36), 0 0 24px oklch(75% 0.15 200 / 0.12)'
};

/**
 * Lightweight Japanese Paper & Shoji Elevation Presets (Daylight Washi/Sakura)
 * Whisper-soft ink and sunlight shadows that feel like layered handmade paper.
 */
export const japaneseLightElevations: NovaElevationsContract = {
  kami: '0 1px 2px oklch(20% 0.02 60 / 0.04), 0 0 0 1px oklch(20% 0.02 60 / 0.07)',
  shoji: '0 4px 12px -2px oklch(20% 0.02 60 / 0.06), 0 1px 3px oklch(20% 0.02 60 / 0.04)',
  kaze: '0 10px 24px -6px oklch(20% 0.02 60 / 0.08), 0 2px 6px oklch(20% 0.02 60 / 0.04)',
  sora: '0 18px 40px -8px oklch(20% 0.02 60 / 0.11), 0 4px 12px oklch(20% 0.02 60 / 0.05)'
};

/**
 * Anime & Human-Artistic Motion Presets
 * Inspired by Japanese keyframe animation timing (crisp attack, expressive settle).
 */
export const japaneseMotionPresets: NovaMotionContract = {
  snappy: 'cubic-bezier(0.22, 1, 0.36, 1)',
  fluid: 'cubic-bezier(0.16, 1, 0.3, 1)',
  gentle: 'cubic-bezier(0.33, 1, 0.68, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  durationFast: '140ms',
  durationBase: '240ms',
  durationSlow: '420ms'
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
 * 1. Default Aether-Glyph Minimalist Dark Theme
 */
export const aetherDarkTokens: NovaThemeContract = {
  name: 'aether',
  colors: {
    background: 'oklch(14% 0.015 260)',
    surface: 'oklch(19% 0.02 260 / 0.7)',
    surfaceHover: 'oklch(25% 0.03 260 / 0.85)',
    border: 'oklch(100% 0 0 / 0.09)',
    glyph: 'oklch(78% 0.015 260)',
    glyphActive: 'oklch(96% 0.01 260)',
    accent: 'oklch(75% 0.18 190)', // Vibrant future-cyan
    danger: 'oklch(62% 0.22 25)'    // Minimalist coral
  },
  spacing: baseSpacing,
  radii: baseRadii,
  elevations: japaneseDarkElevations,
  motion: japaneseMotionPresets
};

/**
 * 2. Washi & Sumi (和紙と墨) — Minimalist Japanese Paper, Sumi Ink & Hanko Vermilion
 * Tactile warm unbleached paper surface, calligraphic ink typography, and traditional stamp accent.
 */
export const washiPaperTokens: NovaThemeContract = {
  name: 'washi',
  colors: {
    background: 'oklch(97% 0.012 85)',
    surface: 'oklch(99% 0.008 85 / 0.82)',
    surfaceHover: 'oklch(95% 0.016 85 / 0.92)',
    border: 'oklch(25% 0.02 70 / 0.11)',
    glyph: 'oklch(38% 0.02 70)',
    glyphActive: 'oklch(18% 0.015 70)',
    accent: 'oklch(58% 0.21 32)',   // Shu-iro (Japanese Hanko Vermilion seal)
    danger: 'oklch(52% 0.22 25)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '4px',
    squircle: '10px',
    full: '9999px'
  },
  elevations: japaneseLightElevations,
  motion: japaneseMotionPresets
};

/**
 * 3. Sakura Daylight (桜日和) — Anime Spring Breeze, Petal Blush & Cel-Shaded Sky
 * Airy, luminous anime background art aesthetic with delicate blossom accents.
 */
export const sakuraBreezeTokens: NovaThemeContract = {
  name: 'sakura',
  colors: {
    background: 'oklch(98% 0.01 350)',
    surface: 'oklch(99% 0.008 350 / 0.78)',
    surfaceHover: 'oklch(96% 0.02 350 / 0.9)',
    border: 'oklch(45% 0.08 350 / 0.12)',
    glyph: 'oklch(42% 0.035 340)',
    glyphActive: 'oklch(22% 0.04 340)',
    accent: 'oklch(70% 0.17 352)',  // Sakura blossom pink
    danger: 'oklch(60% 0.21 22)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '8px',
    squircle: '16px',
    full: '9999px'
  },
  elevations: japaneseLightElevations,
  motion: japaneseMotionPresets
};

/**
 * 4. Komorebi Matcha (木漏れ日) — Sunlight Filtering Through Forest Leaves
 * Calm human-artistic botanical palette with bamboo mist and jade matcha tones.
 */
export const komorebiMatchaTokens: NovaThemeContract = {
  name: 'komorebi',
  colors: {
    background: 'oklch(97% 0.014 135)',
    surface: 'oklch(99% 0.01 135 / 0.8)',
    surfaceHover: 'oklch(94% 0.022 135 / 0.9)',
    border: 'oklch(30% 0.04 145 / 0.11)',
    glyph: 'oklch(38% 0.04 145)',
    glyphActive: 'oklch(20% 0.04 145)',
    accent: 'oklch(62% 0.15 148)',  // Fresh Matcha & Moss leaf
    danger: 'oklch(58% 0.2 28)'
  },
  spacing: baseSpacing,
  radii: {
    none: '0',
    sm: '6px',
    squircle: '14px',
    full: '9999px'
  },
  elevations: japaneseLightElevations,
  motion: japaneseMotionPresets
};

/**
 * 5. Tasogare Dusk (黄昏 / かたわれ時) — Anime Twilight & Warm Lantern Glow
 * Inspired by Makoto Shinkai twilight skies: deep indigo-violet dusk with warm amber highlights.
 */
export const tasogareDuskTokens: NovaThemeContract = {
  name: 'tasogare',
  colors: {
    background: 'oklch(17% 0.035 275)',
    surface: 'oklch(23% 0.04 275 / 0.72)',
    surfaceHover: 'oklch(29% 0.05 275 / 0.86)',
    border: 'oklch(90% 0.06 55 / 0.14)',
    glyph: 'oklch(82% 0.03 275)',
    glyphActive: 'oklch(98% 0.015 65)',
    accent: 'oklch(76% 0.17 55)',   // Kataware-doki twilight amber-coral
    danger: 'oklch(64% 0.22 25)'
  },
  spacing: baseSpacing,
  radii: baseRadii,
  elevations: japaneseDarkElevations,
  motion: japaneseMotionPresets
};

/**
 * Registry of all built-in Japanese Minimal & Anime-Artistic UI/UX Theme Presets.
 */
export const JAPANESE_THEME_PRESETS: Record<JapaneseAestheticPresetName, NovaThemeContract> = {
  aether: aetherDarkTokens,
  washi: washiPaperTokens,
  sakura: sakuraBreezeTokens,
  komorebi: komorebiMatchaTokens,
  tasogare: tasogareDuskTokens
};

