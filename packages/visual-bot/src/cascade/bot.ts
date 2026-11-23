/**
 * @fileoverview Reactive @zuari/signals Visual Bot Controller.
 * Manages live selector self-healing cache, Set-of-Mark DOM scans,
 * debug overlay state, and resolution telemetry.
 */

import { signal, type Signal } from '@zuari/signals';
import type {
  CascadeResolution,
  CascadeResolveOptions,
  DomRootLike,
  SemanticMark,
} from '../types.js';
import { indexInteractiveDom } from '../som/indexer.js';
import { clearSetOfMarkOverlay, renderSetOfMarkOverlay } from '../som/overlay.js';
import { resolveTargetWithCascade } from './resolver.js';

export type VisualBotStatus = 'idle' | 'scanning' | 'resolved' | 'healed' | 'miss';

export interface VisualBotOptions {
  root?: DomRootLike | null;
  initialSelectors?: Record<string, string>;
  extraUnsafePattern?: RegExp;
}

export interface VisualBotController {
  status: Signal<VisualBotStatus>;
  marks: Signal<SemanticMark[]>;
  blockedCount: Signal<number>;
  healCount: Signal<number>;
  lastResolution: Signal<CascadeResolution | null>;
  overlayVisible: Signal<boolean>;
  selectorCache: Signal<Record<string, string>>;
  scan: (root?: DomRootLike | null) => SemanticMark[];
  resolve: (
    targetKey: string,
    options?: Omit<CascadeResolveOptions, 'cachedSelector' | 'onHealSelector'>
  ) => CascadeResolution;
  showOverlay: (highlightMarkId?: number | null, doc?: Document | null) => number;
  hideOverlay: (doc?: Document | null) => boolean;
  destroy: (doc?: Document | null) => void;
}

export function createVisualBot(options: VisualBotOptions = {}): VisualBotController {
  const status = signal<VisualBotStatus>('idle');
  const marks = signal<SemanticMark[]>([]);
  const blockedCount = signal(0);
  const healCount = signal(0);
  const lastResolution = signal<CascadeResolution | null>(null);
  const overlayVisible = signal(false);
  const selectorCache = signal<Record<string, string>>({ ...(options.initialSelectors || {}) });

  function scan(root: DomRootLike | null | undefined = options.root): SemanticMark[] {
    status.value = 'scanning';
    const result = indexInteractiveDom(
      root,
      options.extraUnsafePattern ? { extraUnsafePattern: options.extraUnsafePattern } : {}
    );
    marks.value = result.marks;
    blockedCount.value = result.blockedCount;
    status.value = 'idle';
    return result.marks;
  }

  function resolve(
    targetKey: string,
    resolveOpts: Omit<CascadeResolveOptions, 'cachedSelector' | 'onHealSelector'> = {}
  ): CascadeResolution {
    const cachedSelector = selectorCache.value[targetKey] || '';
    const resolvedRoot = resolveOpts.root !== undefined ? resolveOpts.root : options.root;
    const unsafePattern = resolveOpts.extraUnsafePattern ?? options.extraUnsafePattern;
    const res = resolveTargetWithCascade({
      ...resolveOpts,
      query: resolveOpts.query ?? targetKey,
      ...(resolvedRoot !== undefined ? { root: resolvedRoot } : {}),
      ...(unsafePattern !== undefined ? { extraUnsafePattern: unsafePattern } : {}),
      cachedSelector,
      onHealSelector: (healedSelector) => {
        selectorCache.value = { ...selectorCache.value, [targetKey]: healedSelector };
        healCount.value += 1;
      },
    });

    lastResolution.value = res;
    if (res.blockedCount !== undefined) blockedCount.value = res.blockedCount;
    status.value = !res.found ? 'miss' : res.healed ? 'healed' : 'resolved';
    return res;
  }

  function showOverlay(highlightMarkId: number | null = null, doc?: Document | null): number {
    const count = renderSetOfMarkOverlay(marks.value, {
      ...(doc !== undefined ? { doc } : {}),
      highlightMarkId,
    });
    overlayVisible.value = count > 0;
    return count;
  }

  function hideOverlay(doc?: Document | null): boolean {
    overlayVisible.value = false;
    return clearSetOfMarkOverlay(doc);
  }

  function destroy(doc?: Document | null): void {
    hideOverlay(doc);
    marks.value = [];
    lastResolution.value = null;
    status.value = 'idle';
  }

  return {
    status,
    marks,
    blockedCount,
    healCount,
    lastResolution,
    overlayVisible,
    selectorCache,
    scan,
    resolve,
    showOverlay,
    hideOverlay,
    destroy,
  };
}
