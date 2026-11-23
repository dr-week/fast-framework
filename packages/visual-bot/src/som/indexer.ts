/**
 * @fileoverview Stagehand-style Set-of-Mark (SoM) Semantic DOM Indexer (Layer 2).
 * Indexes visible interactive controls with deterministic numeric marks (#1, #2, ...)
 * while strictly redacting password, OTP, payment, and destructive controls.
 */

import type {
  DomElementLike,
  DomIndexResult,
  DomRootLike,
  SemanticMark,
  SemanticMarkMatch,
} from '../types.js';

const BLOCKED_INPUT_TYPES = new Set(['password', 'hidden']);
const DEFAULT_UNSAFE_LABEL_RE =
  /\b(password|passcode|otp|2fa|cvv|card number|credit card|ssn|wire transfer|delete account|pay now)\b/i;

const INTERACTIVE_SELECTOR =
  'button, a[href], input, textarea, [role="button"], [role="textbox"], [contenteditable="true"]';

/**
 * Fail-closed sensitivity guard. Returns true for password, hidden, OTP,
 * credit card, or destructive/payment controls.
 */
export function isSensitiveElement(
  el: DomElementLike | null | undefined,
  extraUnsafePattern?: RegExp
): boolean {
  if (!el) return true;
  const tag = (el.tagName || '').toLowerCase();
  const type = (el.getAttribute?.('type') || '').toLowerCase();
  if (tag === 'input' && BLOCKED_INPUT_TYPES.has(type)) return true;

  const autocomplete = (el.getAttribute?.('autocomplete') || '').toLowerCase();
  if (
    autocomplete.includes('password') ||
    autocomplete.includes('cc-') ||
    autocomplete.includes('one-time-code')
  ) {
    return true;
  }

  const combined = [
    el.getAttribute?.('aria-label'),
    el.getAttribute?.('name'),
    el.getAttribute?.('placeholder'),
    el.textContent?.slice(0, 80),
  ]
    .filter(Boolean)
    .join(' ');

  if (DEFAULT_UNSAFE_LABEL_RE.test(combined)) return true;
  if (extraUnsafePattern && extraUnsafePattern.test(combined)) return true;
  return false;
}

/**
 * Extracts a concise human-readable semantic label from an interactive element.
 */
export function extractSemanticLabel(el: DomElementLike): string {
  const candidates = [
    el.getAttribute?.('aria-label'),
    el.getAttribute?.('title'),
    el.getAttribute?.('placeholder'),
    el.textContent?.trim()?.replace(/\s+/g, ' ').slice(0, 64),
  ];
  return candidates.find(Boolean) || (el.tagName || 'element').toLowerCase();
}

/**
 * Builds a deterministic semantic CSS selector prioritizing stable attributes.
 */
export function buildSafeSelector(el: DomElementLike): string {
  const testId = el.getAttribute?.('data-testid');
  if (testId) return `[data-testid="${testId}"]`;
  const aria = el.getAttribute?.('aria-label');
  if (aria) return `${(el.tagName || '').toLowerCase()}[aria-label="${aria.slice(0, 48)}"]`;
  if (el.id) return `#${el.id}`;
  const role = el.getAttribute?.('role');
  if (role) return `${(el.tagName || '').toLowerCase()}[role="${role}"]`;
  return (el.tagName || 'div').toLowerCase();
}

export interface IndexDomOptions {
  maxMarks?: number;
  selector?: string;
  extraUnsafePattern?: RegExp;
}

/**
 * Scans a DOM root and indexes visible, non-sensitive interactive controls.
 */
export function indexInteractiveDom(
  root: DomRootLike | null | undefined = typeof document !== 'undefined' ? document : null,
  options: IndexDomOptions = {}
): DomIndexResult {
  const { maxMarks = 60, selector = INTERACTIVE_SELECTOR, extraUnsafePattern } = options;
  const nodes = Array.from(root?.querySelectorAll?.(selector) || []);
  const marks: SemanticMark[] = [];
  let blockedCount = 0;

  for (const el of nodes) {
    if (marks.length >= maxMarks) break;
    if (isSensitiveElement(el, extraUnsafePattern)) {
      blockedCount++;
      continue;
    }

    const rect = el.getBoundingClientRect
      ? el.getBoundingClientRect()
      : { x: 0, y: 0, width: 100, height: 32 };
    if (rect.width <= 0 || rect.height <= 0) continue;

    marks.push({
      markId: marks.length + 1,
      tag: (el.tagName || '').toLowerCase(),
      role: el.getAttribute?.('role') || (el.tagName || '').toLowerCase(),
      label: extractSemanticLabel(el),
      selector: buildSafeSelector(el),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
    });
  }

  return { marks, totalIndexed: marks.length, blockedCount };
}

/**
 * Matches a natural-language query against indexed Set-of-Mark targets.
 */
export function querySemanticMark(marks: SemanticMark[], query: string): SemanticMarkMatch | null {
  const needle = (query || '').trim().toLowerCase();
  if (!needle) return null;
  const tokens = needle.split(/\s+/).filter(Boolean);

  let best: SemanticMark | null = null;
  let bestScore = 0;
  for (const mark of marks) {
    const hay = `${mark.label} ${mark.role} ${mark.selector}`.toLowerCase();
    let score = 0;
    if (hay === needle) score += 100;
    else if (hay.includes(needle)) score += 60;
    for (const tok of tokens) {
      if (hay.includes(tok)) score += 20;
    }
    if (score > bestScore) {
      bestScore = score;
      best = mark;
    }
  }
  return best ? { ...best, matchScore: bestScore } : null;
}
