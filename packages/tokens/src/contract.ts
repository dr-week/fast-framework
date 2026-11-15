export type OKLCHColor = `oklch(${number}% ${number} ${number})` | `oklch(${number}% ${number} ${number} / ${number})`;
export type CSSLength = `${number}px` | `${number}rem` | `${number}em` | '0';

/**
 * Easy-to-remember Minimal & Artistic UI/UX Theme Presets:
 * - 'paper': Warm minimal paper, crisp ink text, and stamp-red accent
 * - 'blossom': Soft anime daylight, pastel pink blush, and clean sky tones
 * - 'matcha': Calm botanical garden greens, soft mist, and natural warmth
 * - 'twilight': Anime sunset dusk (indigo-violet sky with warm sunset amber glow)
 * - 'midnight': Deep spatial dark glass with luminous cyan accents
 * - 'studio': Warm ambient light, translucent glass surfaces, and coral-rose accents
 * - 'noir': Near-black editorial surfaces with spectral violet and blue accents
 */
export type ThemePresetName = 'paper' | 'blossom' | 'matcha' | 'twilight' | 'midnight' | 'studio' | 'noir';

/**
 * Lightweight, smooth elevation levels (whisper-light borders and airy depth):
 * - 'flat': Zero lift, crisp 1px subtle border
 * - 'soft': Whisper-light 2px paper lift for everyday cards and inputs
 * - 'float': Smooth floating panel for popovers, menus, and active tiles
 * - 'halo': Atmospheric top-layer glow for modals, dialogs, and command bars
 */
export type ElevationPreset = 'flat' | 'soft' | 'float' | 'halo';

/**
 * Intuitive animation & motion feel presets:
 * - 'crisp': Fast, responsive anime-style keyframe snap
 * - 'smooth': Silky, effortless glide
 * - 'calm': Gentle, unhurried organic ease
 * - 'bounce': Playful, lightweight spring overshoot
 */
export type MotionPreset = 'crisp' | 'smooth' | 'calm' | 'bounce';

export interface NovaElevationsContract {
  flat: string;
  soft: string;
  float: string;
  halo: string;
}

export interface NovaMotionContract {
  crisp: string;
  smooth: string;
  calm: string;
  bounce: string;
  fast: `${number}ms`;
  normal: `${number}ms`;
  slow: `${number}ms`;
}

export interface NovaThemeContract {
  name?: ThemePresetName | undefined;
  colors: {
    background: OKLCHColor;
    surface: OKLCHColor;
    surfaceElevated: OKLCHColor;
    surfaceHover: OKLCHColor;
    /** Optional translucent surface fill for floating bars, docks, and liquid glass cards. */
    surfaceFloating?: OKLCHColor | undefined;
    border: OKLCHColor;
    borderMuted: OKLCHColor;
    /** Optional specular top-rim highlight color for optical glass edge refraction. */
    specularHighlight?: OKLCHColor | undefined;
    glyph: OKLCHColor;
    glyphActive: OKLCHColor;
    accent: OKLCHColor;
    /** Optional second accent stop used by gradient actions. */
    accentSecondary?: OKLCHColor | undefined;
    /** Optional translucent accent used by focus and glow effects. */
    accentGlow?: OKLCHColor | undefined;
    /** Optional foreground color chosen for readable text on accent fills. */
    onAccent?: OKLCHColor | undefined;
    danger: OKLCHColor;
  };
  spacing: {
    xxs: CSSLength;
    xs: CSSLength;
    sm: CSSLength;
    md: CSSLength;
    lg: CSSLength;
    xl: CSSLength;
  };
  radii: {
    none: '0';
    sm: CSSLength;
    squircle: CSSLength;
    full: '9999px';
  };
  elevations?: NovaElevationsContract | undefined;
  motion?: NovaMotionContract | undefined;
  /** Optional optical glass blur, saturation, and specular rim shadow tokens. */
  glass?: {
    blur: string;
    saturation: string;
    rimShadow: string;
  } | undefined;
}


