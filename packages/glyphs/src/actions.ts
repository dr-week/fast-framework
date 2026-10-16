import { createSvgElement, type GlyphDefinition } from './base.js';

/**
 * Modern AI / Sparkle Glyph
 */
export const SparkleGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>`,
    props
  );

/**
 * Command / Terminal Glyph
 */
export const CommandGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>`,
    props
  );
