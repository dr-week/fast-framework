import { effect, type CleanupFn, type Signal } from '@zuari/signals';
import { createChildPart, createAttributePart } from './parts/index.js';

export * from './parts/index.js';
export * from './transition/index.js';

export type TemplateValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined 
  | Node 
  | Signal<unknown> 
  | (() => unknown);

export interface TemplateResult {
  strings: TemplateStringsArray;
  values: TemplateValue[];
}

export interface RenderInstance {
  fragment: DocumentFragment;
  destroy: CleanupFn;
}

const templateCache = new Map<string, HTMLTemplateElement>();
const HOLE_PREFIX = '<!--zuari-hole-';
const HOLE_SUFFIX = '-->';
const ATTR_PREFIX = 'data-zuari-attr-';

/**
 * Tagged template literal for direct-to-DOM compilation.
 * Example: html`<div class="card">Hello ${name}</div>`
 */
export function html(strings: TemplateStringsArray, ...values: TemplateValue[]): TemplateResult {
  return { strings, values };
}

/**
 * Renders a TemplateResult directly into a live DOM DocumentFragment,
 * creating fine-grained signal subscriptions via W3C DOM Parts without any Virtual DOM.
 */
export function render(result: TemplateResult): RenderInstance {
  const { strings, values } = result;
  const rawKey = strings.join('<!--?-->');

  let template = templateCache.get(rawKey);
  if (!template) {
    template = document.createElement('template');
    let htmlMarkup = '';
    
    for (let i = 0; i < strings.length; i++) {
      htmlMarkup += strings[i];
      if (i < values.length) {
        // Detect if we are inside an attribute or a child node
        const lastChunk = strings[i] ?? '';
        const isAttribute = /=["']?[^"'>]*$/.test(lastChunk);
        
        if (isAttribute) {
          htmlMarkup += `"${ATTR_PREFIX}${i}"`;
        } else {
          htmlMarkup += `${HOLE_PREFIX}${i}${HOLE_SUFFIX}`;
        }
      }
    }
    template.innerHTML = htmlMarkup;
    templateCache.set(rawKey, template);
  }

  // Clone native template content directly (fastest browser method)
  const clone = template.content.cloneNode(true) as DocumentFragment;
  const cleanups: CleanupFn[] = [];

  // Bind dynamic holes via DOM Parts
  values.forEach((value, index) => {
    bindDynamicHole(clone, index, value, cleanups);
  });

  return {
    fragment: clone,
    destroy: () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    }
  };
}

function bindDynamicHole(
  root: DocumentFragment,
  index: number,
  value: TemplateValue,
  cleanups: CleanupFn[]
): void {
  // 1. Check for child comment hole -> W3C ChildPart
  const commentNode = findCommentHole(root, `${HOLE_PREFIX}${index}${HOLE_SUFFIX}`);
  
  if (commentNode) {
    const childPart = createChildPart(commentNode);

    if (isReactive(value)) {
      const dispose = effect(() => {
        childPart.setValue(unwrap(value));
      });
      cleanups.push(() => {
        dispose();
        childPart.disconnect?.();
      });
    } else {
      childPart.setValue(value);
    }
    return;
  }

  // 2. Check for attribute binding -> W3C AttributePart
  const attrMarker = `${ATTR_PREFIX}${index}`;
  const elementWithAttr = findElementWithAttributeMarker(root, attrMarker);

  if (elementWithAttr) {
    const { element, attrName } = elementWithAttr;

    // Handle event listener bindings like @click=${fn} or onClick=${fn}
    if (attrName.startsWith('@') || attrName.startsWith('on')) {
      const eventName = (attrName.startsWith('@') ? attrName.slice(1) : attrName.slice(2)).toLowerCase();
      element.removeAttribute(attrName);

      if (typeof value === 'function') {
        const handler = value as EventListener;
        element.addEventListener(eventName, handler);
        cleanups.push(() => element.removeEventListener(eventName, handler));
      }
      return;
    }

    const attributePart = createAttributePart(element, attrName);

    if (isReactive(value)) {
      const dispose = effect(() => {
        attributePart.setValue(unwrap(value));
      });
      cleanups.push(() => {
        dispose();
        attributePart.disconnect?.();
      });
    } else {
      attributePart.setValue(value);
    }
  }
}

function isReactive(val: unknown): boolean {
  return (
    (typeof val === 'object' && val !== null && 'value' in val) ||
    typeof val === 'function'
  );
}

function unwrap(val: unknown): unknown {
  if (typeof val === 'object' && val !== null && 'value' in val) {
    return (val as { value: unknown }).value;
  }
  if (typeof val === 'function') {
    return (val as () => unknown)();
  }
  return val;
}

function findCommentHole(node: Node, targetContent: string): Comment | null {
  const iterator = document.createNodeIterator(node, NodeFilter.SHOW_COMMENT);
  let current = iterator.nextNode() as Comment | null;
  while (current) {
    if (`<!--${current.data}-->` === targetContent) {
      return current;
    }
    current = iterator.nextNode() as Comment | null;
  }
  return null;
}

function findElementWithAttributeMarker(
  root: Node,
  marker: string
): { element: Element; attrName: string } | null {
  const iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
  let current = iterator.nextNode() as Element | null;
  while (current) {
    for (let i = 0; i < current.attributes.length; i++) {
      const attr = current.attributes[i];
      if (attr && attr.value.includes(marker)) {
        return { element: current, attrName: attr.name };
      }
    }
    current = iterator.nextNode() as Element | null;
  }
  return null;
}
