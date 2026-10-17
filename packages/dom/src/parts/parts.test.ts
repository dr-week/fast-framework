import { describe, it, expect } from 'vitest';
import { createChildPart, createAttributePart, hasNativeDOMParts, FallbackChildPart, FallbackAttributePart } from './index.js';

describe('@zuari/dom W3C DOM Parts Engine', () => {
  it('correctly feature-detects native browser DOM Parts support', () => {
    // Happy-dom by default does not implement W3C Parts yet
    expect(typeof hasNativeDOMParts()).toBe('boolean');
  });

  it('ChildPart manages dynamic node insertion and text updates', () => {
    const container = document.createElement('div');
    const placeholder = document.createComment('marker');
    container.appendChild(placeholder);

    const childPart = createChildPart(placeholder);
    expect(childPart).toBeInstanceOf(FallbackChildPart);

    // Initial value
    childPart.setValue('Initial Text');
    expect(container.textContent).toBe('Initial Text');

    // Update value
    childPart.setValue('Updated Text');
    expect(container.textContent).toBe('Updated Text');

    // Replace with actual DOM Element
    const span = document.createElement('span');
    span.textContent = 'Span Content';
    childPart.setValue(span);
    expect(container.querySelector('span')?.textContent).toBe('Span Content');
  });

  it('AttributePart updates and removes element attributes dynamically', () => {
    const el = document.createElement('button');
    const attrPart = createAttributePart(el, 'disabled');
    expect(attrPart).toBeInstanceOf(FallbackAttributePart);

    attrPart.setValue('true');
    expect(el.getAttribute('disabled')).toBe('true');

    // Falsy value removes attribute
    attrPart.setValue(false);
    expect(el.hasAttribute('disabled')).toBe(false);

    attrPart.setValue('disabled');
    expect(el.getAttribute('disabled')).toBe('disabled');

    attrPart.setValue(null);
    expect(el.hasAttribute('disabled')).toBe(false);
  });
});
