import { describe, it, expect, vi } from 'vitest';
import { signal } from '@zuari/signals';
import { html, render } from '../src/index.js';

describe('@zuari/dom direct-to-DOM template compiler', () => {
  it('renders static HTML correctly without virtual DOM', () => {
    const template = html`<div class="card"><h1>Zuari</h1><p>Fast Web</p></div>`;
    const { fragment } = render(template);

    const div = fragment.querySelector('.card');
    expect(div).not.toBeNull();
    expect(div?.querySelector('h1')?.textContent).toBe('Zuari');
    expect(div?.querySelector('p')?.textContent).toBe('Fast Web');
  });

  it('binds reactive signals to text nodes and mutates directly without re-renders', () => {
    const count = signal(0);
    const template = html`<div class="counter">Count: <span>${count}</span></div>`;
    const { fragment, destroy } = render(template);

    const span = fragment.querySelector('span');
    expect(span?.textContent).toBe('0');

    // Mutate signal
    count.value = 42;
    expect(span?.textContent).toBe('42');

    destroy();
    count.value = 100;
    // Destroyed effect should not update text node
    expect(span?.textContent).toBe('42');
  });

  it('binds reactive attributes dynamically', () => {
    const isDark = signal(true);
    const template = html`<div data-theme=${isDark}>Content</div>`;
    const { fragment } = render(template);

    const div = fragment.querySelector('div');
    expect(div?.getAttribute('data-theme')).toBe('true');

    isDark.value = false;
    expect(div?.hasAttribute('data-theme')).toBe(false);
  });

  it('binds event listeners without synthetic delegation', () => {
    const clickHandler = vi.fn();
    const template = html`<button @click=${clickHandler}>Click me</button>`;
    const { fragment } = render(template);

    const btn = fragment.querySelector('button')!;
    btn.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });
});
