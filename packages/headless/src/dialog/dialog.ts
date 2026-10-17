import { signal, effect, type CleanupFn } from '@zuari/signals';
import type { DialogOptions, DialogInstance } from './types.js';
import { captureFocus, restoreFocus } from './focus.js';
import { bindInvokerCommand, type CommandEventLike } from '../invoker.js';

let dialogIdCounter = 0;

/**
 * Creates an accessible, unstyled modal primitive utilizing the browser-native <dialog> element
 * and HTML Invoker Commands API (`commandfor` / `command="show-modal"`).
 * Zero third-party focus-trapping libraries required.
 */
export function createDialog(options: DialogOptions = {}): DialogInstance {
  const dialog = document.createElement('dialog');
  const id = options.id ?? `zuari-dialog-${++dialogIdCounter}`;
  dialog.id = id;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const isOpen = typeof options.isOpen === 'object' && options.isOpen !== null && 'value' in options.isOpen
    ? options.isOpen
    : signal(Boolean(options.isOpen));

  const closeOnBackdrop = options.closeOnBackdropClick ?? true;
  const closeOnEsc = options.closeOnEscape ?? true;

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  // 1. Native Backdrop Click Detection (Browser standard)
  const handleBackdropClick = (event: MouseEvent) => {
    if (!closeOnBackdrop) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      close();
    }
  };

  // 2. Native Cancel / Escape Event & Close Event synchronization
  const handleCancel = (event: Event) => {
    if (!closeOnEsc) {
      event.preventDefault();
      return;
    }
    isOpen.value = false;
  };

  const handleClose = () => {
    isOpen.value = false;
  };

  // 3. HTML Invoker Commands API ('command' event listener)
  const handleCommand = (event: Event) => {
    const cmd = (event as CommandEventLike).command;
    if (cmd === 'show-modal') {
      open();
    } else if (cmd === 'close') {
      close();
    }
  };

  dialog.addEventListener('click', handleBackdropClick);
  dialog.addEventListener('cancel', handleCancel);
  dialog.addEventListener('close', handleClose);
  dialog.addEventListener('command', handleCommand);

  // 4. Reactive Signal Synchronization with Native showModal() / close()
  const disposeEffect = effect(() => {
    if (isOpen.value) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        captureFocus();
        dialog.showModal();
        options.onOpen?.();
      }
    } else {
      if (dialog.open && typeof dialog.close === 'function') {
        dialog.close();
        restoreFocus();
        options.onClose?.();
      }
    }
  });

  const bindInvoker = (
    button: HTMLButtonElement,
    command: 'show-modal' | 'close' | `--${string}` = 'show-modal'
  ): CleanupFn => {
    return bindInvokerCommand(button, dialog, command);
  };

  const destroy: CleanupFn = () => {
    disposeEffect();
    dialog.removeEventListener('click', handleBackdropClick);
    dialog.removeEventListener('cancel', handleCancel);
    dialog.removeEventListener('close', handleClose);
    dialog.removeEventListener('command', handleCommand);
    if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
  };

  return {
    id,
    dialogElement: dialog,
    isOpen,
    open,
    close,
    toggle,
    bindInvoker,
    destroy
  };
}

