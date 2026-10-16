export type OKLCHColor = `oklch(${number}% ${number} ${number})` | `oklch(${number}% ${number} ${number} / ${number})`;
export type CSSLength = `${number}px` | `${number}rem` | `${number}em` | '0';

export interface NovaThemeContract {
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
}
