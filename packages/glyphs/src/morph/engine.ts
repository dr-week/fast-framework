import type { MorphGlyphOptions, MorphGlyphInstance, MorphState } from './types.js';
import { MORPH_PATHS } from './paths.js';

let styleInjected = false;

function ensureMorphStyle(durationMs: number): void {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.id = 'zuari-glyph-morph-engine';
  style.textContent = `
    .zuari-morph-path {
      transition: d ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1), stroke ${durationMs}ms ease;
      will-change: d;
    }
    @keyframes zuari-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .zuari-morph-spinning {
      animation: zuari-spin 800ms linear infinite;
      transform-origin: center;
    }
  `;
  document.head.appendChild(style);
  styleInjected = true;
}

/**
 * Creates a kinetic vector glyph that fluidly morphs its geometry on the GPU
 * via native CSS path transitions (`d: path(...)`).
 */
export function createMorphGlyph(options: MorphGlyphOptions = {}): MorphGlyphInstance {
  const size = options.size ?? 24;
  const duration = options.durationMs ?? 260;
  let currentState: MorphState = options.state ?? 'sparkle';

  ensureMorphStyle(duration);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.75');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  if (options.class) {
    svg.setAttribute('class', options.class);
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.classList.add('zuari-morph-path');
  path.setAttribute('d', MORPH_PATHS[currentState]);
  svg.appendChild(path);

  const applyState = (state: MorphState) => {
    currentState = state;
    const targetPath = MORPH_PATHS[state];

    // Hardware accelerated path interpolation
    path.setAttribute('d', targetPath);
    path.style.setProperty('d', `path("${targetPath}")`);

    if (state === 'loadingRing') {
      svg.classList.add('zuari-morph-spinning');
    } else {
      svg.classList.remove('zuari-morph-spinning');
    }
  };

  applyState(currentState);

  return {
    svgElement: svg,
    pathElement: path,
    setState: applyState,
    getState: () => currentState
  };
}
