import { generateAnchorName, setElementAnchor, tetherToAnchor } from './anchor.js';

export interface TooltipOptions {
  content: string;
  anchorName?: string | undefined;
}

export interface TooltipInstance {
  tooltipElement: HTMLDivElement;
  anchorName: string;
  id: string;
}

let tooltipIdCounter = 0;

/**
 * Creates an accessible, anchor-tethered tooltip primitive.
 */
export function createTooltip(options: TooltipOptions): TooltipInstance {
  const tooltipEl = document.createElement('div');
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.textContent = options.content;

  const anchorName = options.anchorName ?? generateAnchorName();
  tetherToAnchor(tooltipEl, anchorName);

  const id = `nova-tooltip-${++tooltipIdCounter}`;
  tooltipEl.id = id;

  return {
    tooltipElement: tooltipEl,
    anchorName,
    id
  };
}
