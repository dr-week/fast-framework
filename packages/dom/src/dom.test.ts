import { describe, it, expect, vi } from 'vitest';
import { signal } from '@zuari/signals';
import { html, render, repeat, when, match } from '../src/index.js';


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

  it('repeat / keyed reconciles lists by key without recreating nodes', () => {
    const list = signal([
      { id: '1', text: 'First' },
      { id: '2', text: 'Second' }
    ]);

    const template = html`
      <ul>
        ${repeat(list, item => item.id, item => html`<li id=${item.id}>${item.text}</li>`)}
      </ul>
    `;

    const { fragment } = render(template);
    const ul = fragment.querySelector('ul')!;
    const item1 = ul.querySelector('#\\31 ') || Array.from(ul.querySelectorAll('li')).find(el => el.id === '1');
    const item2 = Array.from(ul.querySelectorAll('li')).find(el => el.id === '2');

    expect(item1?.textContent).toBe('First');
    expect(item2?.textContent).toBe('Second');

    // Reorder list: move second before first
    list.value = [
      { id: '2', text: 'Second' },
      { id: '1', text: 'First' }
    ];

    const currentItems = Array.from(ul.querySelectorAll('li'));
    expect(currentItems[0]?.id).toBe('2');
    expect(currentItems[1]?.id).toBe('1');
    // Exact DOM node references preserved!
    expect(currentItems[0]).toBe(item2);
    expect(currentItems[1]).toBe(item1);

    // Delete an item
    list.value = [{ id: '1', text: 'First' }];
    const afterDelete = Array.from(ul.querySelectorAll('li'));
    expect(afterDelete.length).toBe(1);
    expect(afterDelete[0]).toBe(item1);
  });

  it('when declarative conditional toggles subtrees and preserves state cleanly', () => {
    const loggedIn = signal(false);
    const template = html`
      <div>
        ${when(
          loggedIn,
          () => html`<span class="user-greeting">Welcome back!</span>`,
          () => html`<button class="login-btn">Sign In</button>`
        )}
      </div>
    `;

    const { fragment } = render(template);
    const div = fragment.querySelector('div')!;
    expect(div.querySelector('.login-btn')).not.toBeNull();
    expect(div.querySelector('.user-greeting')).toBeNull();

    loggedIn.value = true;
    expect(div.querySelector('.user-greeting')).not.toBeNull();
    expect(div.querySelector('.login-btn')).toBeNull();

    loggedIn.value = false;
    expect(div.querySelector('.login-btn')).not.toBeNull();
    expect(div.querySelector('.user-greeting')).toBeNull();
  });

  it('match switches between multiple cases reactively', () => {
    const state = signal<'idle' | 'loading' | 'success'>('idle');
    const template = html`
      <div class="status-container">
        ${match(state, [
          ['idle', () => html`<span>Idle</span>`],
          ['loading', () => html`<span>Loading...</span>`],
          ['success', () => html`<span>Success!</span>`]
        ])}
      </div>
    `;

    const { fragment } = render(template);
    const container = fragment.querySelector('.status-container')!;
    expect(container.textContent).toContain('Idle');

    state.value = 'loading';
    expect(container.textContent).toContain('Loading...');

    state.value = 'success';
    expect(container.textContent).toContain('Success!');
  });
});

