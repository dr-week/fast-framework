import { signal, effect, type Signal, type CleanupFn } from '@zuari/signals';
import { generateAnchorName, setElementAnchor } from './anchor.js';
import { createTooltip } from './tooltip.js';

export interface GlyphButtonOptions {
  label: string;
  tooltip?: string | undefined;
  onClick?: ((event: MouseEvent) => void) | undefined;
  active?: Signal<boolean> | boolean | undefined;
}

export interface GlyphButtonInstance {
  buttonElement: HTMLButtonElement;
  tooltipElement?: HTMLDivElement | undefined;
  isActive: Signal<boolean>;
  destroy: CleanupFn;
}

/**
 * Creates an accessible, anchor-positioned icon button with zero visual bloat.
 */
export function createGlyphButton(options: GlyphButtonOptions): GlyphButtonInstance {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', options.label);

  const isActive = typeof options.active === 'object' && options.active !== null && 'value' in options.active
    ? options.active
    : signal(Boolean(options.active));

  const anchorName = generateAnchorName();
  setElementAnchor(btn, anchorName);

  if (options.onClick) {
    btn.addEventListener('click', options.onClick);
  }

  let tooltipEl: HTMLDivElement | undefined;
  let cleanupEffect: CleanupFn = () => {};

  if (options.tooltip) {
    const tip = createTooltip({ content: options.tooltip, anchorName });
    tooltipEl = tip.tooltipElement;
    btn.setAttribute('aria-describedby', tip.id);
  }

  // Reactive state binding to DOM attributes
  cleanupEffect = effect(() => {
    if (isActive.value) {
      btn.setAttribute('data-active', 'true');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.removeAttribute('data-active');
      btn.removeAttribute('aria-pressed');
    }
  });

  return {
    buttonElement: btn,
    tooltipElement: tooltipEl,
    isActive,
    destroy: () => {
      cleanupEffect();
      if (options.onClick) {
        btn.removeEventListener('click', options.onClick);
      }
    }
  };
}
