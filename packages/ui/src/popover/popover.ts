import { signal, effect, type CleanupFn } from '@zuari/signals';
import {
  tetherToAnchor,
  generateAnchorName,
  bindInvokerCommand,
  type CommandEventLike
} from '@zuari/headless';
import type { PopoverProps, PopoverInstance } from './types.js';

let popoverCounter = 0;

/**
 * Creates an accessible floating popover leveraging native HTML popover,
 * HTML Invoker Commands API (`commandfor` / `command`), and CSS Anchor Positioning.
 */
export function createPopover(props: PopoverProps = {}): PopoverInstance {
  const popover = document.createElement('div');
  const id = props.id ?? `zuari-popover-${++popoverCounter}`;
  popover.setAttribute('popover', 'auto');
  popover.setAttribute('role', 'region');
  popover.classList.add('zuari-popover');
  popover.id = id;

  const anchor = props.anchorName ?? generateAnchorName('popover');
  tetherToAnchor(popover, anchor);

  const isOpen = typeof props.isOpen === 'object' && props.isOpen !== null && 'value' in props.isOpen
    ? props.isOpen
    : signal(Boolean(props.isOpen));

  const open = () => {
    isOpen.value = true;
    if (typeof popover.showPopover === 'function') {
      try {
        popover.showPopover();
      } catch {
        // Already open
      }
    }
  };

  const close = () => {
    isOpen.value = false;
    if (typeof popover.hidePopover === 'function') {
      try {
        popover.hidePopover();
      } catch {
        // Already closed
      }
    }
  };

  const toggle = () => {
    if (isOpen.value) close();
    else open();
  };

  const handleToggleEvent = (e: Event) => {
    const newState = (e as unknown as { newState?: string }).newState;
    isOpen.value = newState === 'open';
  };

  const handleCommandEvent = (e: Event) => {
    const cmd = (e as CommandEventLike).command;
    if (cmd === 'show-popover') {
      open();
    } else if (cmd === 'hide-popover') {
      close();
    } else if (cmd === 'toggle-popover') {
      toggle();
    }
  };

  popover.addEventListener('toggle', handleToggleEvent);
  popover.addEventListener('command', handleCommandEvent);

  const disposeEffect = effect(() => {
    if (isOpen.value) {
      if (typeof popover.showPopover === 'function' && !popover.matches(':popover-open')) {
        try { popover.showPopover(); } catch {}
      }
    } else {
      if (typeof popover.hidePopover === 'function' && popover.matches(':popover-open')) {
        try { popover.hidePopover(); } catch {}
      }
    }
  });

  const bindInvoker = (
    button: HTMLButtonElement,
    command: 'toggle-popover' | 'show-popover' | 'hide-popover' | `--${string}` = 'toggle-popover'
  ): CleanupFn => {
    return bindInvokerCommand(button, popover, command);
  };

  const destroy: CleanupFn = () => {
    disposeEffect();
    popover.removeEventListener('toggle', handleToggleEvent);
    popover.removeEventListener('command', handleCommandEvent);
    close();
  };

  return {
    id,
    element: popover,
    isOpen,
    open,
    close,
    toggle,
    bindInvoker,
    destroy
  };
}

