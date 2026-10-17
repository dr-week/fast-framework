/**
 * @fileoverview HTML Invoker Commands API (`command` / `commandfor`) & CSS `reading-flow` utilities.
 * Allows modals, popovers, and interactive disclosure widgets to open declaratively
 * even before JavaScript finishes loading, with seamless signal synchronization.
 */

import type { CleanupFn } from '@zuari/signals';

export type NativeInvokerCommand =
  | 'show-modal'
  | 'close'
  | 'toggle-popover'
  | 'show-popover'
  | 'hide-popover'
  | `--${string}`;

export type CSSReadingFlowValue =
  | 'normal'
  | 'flex-visual'
  | 'flex-flow'
  | 'grid-rows'
  | 'grid-columns'
  | 'grid-order'
  | 'source-order';

export interface CommandEventLike extends Event {
  readonly command: string;
  readonly source: Element | null;
}

/**
 * Checks whether the current browser natively supports the HTML Invoker Commands API
 * (`commandForElement` / `command` on HTMLButtonElement).
 */
export function hasNativeInvokerCommands(): boolean {
  return (
    typeof HTMLButtonElement !== 'undefined' &&
    'command' in HTMLButtonElement.prototype
  );
}

/**
 * Declaratively binds an invoker button (`commandfor` + `command`) to a target dialog or popover element.
 * Also attaches a lightweight polyfill fallback listener when running in older runtimes or headless DOMs.
 */
export function bindInvokerCommand(
  button: HTMLButtonElement,
  target: HTMLElement | string,
  command: NativeInvokerCommand = 'toggle-popover'
): CleanupFn {
  const targetId = typeof target === 'string' ? target : target.id;
  if (!targetId) {
    throw new Error('[Zuari Invoker]: Target element must have a valid id attribute for commandfor.');
  }

  button.setAttribute('commandfor', targetId);
  button.setAttribute('command', command);

  const handleFallbackClick = () => {
    if (hasNativeInvokerCommands()) {
      return;
    }
    const resolvedTarget =
      typeof target === 'string' ? document.getElementById(target) : target;
    if (!resolvedTarget) return;

    // Dispatch standard W3C 'command' event on target
    const cmdEvent = new CustomEvent('command', {
      bubbles: false,
      cancelable: true
    }) as unknown as CommandEventLike;
    Object.defineProperties(cmdEvent, {
      command: { value: command, enumerable: true },
      source: { value: button, enumerable: true }
    });

    const notCancelled = resolvedTarget.dispatchEvent(cmdEvent);
    if (!notCancelled) return;

    if (command === 'show-modal' && 'showModal' in resolvedTarget) {
      const dlg = resolvedTarget as HTMLDialogElement;
      if (!dlg.open && typeof dlg.showModal === 'function') {
        dlg.showModal();
      }
    } else if (command === 'close' && 'close' in resolvedTarget) {
      const dlg = resolvedTarget as HTMLDialogElement;
      if (dlg.open && typeof dlg.close === 'function') {
        dlg.close();
      }
    } else if (command === 'show-popover' && 'showPopover' in resolvedTarget) {
      try {
        (resolvedTarget as HTMLElement).showPopover?.();
      } catch {}
    } else if (command === 'hide-popover' && 'hidePopover' in resolvedTarget) {
      try {
        (resolvedTarget as HTMLElement).hidePopover?.();
      } catch {}
    } else if (command === 'toggle-popover' && 'togglePopover' in resolvedTarget) {
      try {
        (resolvedTarget as HTMLElement).togglePopover?.();
      } catch {}
    }
  };

  button.addEventListener('click', handleFallbackClick);
  return () => {
    button.removeEventListener('click', handleFallbackClick);
  };
}

/**
 * Applies the CSS Display Level 4 `reading-flow` property to an element
 * so screen readers and Tab focus follow visual flex/grid order automatically.
 */
export function applyReadingFlow(
  container: HTMLElement,
  flow: CSSReadingFlowValue = 'flex-visual'
): void {
  container.style.setProperty('reading-flow', flow);
  container.setAttribute('data-reading-flow', flow);
}
