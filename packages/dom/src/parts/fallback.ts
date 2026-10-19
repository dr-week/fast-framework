import type { ChildPart, AttributePart } from './types.js';

/**
 * High-performance fallback implementation of W3C ChildNodePart.
 * Manages atomic text node or sub-tree replacement between marker boundaries.
 */
export class FallbackChildPart implements ChildPart {
  parentNode: Node;
  previousSibling: Node | null;
  nextSibling: Node | null;
  value: unknown = undefined;
  private _currentNode: Node;

  constructor(placeholderNode: Node) {
    const parent = placeholderNode.parentNode;
    if (!parent) {
      throw new Error('[Zuari DOM Parts]: Placeholder node must have a parent container.');
    }
    this.parentNode = parent;
    this.previousSibling = placeholderNode.previousSibling;
    this.nextSibling = placeholderNode.nextSibling;

    const initialText = document.createTextNode('');
    parent.replaceChild(initialText, placeholderNode);
    this._currentNode = initialText;
  }

  setValue(val: unknown): void {
    this.value = val;
    if (val instanceof DocumentFragment) {
      // DocumentFragment transfers children when appended/inserted
      const anchor = document.createTextNode('');
      this.parentNode.replaceChild(anchor, this._currentNode);
      this.parentNode.insertBefore(val, anchor);
      this._currentNode = anchor;
      return;
    }

    if (val instanceof Node) {
      if (this._currentNode !== val) {
        this.parentNode.replaceChild(val, this._currentNode);
        this._currentNode = val;
      }
      return;
    }

    if (this._currentNode instanceof Text) {
      this._currentNode.data = String(val ?? '');
    } else {
      const newText = document.createTextNode(String(val ?? ''));
      this.parentNode.replaceChild(newText, this._currentNode);
      this._currentNode = newText;
    }
  }


  disconnect(): void {
    // Teardown listener reference; preserve DOM tree integrity
  }
}

/**
 * High-performance fallback implementation of W3C AttributePart.
 * Updates or removes element attributes dynamically with zero VDOM diffing.
 */
export class FallbackAttributePart implements AttributePart {
  element: Element;
  attributeName: string;
  value: unknown = undefined;

  constructor(element: Element, attributeName: string) {
    this.element = element;
    this.attributeName = attributeName;
  }

  setValue(val: unknown): void {
    this.value = val;
    if (val === false || val === null || val === undefined) {
      this.element.removeAttribute(this.attributeName);
    } else {
      this.element.setAttribute(this.attributeName, String(val));
    }
  }

  disconnect(): void {
    this.element.removeAttribute(this.attributeName);
  }
}
