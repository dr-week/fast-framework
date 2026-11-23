/**
 * @fileoverview Multi-Scale Pyramid Edge Matcher for HiDPI / Retina & Zoomed Displays.
 * Resizes Sobel edge templates via bilinear interpolation and runs coarse-to-fine NCC.
 */

import type { MultiScaleMatchOptions, MultiScaleMatchResult } from '../types.js';
import { matchEdgeTemplate } from './contour.js';

/**
 * Resizes a 2D Float32 edge map using bilinear interpolation.
 */
export function resizeEdgeMap(
  edges: Float32Array,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Float32Array {
  const out = new Float32Array(dstW * dstH);
  const scaleX = srcW / dstW;
  const scaleY = srcH / dstH;

  for (let y = 0; y < dstH; y++) {
    const fy = y * scaleY;
    const y0 = Math.floor(fy);
    const y1 = Math.min(srcH - 1, y0 + 1);
    const dy = fy - y0;

    for (let x = 0; x < dstW; x++) {
      const fx = x * scaleX;
      const x0 = Math.floor(fx);
      const x1 = Math.min(srcW - 1, x0 + 1);
      const dx = fx - x0;

      const v00 = edges[y0 * srcW + x0] ?? 0;
      const v10 = edges[y0 * srcW + x1] ?? 0;
      const v01 = edges[y1 * srcW + x0] ?? 0;
      const v11 = edges[y1 * srcW + x1] ?? 0;

      const top = v00 * (1 - dx) + v10 * dx;
      const bottom = v01 * (1 - dx) + v11 * dx;
      out[y * dstW + x] = top * (1 - dy) + bottom * dy;
    }
  }
  return out;
}

/**
 * Searches for an edge template across multiple scale factors with early-exit optimization.
 */
export function matchMultiScaleEdge(
  sceneEdges: Float32Array,
  sceneW: number,
  sceneH: number,
  tmplEdges: Float32Array,
  tmplW: number,
  tmplH: number,
  options: MultiScaleMatchOptions = {}
): MultiScaleMatchResult {
  const { scales = [0.8, 1.0, 1.25], threshold = 0.65, earlyExitConfidence = 0.96 } = options;
  const start = performance.now();

  let best: Omit<MultiScaleMatchResult, 'scalesTested' | 'durationMs'> = {
    found: false,
    confidence: 0,
    center: { x: 0, y: 0 },
    box: null,
    scale: 1.0,
  };

  let scalesTested = 0;
  for (const scale of scales) {
    const w = Math.max(4, Math.round(tmplW * scale));
    const h = Math.max(4, Math.round(tmplH * scale));
    if (w > sceneW || h > sceneH) continue;

    scalesTested++;
    const scaledTmpl = scale === 1.0 ? tmplEdges : resizeEdgeMap(tmplEdges, tmplW, tmplH, w, h);
    const result = matchEdgeTemplate(sceneEdges, sceneW, sceneH, scaledTmpl, w, h, threshold);

    if (result.confidence > best.confidence) {
      best = { ...result, scale };
    }
    if (best.confidence >= earlyExitConfidence) break;
  }

  return {
    ...best,
    scalesTested,
    durationMs: Number((performance.now() - start).toFixed(2)),
  };
}
