/**
 * @fileoverview Theme-invariant Computer Vision & Contour Engine (Layer 3).
 * Grayscale luminance normalization, Sobel gradient edge detection, and
 * 2-stage coarse-to-fine (stride 2 -> 1px refinement) 2D NCC template matching.
 */

import type { EdgeMatchResult, RgbaImageLike } from '../types.js';

/**
 * Converts an RGBA pixel buffer to normalized [0..1] Float32 grayscale luminance.
 */
export function rgbaToGrayscale(
  rgba: Uint8ClampedArray | Uint8Array | number[],
  width: number,
  height: number
): Float32Array {
  const gray = new Float32Array(width * height);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
    gray[j] = (0.299 * (rgba[i] ?? 0) + 0.587 * (rgba[i + 1] ?? 0) + 0.114 * (rgba[i + 2] ?? 0)) / 255.0;
  }
  return gray;
}

/**
 * Convenience wrapper for ImageData-like objects ({ data, width, height }).
 */
export function imageToGrayscale(imageData: RgbaImageLike): Float32Array {
  return rgbaToGrayscale(imageData.data, imageData.width, imageData.height);
}

/**
 * Computes theme-invariant Sobel gradient magnitude edge map.
 * Dark mode and light mode icons produce identical contour gradients.
 */
export function computeSobelEdges(
  gray: Float32Array | Uint8Array,
  width: number,
  height: number
): Float32Array {
  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -(gray[idx - width - 1] ?? 0) +
        (gray[idx - width + 1] ?? 0) -
        2 * (gray[idx - 1] ?? 0) +
        2 * (gray[idx + 1] ?? 0) -
        (gray[idx + width - 1] ?? 0) +
        (gray[idx + width + 1] ?? 0);
      const gy =
        -(gray[idx - width - 1] ?? 0) -
        2 * (gray[idx - width] ?? 0) -
        (gray[idx - width + 1] ?? 0) +
        (gray[idx + width - 1] ?? 0) +
        2 * (gray[idx + width] ?? 0) +
        (gray[idx + width + 1] ?? 0);
      edges[idx] = Math.hypot(gx, gy);
    }
  }
  return edges;
}

function scoreWindow(
  sceneEdges: Float32Array,
  sceneW: number,
  tmplEdges: Float32Array,
  tmplW: number,
  tmplH: number,
  sx: number,
  sy: number,
  tmplEnergy: number
): number {
  let sumProd = 0;
  let sumSceneSq = 0;
  for (let ty = 0; ty < tmplH; ty++) {
    const sRow = (sy + ty) * sceneW + sx;
    const tRow = ty * tmplW;
    for (let tx = 0; tx < tmplW; tx++) {
      const sVal = sceneEdges[sRow + tx] ?? 0;
      const tVal = tmplEdges[tRow + tx] ?? 0;
      sumProd += sVal * tVal;
      sumSceneSq += sVal * sVal;
    }
  }
  const denom = Math.sqrt(sumSceneSq * tmplEnergy);
  return denom > 1e-6 ? sumProd / denom : 0;
}

/**
 * Coarse-to-fine 2D Normalized Cross-Correlation (NCC) edge template matcher.
 */
export function matchEdgeTemplate(
  sceneEdges: Float32Array,
  sceneW: number,
  sceneH: number,
  tmplEdges: Float32Array,
  tmplW: number,
  tmplH: number,
  threshold = 0.7
): EdgeMatchResult {
  const maxX = sceneW - tmplW;
  const maxY = sceneH - tmplH;
  if (maxX < 0 || maxY < 0) {
    return { found: false, confidence: 0, center: { x: 0, y: 0 }, box: null };
  }

  let tmplEnergy = 0;
  for (let i = 0; i < tmplEdges.length; i++) {
    const v = tmplEdges[i] ?? 0;
    tmplEnergy += v * v;
  }
  if (tmplEnergy < 1e-6) {
    return { found: false, confidence: 0, center: { x: 0, y: 0 }, box: null };
  }

  let bestScore = -1;
  let bestX = 0;
  let bestY = 0;

  const stride = maxX * maxY <= 20000 ? 1 : 2;
  for (let sy = 0; sy <= maxY; sy += stride) {
    for (let sx = 0; sx <= maxX; sx += stride) {
      const score = scoreWindow(sceneEdges, sceneW, tmplEdges, tmplW, tmplH, sx, sy, tmplEnergy);
      if (score > bestScore) {
        bestScore = score;
        bestX = sx;
        bestY = sy;
      }
    }
  }

  if (stride > 1) {
    const rxMin = Math.max(0, bestX - stride);
    const rxMax = Math.min(maxX, bestX + stride);
    const ryMin = Math.max(0, bestY - stride);
    const ryMax = Math.min(maxY, bestY + stride);
    for (let sy = ryMin; sy <= ryMax; sy++) {
      for (let sx = rxMin; sx <= rxMax; sx++) {
        const score = scoreWindow(sceneEdges, sceneW, tmplEdges, tmplW, tmplH, sx, sy, tmplEnergy);
        if (score > bestScore) {
          bestScore = score;
          bestX = sx;
          bestY = sy;
        }
      }
    }
  }

  const found = bestScore >= threshold;
  return {
    found,
    confidence: Number(bestScore.toFixed(4)),
    center: { x: Math.round(bestX + tmplW / 2), y: Math.round(bestY + tmplH / 2) },
    box: found ? { x: bestX, y: bestY, width: tmplW, height: tmplH } : null,
  };
}
