export type OKLCHColor = `oklch(${number}% ${number} ${number})` | `oklch(${number}% ${number} ${number} / ${number})`;
export type CSSLength = `${number}px` | `${number}rem` | `${number}em` | '0';

/**
 * Modular Japanese Minimal & Anime-Artistic UI/UX Preset Identifiers:
 * - 'aether': Deep spatial glass & cyan luminescence
 * - 'washi': Warm Japanese handmade paper, sumi ink, and hanko vermilion seal
 * - 'sakura': Soft anime spring daylight, petal blush, andcel-shaded clarity
 * - 'komorebi': Dappled forest sunlight through leaves, matcha sage, and organic warmth
 * - 'tasogare': Anime twilight ("Kataware-doki"), indigo dusk, and warm amber lantern glow
 */
export type JapaneseAestheticPresetName = 'aether' | 'washi' | 'sakura' | 'komorebi' | 'tasogare';

/**
 * Lightweight Japanese elevation tiers (subtle paper & shoji depth without heavy Western drop-shadows):
 * - 'kami': Flat paper rest (1px hairline border + whisper ambient shadow)
 * - 'shoji': Translucent sliding screen floating 2px above canvas
 * - 'kaze': Wind-lifted floating card with airy diffuse luminance
 * - 'sora': Sky-level modal/command elevation with soft atmospheric halo
 */
export type ElevationPresetTier = 'kami' | 'shoji' | 'kaze' | 'sora';

/**
 * Human-artistic & anime-inspired motion timing presets:
 * - 'snappy': Crisp anime keyframe snap (Yutaka-style responsive overshoot)
 * - 'fluid': Silk & ink-wash brushstroke glide
 * - 'gentle': Organic breathing / leaf-drift ease
 * - 'spring': Elastic physics spring via CSS linear() / cubic-bezier
 */
export type MotionPresetName = 'snappy' | 'fluid' | 'gentle' | 'spring';

export interface NovaElevationsContract {
  kami: string;
  shoji: string;
  kaze: string;
  sora: string;
}

export interface NovaMotionContract {
  snappy: string;
  fluid: string;
  gentle: string;
  spring: string;
  durationFast: `${number}ms`;
  durationBase: `${number}ms`;
  durationSlow: `${number}ms`;
}

export interface NovaThemeContract {
  name?: JapaneseAestheticPresetName | undefined;
  colors: {
    background: OKLCHColor;
    surface: OKLCHColor;
    surfaceHover: OKLCHColor;
    border: OKLCHColor;
    glyph: OKLCHColor;
    glyphActive: OKLCHColor;
    accent: OKLCHColor;
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
}

