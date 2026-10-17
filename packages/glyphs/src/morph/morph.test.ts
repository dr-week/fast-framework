import { describe, it, expect } from 'vitest';
import { createMorphGlyph, MORPH_PATHS } from './index.js';

describe('@zuari/glyphs createMorphGlyph', () => {
  it('initializes with default sparkle path contour', () => {
    const glyph = createMorphGlyph();
    expect(glyph.getState()).toBe('sparkle');
    expect(glyph.pathElement.getAttribute('d')).toBe(MORPH_PATHS.sparkle);
  });

  it('fluidly morphs between state path contours', () => {
    const glyph = createMorphGlyph({ state: 'sparkle' });

    // Morph to loading ring
    glyph.setState('loadingRing');
    expect(glyph.getState()).toBe('loadingRing');
    expect(glyph.pathElement.getAttribute('d')).toBe(MORPH_PATHS.loadingRing);
    expect(glyph.svgElement.classList.contains('zuari-morph-spinning')).toBe(true);

    // Morph to checkmark
    glyph.setState('checkmark');
    expect(glyph.getState()).toBe('checkmark');
    expect(glyph.pathElement.getAttribute('d')).toBe(MORPH_PATHS.checkmark);
    expect(glyph.svgElement.classList.contains('zuari-morph-spinning')).toBe(false);

    // Morph to cross (error)
    glyph.setState('cross');
    expect(glyph.getState()).toBe('cross');
    expect(glyph.pathElement.getAttribute('d')).toBe(MORPH_PATHS.cross);
  });

  it('respects custom size and CSS classes', () => {
    const glyph = createMorphGlyph({ size: 32, class: 'custom-glyph' });
    expect(glyph.svgElement.getAttribute('width')).toBe('32');
    expect(glyph.svgElement.getAttribute('height')).toBe('32');
    expect(glyph.svgElement.classList.contains('custom-glyph')).toBe(true);
  });
});
