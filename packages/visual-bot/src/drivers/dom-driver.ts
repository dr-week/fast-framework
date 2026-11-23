/**
 * @fileoverview Browser DOM BotDriver backed by createVisualBot() 3-layer cascade.
 * Enforces fail-closed sensitivity checks before clicking or typing into elements.
 */

import { createVisualBot, type VisualBotController, type VisualBotOptions } from '../cascade/bot.js';
import { isSensitiveElement } from '../som/indexer.js';
import type { BotDriver } from './interface.js';

export interface DomDriverOptions extends VisualBotOptions {
  doc?: Document;
  win?: Window;
  bot?: VisualBotController;
}

export interface DomBotDriver extends BotDriver {
  readonly bot: VisualBotController;
}

export function createDomDriver(options: DomDriverOptions = {}): DomBotDriver {
  const doc = options.doc ?? document;
  const win = options.win ?? window;
  const bot = options.bot ?? createVisualBot({ root: options.root ?? doc, ...options });

  let lastResolvedSelector: string | null = null;

  return {
    name: 'dom',
    bot,

    move(x: number, y: number): void {
      if (typeof MouseEvent === 'undefined') return;
      doc.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
    },

    click(x: number, y: number): void {
      let target: Element | null =
        typeof doc.elementFromPoint === 'function' ? doc.elementFromPoint(x, y) : null;
      if (!target && lastResolvedSelector) {
        target = doc.querySelector(lastResolvedSelector);
      }
      if (!target) return;
      if (isSensitiveElement(target, options.extraUnsafePattern)) {
        throw new Error('Blocked click on sensitive element.');
      }
      (target as HTMLElement).click?.();
    },

    type(text: string): void {
      const active =
        doc.activeElement && doc.activeElement !== doc.body
          ? doc.activeElement
          : lastResolvedSelector
            ? doc.querySelector(lastResolvedSelector)
            : null;
      if (!active) return;
      if (isSensitiveElement(active, options.extraUnsafePattern)) {
        throw new Error('Blocked typing into sensitive element.');
      }
      if ((active as HTMLElement).isContentEditable) {
        active.textContent = text;
      } else if ('value' in active) {
        (active as HTMLInputElement).value = text;
      }
      active.dispatchEvent(new Event('input', { bubbles: true }));
      active.dispatchEvent(new Event('change', { bubbles: true }));
    },

    scroll(deltaY: number): void {
      win.scrollBy?.({ top: deltaY, behavior: 'smooth' });
    },

    resolve(targetKey, resolveOpts) {
      const res = bot.resolve(targetKey, resolveOpts);
      lastResolvedSelector = res.found && res.selector ? res.selector : null;
      return res;
    },
  };
}
