import { createSvgElement, type GlyphDefinition } from './base.js';

/**
 * Layers / Modular Stack Glyph
 */
export const LayersGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
     <path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5"/>
     <path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5"/>`,
    props
  );

/**
 * Grid / Layout Glyph
 */
export const GridGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<rect width="7" height="7" x="3" y="3" rx="2"/>
     <rect width="7" height="7" x="14" y="3" rx="2"/>
     <rect width="7" height="7" x="14" y="14" rx="2"/>
     <rect width="7" height="7" x="3" y="14" rx="2"/>`,
    props
  );

/**
 * Settings / Tuner Glyph
 */
export const TunerGlyph: GlyphDefinition = (props) =>
  createSvgElement(
    '0 0 24 24',
    `<path d="M20 7h-9"/>
     <path d="M14 17H5"/>
     <circle cx="17" cy="17" r="3"/>
     <circle cx="7" cy="7" r="3"/>`,
    props
  );
