import { signal, computed, effect, batch } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { createMorphGlyph, LayersGlyph, SparkleGlyph } from '@zuari/glyphs';
import { createSpatialAnchor, bindAnchorToElement } from '@zuari/spatial';
import { createWasmSignal, createWasmStruct } from '@zuari/wasm';
import { generateAnchorName, setElementAnchor, tetherToAnchor } from '@zuari/headless';
import { createBallisticReticle, createDroneTelemetry } from '@zuari/hardware';
import { createQuantumNodeState } from '@zuari/quantum';
import { createCard, createUiDrawer } from '@zuari/ui';
import { applyThemePreset } from '@zuari/tokens';

export interface ReplExecutionResult {
  execTimeMs: string;
  errorMsg: string | null;
}

export function stripImports(source: string): string {
  return source
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+/gm, '');
}

export function runCleanupList(cleanups: Array<() => void>): void {
  for (const fn of cleanups) {
    try {
      fn();
    } catch {
      // Ignore cleanup errors from stale user effects or DOM nodes.
    }
  }
  cleanups.length = 0;
}

export function executeReplCode(
  rawCode: string,
  previewStage: HTMLElement,
  cleanups: Array<() => void>
): ReplExecutionResult {
  runCleanupList(cleanups);
  previewStage.innerHTML = '';

  const t0 = performance.now();

  const mount = (tplOrNode: unknown) => {
    if (
      tplOrNode &&
      typeof tplOrNode === 'object' &&
      'strings' in tplOrNode &&
      'values' in tplOrNode
    ) {
      const instance = render(tplOrNode as Parameters<typeof render>[0]);
      cleanups.push(instance.destroy);
      previewStage.appendChild(instance.fragment);
    } else if (tplOrNode instanceof Node) {
      previewStage.appendChild(tplOrNode);
    }
  };

  const trackedRender: typeof render = (template, container) => {
    const instance = render(template, container);
    cleanups.push(instance.destroy);
    return instance;
  };

  const trackedEffect = (fn: () => void | (() => void)) => {
    const dispose = effect(fn);
    cleanups.push(dispose);
    return dispose;
  };

  try {
    const scope: Record<string, unknown> = {
      signal,
      computed,
      effect: trackedEffect,
      batch,
      html,
      render: trackedRender,
      mount,
      root: previewStage,
      createMorphGlyph,
      LayersGlyph,
      SparkleGlyph,
      createSpatialAnchor,
      bindAnchorToElement,
      createWasmSignal,
      createWasmStruct,
      generateAnchorName,
      setElementAnchor,
      tetherToAnchor,
      createBallisticReticle,
      createDroneTelemetry,
      createQuantumNodeState,
      createUiDrawer,
      createCard,
      applyThemePreset
    };

    const executableBody = stripImports(rawCode);
    const runner = new Function(...Object.keys(scope), executableBody);
    runner(...Object.values(scope));

    const dt = Math.max(0.05, performance.now() - t0);
    return { execTimeMs: dt.toFixed(2), errorMsg: null };
  } catch (err) {
    return {
      execTimeMs: '0.00',
      errorMsg: err instanceof Error ? err.message : String(err)
    };
  }
}
