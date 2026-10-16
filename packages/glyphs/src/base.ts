export interface GlyphProps {
  size?: number | string | undefined;
  class?: string | undefined;
  title?: string | undefined;
}

export type GlyphDefinition = (props?: GlyphProps) => SVGElement;

export function createSvgElement(viewBox: string, innerSvg: string, props: GlyphProps = {}): SVGElement {
  const size = props.size ?? 20;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.75');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  if (props.class) {
    svg.setAttribute('class', props.class);
  }
  svg.innerHTML = innerSvg;
  return svg;
}
