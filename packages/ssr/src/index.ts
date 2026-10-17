/**
 * @fileoverview Streaming Server-Side Rendering (SSR) & 0ms Hydration for Zuari.
 * Renders templates to raw HTML strings and streams for Edge runtimes (Cloudflare, Bun, Node).
 */

import type { TemplateResult } from '@zuari/dom';

export interface RenderToStringOptions {
  /** Optional hydration ID prefix for cluster namespaces */
  hydrationPrefix?: string;
}

/**
 * Synchronously renders a Zuari template result to an HTML string
 * containing W3C DOM Part comment hole markers for instant client hydration.
 */
export function renderToString(template: TemplateResult, options: RenderToStringOptions = {}): string {
  const { strings, values } = template;
  let html = '';

  for (let i = 0; i < strings.length; i++) {
    html += strings[i];
    if (i < values.length) {
      const val = values[i];
      let resolvedValue = '';

      if (typeof val === 'function') {
        resolvedValue = String((val as () => unknown)());
      } else if (typeof val === 'object' && val !== null && 'value' in val) {
        resolvedValue = String((val as { value: unknown }).value);
      } else if (val !== null && val !== undefined) {
        resolvedValue = String(val);
      }

      // Check if we are inside an attribute or child node
      const lastChunk = strings[i] ?? '';
      const isAttribute = /=["']?[^"'>]*$/.test(lastChunk);

      if (isAttribute) {
        html += resolvedValue;
      } else {
        html += `<!--zuari-hole-${i}-->${resolvedValue}<!--/zuari-hole-${i}-->`;
      }
    }
  }

  return html;
}

/**
 * Creates a WHATWG ReadableStream for streaming HTML chunks to Cloudflare Workers or Node.js.
 */
export function renderToStream(template: TemplateResult): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const htmlContent = renderToString(template);

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(htmlContent));
      controller.close();
    }
  });
}
