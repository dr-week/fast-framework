import { describe, it, expect } from 'vitest';
import { signal } from '@zuari/signals';
import { html } from '@zuari/dom';
import { renderToString, renderToStream } from './index.js';

describe('@zuari/ssr Server-Side Rendering', () => {
  it('renders static templates to HTML string', () => {
    const template = html`<div class="hero"><h1>Zuari</h1></div>`;
    const str = renderToString(template);
    expect(str).toBe('<div class="hero"><h1>Zuari</h1></div>');
  });

  it('renders reactive signals with DOM part comment markers for 0ms client hydration', () => {
    const count = signal(42);
    const template = html`<div class="counter">Count: <span>${count}</span></div>`;
    const str = renderToString(template);

    expect(str).toContain('<!--zuari-hole-0-->42<!--/zuari-hole-0-->');
  });

  it('renders templates to a ReadableStream for edge runtimes', async () => {
    const title = signal('Edge Stream');
    const template = html`<header>${title}</header>`;
    const stream = renderToStream(template);

    const reader = stream.getReader();
    const { value, done } = await reader.read();
    expect(done).toBe(false);

    const text = new TextDecoder().decode(value);
    expect(text).toContain('Edge Stream');
  });
});
