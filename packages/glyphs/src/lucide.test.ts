import { describe, expect, it } from 'vitest';
import {
  LucideActivityGlyph,
  LucideBarChartGlyph,
  LucideGridGlyph,
  LucideLayersGlyph,
  LucideMonitorGlyph,
  LucidePrinterGlyph,
  LucideSlidersGlyph,
  LucideSparklesGlyph
} from './lucide.js';

describe('@zuari/glyphs Lucide adapters', () => {
  it('renders upstream SVG icons with framework sizing and accessible titles', () => {
    const svg = LucideActivityGlyph({ size: 24, class: 'activity-icon', title: 'Activity' });

    expect(svg instanceof SVGElement).toBe(true);
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('stroke-width')).toBe('1.75');
    expect(svg.getAttribute('class')).toBe('activity-icon');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Activity');
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    expect(svg.querySelector('path')).not.toBeNull();
  });

  it('renders the curated framework icon set as decorative SVGs by default', () => {
    const icons = [
      LucideActivityGlyph(),
      LucideBarChartGlyph(),
      LucidePrinterGlyph(),
      LucideSparklesGlyph(),
      LucideLayersGlyph(),
      LucideMonitorGlyph(),
      LucideSlidersGlyph(),
      LucideGridGlyph()
    ];

    for (const icon of icons) {
      expect(icon instanceof SVGElement).toBe(true);
      expect(icon.getAttribute('viewBox')).toBe('0 0 24 24');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.querySelector('path, circle, rect, polyline, line')).not.toBeNull();
    }
  });
});
