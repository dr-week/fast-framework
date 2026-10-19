/**
 * @fileoverview Streaming Server-Side Rendering (SSR), Declarative Shadow DOM & 0ms Resumability for Zuari.
 * Renders templates to raw HTML strings and streams for Edge runtimes (Cloudflare Workers, Deno, Bun, Node).
 * Outputs Declarative Shadow DOM (`<template shadowrootmode="open">`) with serialized comment holes (`<!--zuari-hole-0-->`).
 */

import type { TemplateResult } from '@zuari/dom';

export interface RenderToStringOptions {
  /** Optional hydration ID prefix for cluster namespaces */
  readonly hydrationPrefix?: string;
  /** Whether to wrap the output inside a Declarative Shadow DOM template */
  readonly declarativeShadowRoot?: boolean;
  /** Shadow root mode when declarativeShadowRoot is enabled (default: 'open') */
  readonly shadowRootMode?: 'open' | 'closed';
  /** Optional custom CSS string to inject into the Declarative Shadow DOM */
  readonly shadowStyles?: string;
}

export interface StreamTemplateChunk {
  readonly chunk: string;
  readonly isHole: boolean;
  readonly index?: number;
}

export interface StreamRenderOptions extends RenderToStringOptions {
  readonly chunkSize?: number;
}

/**
 * Synchronously renders a Zuari template result to an HTML string
 * containing W3C DOM Part comment hole markers for instant client hydration.
 * Optionally wraps output in Declarative Shadow DOM (`<template shadowrootmode="open">`).
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

  if (options.declarativeShadowRoot) {
    const mode = options.shadowRootMode ?? 'open';
    const styleBlock = options.shadowStyles ? `<style>${options.shadowStyles}</style>` : '';
    return `<template shadowrootmode="${mode}">${styleBlock}${html}</template>`;
  }

  return html;
}

/**
 * Yields streaming HTML chunks as an AsyncGenerator for edge platforms (Cloudflare Workers, Deno, Node).
 */
export async function* streamTemplate(
  template: TemplateResult,
  options: RenderToStringOptions = {}
): AsyncGenerator<string, void, unknown> {
  const { strings, values } = template;

  if (options.declarativeShadowRoot) {
    const mode = options.shadowRootMode ?? 'open';
    const styleBlock = options.shadowStyles ? `<style>${options.shadowStyles}</style>` : '';
    yield `<template shadowrootmode="${mode}">${styleBlock}`;
  }

  for (let i = 0; i < strings.length; i++) {
    yield strings[i]!;

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

      const lastChunk = strings[i] ?? '';
      const isAttribute = /=["']?[^"'>]*$/.test(lastChunk);

      if (isAttribute) {
        yield resolvedValue;
      } else {
        yield `<!--zuari-hole-${i}-->${resolvedValue}<!--/zuari-hole-${i}-->`;
      }
    }
  }

  if (options.declarativeShadowRoot) {
    yield `</template>`;
  }
}

/**
 * Creates a standard WHATWG ReadableStream for streaming HTML chunks to Cloudflare Workers, Deno, Bun, or Node.js.
 */
export function renderToStream(
  template: TemplateResult,
  options: RenderToStringOptions = {}
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const generator = streamTemplate(template, options);

  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await generator.next();
      if (done) {
        controller.close();
      } else if (value) {
        controller.enqueue(encoder.encode(value));
      }
    }
  });
}

/**
 * Client-side 0ms resumable hydrator.
 * Connects serialized `<!--zuari-hole-X-->` comment holes back to reactive signals without re-executing templates or touching untouched DOM.
 */
export function hydrateHoles(
  root: Node,
  values: readonly unknown[]
): Array<{ index: number; holeNode: Comment }> {
  const holes: Array<{ index: number; holeNode: Comment }> = [];
  if (typeof document === 'undefined') return holes;

  const iterator = document.createNodeIterator(root, NodeFilter.SHOW_COMMENT);
  let current = iterator.nextNode() as Comment | null;

  while (current) {
    const match = current.data.match(/^zuari-hole-(\d+)$/);
    if (match && match[1]) {
      const index = parseInt(match[1], 10);
      holes.push({ index, holeNode: current });
    }
    current = iterator.nextNode() as Comment | null;
  }

  return holes;
}
