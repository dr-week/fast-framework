import { describe, it, expect } from 'vitest';
import { signal } from '@zuari/signals';
import { html } from '@zuari/dom';
import { renderToString, renderToStream, streamTemplate, hydrateHoles } from './index.js';

describe('@zuari/ssr Server-Side Rendering & Declarative Shadow DOM', () => {
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

  it('outputs Declarative Shadow DOM (<template shadowrootmode="open">) when requested', () => {
    const title = signal('Declarative Shadow DOM');
    const template = html`<div class="panel"><h2>${title}</h2></div>`;
    const str = renderToString(template, {
      declarativeShadowRoot: true,
      shadowRootMode: 'open',
      shadowStyles: ':host { display: block; }'
    });

    expect(str).toContain('<template shadowrootmode="open">');
    expect(str).toContain('<style>:host { display: block; }</style>');
    expect(str).toContain('<!--zuari-hole-0-->Declarative Shadow DOM<!--/zuari-hole-0-->');
    expect(str).toContain('</template>');
  });

  it('streams template chunks using AsyncGenerator for edge platforms', async () => {
    const name = signal('Cloudflare Edge');
    const template = html`<main><h1>Hello, ${name}!</h1></main>`;
    const chunks: string[] = [];

    for await (const chunk of streamTemplate(template)) {
      chunks.push(chunk);
    }

    const fullHtml = chunks.join('');
    expect(fullHtml).toContain('<main><h1>Hello, <!--zuari-hole-0-->Cloudflare Edge<!--/zuari-hole-0-->!</h1></main>');
  });

  it('renders templates to a ReadableStream for edge runtimes', async () => {
    const title = signal('Edge Stream');
    const template = html`<header>${title}</header>`;
    const stream = renderToStream(template);

    const reader = stream.getReader();
    let accumulated = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      accumulated += new TextDecoder().decode(value);
    }
    expect(accumulated).toContain('Edge Stream');
  });

  it('scans and parses serialized comment holes for 0ms client hydration', () => {
    const container = document.createElement('div');
    container.innerHTML = '<div><!--zuari-hole-0-->Hydrated Signal<!--/zuari-hole-0--></div>';

    const holes = hydrateHoles(container, ['Hydrated Signal']);
    expect(holes.length).toBe(1);
    expect(holes[0]?.index).toBe(0);
    expect(holes[0]?.holeNode.data).toBe('zuari-hole-0');
  });
});
