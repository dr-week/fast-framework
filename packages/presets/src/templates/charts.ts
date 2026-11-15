/**
 * @fileoverview Compact, accessible inline SVG chart templates for @zuari/presets.
 */

import type {
  SparklineOptions,
  RadialGaugeOptions
} from '../types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Creates an accessible, compact SVG trend line for editorial metric cards. */
export function createSparkline(options: SparklineOptions): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.classList.add('zuari-sparkline');
  svg.dataset.tone = options.tone ?? 'accent';
  svg.setAttribute('viewBox', '0 0 100 32');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', options.label);

  const values = options.values;
  if (!values.length) return svg;

  const min = Math.min(...values);
  const range = Math.max(1, Math.max(...values) - min);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
    const y = 28 - ((value - min) / range) * 24;
    return `${x},${y}`;
  }).join(' ');

  if (options.showArea) {
    const area = document.createElementNS(svg.namespaceURI, 'polygon');
    area.classList.add('zuari-sparkline-area');
    area.setAttribute('points', `0,32 ${points} 100,32`);
    svg.appendChild(area);
  }

  const line = document.createElementNS(svg.namespaceURI, 'polyline');
  line.classList.add('zuari-sparkline-line');
  line.setAttribute('points', points);
  svg.appendChild(line);

  return svg;
}

/** Creates a compact SVG gauge with a textual value and accessible description. */
export function createRadialGauge(options: RadialGaugeOptions): HTMLElement {
  const max = options.max ?? 100;
  const ratio = max > 0 ? Math.min(1, Math.max(0, options.value / max)) : 0;
  const size = options.size ?? 112;
  const thickness = options.thickness ?? 5;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const gauge = document.createElement('div');
  gauge.className = 'zuari-radial-gauge';
  gauge.dataset.tone = options.tone ?? 'accent';
  gauge.setAttribute('role', 'img');
  gauge.setAttribute('aria-label', `${options.label}: ${options.value} of ${max}`);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.width = `${size}px`;
  svg.style.height = `${size}px`;

  const track = document.createElementNS(svg.namespaceURI, 'circle');
  track.classList.add('zuari-gauge-track');
  const arc = document.createElementNS(svg.namespaceURI, 'circle');
  arc.classList.add('zuari-gauge-arc');

  for (const circle of [track, arc]) {
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', String(radius));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke-width', String(thickness));
  }

  arc.setAttribute('stroke-dasharray', `${circumference * ratio} ${circumference}`);
  arc.setAttribute('transform', 'rotate(-90 50 50)');
  svg.append(track, arc);

  const content = document.createElement('span');
  content.className = 'zuari-gauge-value';
  content.textContent = String(options.value);

  const caption = document.createElement('span');
  caption.className = 'zuari-gauge-label';
  caption.textContent = options.label;

  gauge.append(svg, content, caption);
  return gauge;
}
