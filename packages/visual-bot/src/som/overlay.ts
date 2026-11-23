/**
 * @fileoverview Set-of-Mark (SoM) Interactive Visual Debug Overlay.
 * Draws numbered badges (#1, #2, ...) over indexed DOM targets for human inspection
 * and 1-click target verification.
 */

import type { SemanticMark } from '../types.js';

const DEFAULT_OVERLAY_ID = '__zuari_visual_bot_som_overlay';

export interface SomOverlayOptions {
  doc?: Document | null;
  highlightMarkId?: number | null;
  overlayId?: string;
}

/**
 * Removes any active Set-of-Mark debug overlay from the document.
 */
export function clearSetOfMarkOverlay(
  doc: Document | null = typeof document !== 'undefined' ? document : null,
  overlayId = DEFAULT_OVERLAY_ID
): boolean {
  if (!doc) return false;
  const existing = doc.getElementById(overlayId);
  if (existing) {
    existing.remove();
    return true;
  }
  return false;
}

/**
 * Renders numbered visual bounding boxes over indexed Set-of-Mark targets.
 */
export function renderSetOfMarkOverlay(
  marks: SemanticMark[] = [],
  options: SomOverlayOptions = {}
): number {
  const {
    doc = typeof document !== 'undefined' ? document : null,
    highlightMarkId = null,
    overlayId = DEFAULT_OVERLAY_ID,
  } = options;

  if (!doc || !doc.body) return 0;
  clearSetOfMarkOverlay(doc, overlayId);
  if (!Array.isArray(marks) || marks.length === 0) return 0;

  const container = doc.createElement('div');
  container.id = overlayId;
  Object.assign(container.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '2147483644',
  });

  for (const mark of marks) {
    if (!mark?.rect) continue;
    const isHot = highlightMarkId != null && mark.markId === highlightMarkId;
    const box = doc.createElement('div');
    Object.assign(box.style, {
      position: 'fixed',
      left: `${mark.rect.x}px`,
      top: `${mark.rect.y}px`,
      width: `${mark.rect.width}px`,
      height: `${mark.rect.height}px`,
      border: isHot ? '2px solid #10b981' : '1.5px solid #38bdf8',
      borderRadius: '6px',
      background: isHot ? 'rgba(16, 185, 129, 0.14)' : 'rgba(56, 189, 248, 0.06)',
      boxSizing: 'border-box',
    });

    const tag = doc.createElement('span');
    tag.textContent = `#${mark.markId}`;
    Object.assign(tag.style, {
      position: 'absolute',
      top: '-10px',
      left: '-2px',
      background: isHot ? '#10b981' : '#0f172a',
      color: '#f8fafc',
      border: `1px solid ${isHot ? '#10b981' : '#38bdf8'}`,
      borderRadius: '4px',
      padding: '0 4px',
      fontSize: '10px',
      fontWeight: '800',
      fontFamily: 'monospace',
      lineHeight: '14px',
    });

    box.appendChild(tag);
    container.appendChild(box);
  }

  doc.body.appendChild(container);
  return marks.length;
}
