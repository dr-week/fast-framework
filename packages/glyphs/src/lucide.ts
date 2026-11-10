import {
  Activity,
  BarChart3,
  createIcons,
  LayoutGrid,
  Layers3,
  Monitor,
  Printer,
  SlidersHorizontal,
  Sparkles
} from 'lucide';
import type { GlyphDefinition, GlyphProps } from './base.js';

type LucideIconNode = typeof Activity;

function createLucideGlyph(name: string, icon: LucideIconNode): GlyphDefinition {
  return (props: GlyphProps = {}): SVGElement => {
    const root = document.createElement('span');
    const placeholder = document.createElement('i');
    const dataName = name
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/^-/, '');
    placeholder.setAttribute('data-lucide', dataName);
    root.appendChild(placeholder);

    createIcons({ icons: { [name]: icon }, root });
    const svg = root.querySelector('svg');
    if (!svg) {
      throw new Error(`Lucide failed to render the "${name}" icon.`);
    }

    const size = String(props.size ?? 20);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.75');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    if (props.class) svg.setAttribute('class', props.class);
    if (props.title) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', props.title);
      svg.removeAttribute('aria-hidden');
    } else {
      svg.setAttribute('aria-hidden', 'true');
    }
    return svg;
  };
}

export const LucideActivityGlyph = createLucideGlyph('Activity', Activity);
export const LucideBarChartGlyph = createLucideGlyph('BarChart3', BarChart3);
export const LucidePrinterGlyph = createLucideGlyph('Printer', Printer);
export const LucideSparklesGlyph = createLucideGlyph('Sparkles', Sparkles);
export const LucideLayersGlyph = createLucideGlyph('Layers3', Layers3);
export const LucideMonitorGlyph = createLucideGlyph('Monitor', Monitor);
export const LucideSlidersGlyph = createLucideGlyph('SlidersHorizontal', SlidersHorizontal);
export const LucideGridGlyph = createLucideGlyph('LayoutGrid', LayoutGrid);
