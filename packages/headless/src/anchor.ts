let anchorCounter = 0;

/**
 * Allocates a unique CSS anchor-name identifier for native CSS Anchor Positioning.
 */
export function generateAnchorName(prefix: string = 'nova-anchor'): string {
  return `--${prefix}-${++anchorCounter}`;
}

/**
 * Links a target element to a source anchor identifier natively.
 */
export function setElementAnchor(element: HTMLElement, anchorName: string): void {
  element.style.setProperty('anchor-name', anchorName);
}

/**
 * Tethers a floating element (like a popover or tooltip) to an anchor identifier.
 */
export function tetherToAnchor(floatingElement: HTMLElement, anchorName: string): void {
  floatingElement.style.setProperty('position-anchor', anchorName);
}
