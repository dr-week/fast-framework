import type { NovaThemeContract } from './contract.js';

/**
 * Default Aether-Glyph Minimalist Dark Theme
 */
export const aetherDarkTokens: NovaThemeContract = {
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
  spacing: {
    xxs: '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '32px'
  },
  radii: {
    none: '0',
    sm: '6px',
    squircle: '14px',
    full: '9999px'
  }
};
