/**
 * @fileoverview Self-Healing 3-Layer Visual Bot Cascade Resolver.
 * Tier 1: Cached semantic CSS selector (<5ms) with fail-closed sensitive guard
 * Tier 2: Set-of-Mark A11y DOM indexer (<20ms) -> self-heals Tier 1 cache
 * Tier 3: Theme-invariant Sobel + Multi-Scale 2D NCC edge matcher (<50ms)
 */

import type { CascadeResolution, CascadeResolveOptions } from '../types.js';
import { indexInteractiveDom, isSensitiveElement, querySemanticMark } from '../som/indexer.js';
import { matchEdgeTemplate } from '../vision/contour.js';
import { matchMultiScaleEdge } from '../vision/multi-scale.js';

export function resolveTargetWithCascade(options: CascadeResolveOptions = {}): CascadeResolution {
  const {
    query = '',
    cachedSelector = '',
    root = typeof document !== 'undefined' ? document : null,
    templateEdgeData = null,
    sceneEdgeData = null,
    scales,
    visionThreshold = 0.7,
    minSemanticScore = 20,
    extraUnsafePattern,
    onHealSelector,
  } = options;

  const start = performance.now();

  // Layer 1: Fast cached selector lookup with fail-closed sensitive guard
  if (cachedSelector && root?.querySelector) {
    try {
      const el = root.querySelector(cachedSelector);
      if (el && !isSensitiveElement(el, extraUnsafePattern)) {
        const rect = el.getBoundingClientRect
          ? el.getBoundingClientRect()
          : { x: 0, y: 0, width: 10, height: 10 };
        if (rect.width > 0 && rect.height > 0) {
          return {
            found: true,
            layer: 1,
            selector: cachedSelector,
            healed: false,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
            durationMs: Number((performance.now() - start).toFixed(2)),
          };
        }
      }
    } catch {
      // Invalid or broken cached selector falls through to Layer 2
    }
  }

  // Layer 2: Set-of-Mark Semantic DOM fallback + self-healing cache update
  if (query && root?.querySelectorAll) {
    const indexed = indexInteractiveDom(
      root,
      extraUnsafePattern ? { extraUnsafePattern } : {}
    );
    const match = querySemanticMark(indexed.marks, query);
    if (match && match.matchScore >= minSemanticScore) {
      if (typeof onHealSelector === 'function' && match.selector) {
        try {
          onHealSelector(match.selector, match);
        } catch {
          // Ignore heal callback errors
        }
      }
      return {
        found: true,
        layer: 2,
        selector: match.selector,
        healed: true,
        mark: match,
        rect: match.rect,
        blockedCount: indexed.blockedCount,
        durationMs: Number((performance.now() - start).toFixed(2)),
      };
    }
  }

  // Layer 3: Theme-invariant Sobel + 2D NCC (single-scale or multi-scale pyramid)
  if (sceneEdgeData && templateEdgeData) {
    if (scales && scales.length > 0) {
      const res = matchMultiScaleEdge(
        sceneEdgeData.edges,
        sceneEdgeData.width,
        sceneEdgeData.height,
        templateEdgeData.edges,
        templateEdgeData.width,
        templateEdgeData.height,
        { scales, threshold: visionThreshold }
      );
      if (res.found) {
        return {
          found: true,
          layer: 3,
          healed: false,
          confidence: res.confidence,
          scale: res.scale,
          center: res.center,
          rect: res.box,
          durationMs: Number((performance.now() - start).toFixed(2)),
        };
      }
    } else {
      const res = matchEdgeTemplate(
        sceneEdgeData.edges,
        sceneEdgeData.width,
        sceneEdgeData.height,
        templateEdgeData.edges,
        templateEdgeData.width,
        templateEdgeData.height,
        visionThreshold
      );
      if (res.found) {
        return {
          found: true,
          layer: 3,
          healed: false,
          confidence: res.confidence,
          scale: 1.0,
          center: res.center,
          rect: res.box,
          durationMs: Number((performance.now() - start).toFixed(2)),
        };
      }
    }
  }

  return {
    found: false,
    layer: 0,
    healed: false,
    durationMs: Number((performance.now() - start).toFixed(2)),
  };
}
