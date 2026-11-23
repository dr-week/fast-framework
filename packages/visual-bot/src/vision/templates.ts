/**
 * @fileoverview Geometric icon synthesizers and extensible template registry
 * for theme-invariant visual matching.
 */

import type { IconSynthesizer, IconTemplateSpec } from '../types.js';

const customSynthesizers = new Map<string, IconSynthesizer>();

export const VISUAL_ICON_CATALOG: Record<string, IconTemplateSpec> = {
  heart: { width: 24, height: 24, description: 'Like / Heart button', category: 'engagement' },
  like: { width: 24, height: 24, description: 'Thumbs up / Like button', category: 'engagement' },
  retweet: { width: 24, height: 24, description: 'Repost / Retweet arrows', category: 'engagement' },
  repost: { width: 24, height: 24, description: 'Repost / Share arrow pill', category: 'engagement' },
  comment: { width: 24, height: 24, description: 'Comment / Reply bubble', category: 'engagement' },
  composer_post: { width: 68, height: 32, description: 'Submit / Post button pill', category: 'navigation' },
  search: { width: 24, height: 24, description: 'Search magnifier icon', category: 'navigation' },
  close_modal: { width: 20, height: 20, description: 'Dismiss / Close dialog cross', category: 'modal' },
};

/**
 * Registers a custom geometric icon edge synthesizer for framework extensibility.
 */
export function registerIconTemplate(
  name: string,
  spec: IconTemplateSpec,
  synthesizer: IconSynthesizer
): void {
  VISUAL_ICON_CATALOG[name] = spec;
  customSynthesizers.set(name, synthesizer);
}

/**
 * Synthesizes a canonical Float32 edge map for a named icon template.
 */
export function synthesizeIconEdgeMap(iconName: string, width = 24, height = 24): Float32Array {
  const custom = customSynthesizers.get(iconName);
  if (custom) return custom(width, height);

  const edges = new Float32Array(width * height);
  const cx = width / 2;
  const cy = height / 2;

  if (iconName === 'heart' || iconName === 'like') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nx = (x - cx) / (width * 0.38);
        const ny = -(y - cy * 1.1) / (height * 0.38);
        const d = (nx * nx + ny * ny - 1) ** 3 - nx * nx * ny ** 3;
        if (Math.abs(d) < 0.35) edges[y * width + x] = 1.0;
      }
    }
  } else if (iconName === 'comment' || iconName === 'reply') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dist = Math.hypot((x - cx) / (width * 0.42), (y - (cy - 2)) / (height * 0.32));
        if (Math.abs(dist - 1.0) < 0.22) edges[y * width + x] = 1.0;
      }
    }
  } else if (iconName === 'retweet' || iconName === 'repost') {
    for (let y = 4; y < height - 4; y++) {
      for (let x = 4; x < width - 4; x++) {
        if ((y === 4 || y === height - 5) && x >= 6 && x <= width - 6) edges[y * width + x] = 1.0;
        if ((x === 4 || x === width - 5) && y >= 6 && y <= height - 6) edges[y * width + x] = 1.0;
      }
    }
  } else if (iconName === 'composer_post' || iconName === 'submit') {
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        if (y === 2 || y === height - 3 || x === 2 || x === width - 3) edges[y * width + x] = 1.0;
      }
    }
  } else if (iconName === 'search') {
    const r = Math.min(width, height) * 0.28;
    const sx = cx - 2;
    const sy = cy - 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const d = Math.hypot(x - sx, y - sy);
        if (Math.abs(d - r) < 1.2) edges[y * width + x] = 1.0;
        if (x >= sx + r - 1 && y >= sy + r - 1 && Math.abs(x - sx - (y - sy)) < 2) {
          edges[y * width + x] = 1.0;
        }
      }
    }
  } else if (iconName === 'close_modal') {
    for (let y = 3; y < height - 3; y++) {
      for (let x = 3; x < width - 3; x++) {
        if (Math.abs(x - y) <= 1 || Math.abs(x + y - (width - 1)) <= 1) {
          edges[y * width + x] = 1.0;
        }
      }
    }
  } else {
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        if (y === 2 || y === height - 3 || x === 2 || x === width - 3) edges[y * width + x] = 0.8;
      }
    }
  }
  return edges;
}
