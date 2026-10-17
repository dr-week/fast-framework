import type { ChildPart, AttributePart } from './types.js';
import { hasNativeDOMParts } from './detector.js';
import { FallbackChildPart, FallbackAttributePart } from './fallback.js';

/**
 * Creates a ChildPart targeting a dynamic node slot.
 * Automatically delegates to native browser ChildNodePart if available,
 * otherwise transparently falls back to Zuari's zero-cost DOM pointer engine.
 */
export function createChildPart(placeholder: Node): ChildPart {
  if (hasNativeDOMParts()) {
    try {
      // Native Chromium / WebKit DOM Parts constructor
      const NativeChildNodePart = (window as unknown as { ChildNodePart: new (node: Node) => ChildPart }).ChildNodePart;
      return new NativeChildNodePart(placeholder);
    } catch {
      // Fallback if constructor signature differs
      return new FallbackChildPart(placeholder);
    }
  }
  return new FallbackChildPart(placeholder);
}

/**
 * Creates an AttributePart targeting an element attribute.
 */
export function createAttributePart(element: Element, attributeName: string): AttributePart {
  if (hasNativeDOMParts()) {
    try {
      const NativeAttributePart = (window as unknown as { AttributePart: new (el: Element, name: string) => AttributePart }).AttributePart;
      return new NativeAttributePart(element, attributeName);
    } catch {
      return new FallbackAttributePart(element, attributeName);
    }
  }
  return new FallbackAttributePart(element, attributeName);
}
