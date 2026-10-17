import { signal, effect, type CleanupFn } from '@zuari/signals';
import type { DialogOptions, DialogInstance } from './types.js';
import { captureFocus, restoreFocus } from './focus.js';

/**
 * Creates an accessible, unstyled modal primitive utilizing the browser-native <dialog> element.
 * Zero third-party focus-trapping libraries required.
 */
export function createDialog(options: DialogOptions = {}): DialogInstance {
  const dialog = document.createElement('dialog');
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

  // 2. Native Cancel / Escape Event
  const handleCancel = (event: Event) => {
    if (!closeOnEsc) {
      event.preventDefault();
      return;
    }
    // Browser closes modal natively on escape; synchronize our reactive signal
    isOpen.value = false;
  };

  dialog.addEventListener('click', handleBackdropClick);
  dialog.addEventListener('cancel', handleCancel);

  // 3. Reactive Signal Synchronization with Native showModal() / close()
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

  const destroy: CleanupFn = () => {
    disposeEffect();
    dialog.removeEventListener('click', handleBackdropClick);
    dialog.removeEventListener('cancel', handleCancel);
    if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
  };

  return {
    dialogElement: dialog,
    isOpen,
    open,
    close,
    toggle,
    destroy
  };
}
