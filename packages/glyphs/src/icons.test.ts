import { describe, it, expect } from 'vitest';
import {
  UserGlyph,
  SearchGlyph,
  BellGlyph,
  HomeGlyph,
  PlusGlyph,
  CloseGlyph,
  CheckGlyph,
  ExternalLinkGlyph,
  HeartGlyph,
  ShareGlyph,
  MessageGlyph,
  BookmarkGlyph,
  MonitorGlyph,
  PrinterGlyph,
  FlameGlyph,
  TunerGlyph,
  GridGlyph,
  LayersGlyph
} from './index.js';

describe('@zuari/glyphs icon library', () => {
  it('renders precision SVG elements with standardized stroke and viewBox', () => {
    const userSvg = UserGlyph({ size: 24, class: 'user-icon' });
    expect(userSvg instanceof SVGElement).toBe(true);
    expect(userSvg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(userSvg.getAttribute('width')).toBe('24');
    expect(userSvg.getAttribute('height')).toBe('24');
    expect(userSvg.getAttribute('fill')).toBe('none');
    expect(userSvg.getAttribute('stroke')).toBe('currentColor');
    expect(userSvg.getAttribute('stroke-linecap')).toBe('round');
    expect(userSvg.classList.contains('user-icon')).toBe(true);
  });

  it('renders standard platform navigation and interaction glyphs', () => {
    const glyphs = [
      SearchGlyph(),
      BellGlyph(),
      HomeGlyph(),
      PlusGlyph(),
      CloseGlyph(),
      CheckGlyph(),
      ExternalLinkGlyph(),
      HeartGlyph(),
      ShareGlyph(),
      MessageGlyph(),
      BookmarkGlyph(),
      MonitorGlyph(),
      PrinterGlyph(),
      FlameGlyph(),
      TunerGlyph(),
      GridGlyph(),
      LayersGlyph()
    ];

    for (const g of glyphs) {
      expect(g instanceof SVGElement).toBe(true);
      expect(g.getAttribute('viewBox')).toBe('0 0 24 24');
      expect(g.getAttribute('aria-hidden')).toBe('true');
      expect(g.innerHTML.length).toBeGreaterThan(0);
    }
  });
});
