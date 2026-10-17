import type { CleanupFn, Signal } from '@zuari/signals';

export interface DialogOptions {
  isOpen?: Signal<boolean> | boolean | undefined;
  closeOnBackdropClick?: boolean | undefined;
  closeOnEscape?: boolean | undefined;
  onOpen?: (() => void) | undefined;
  onClose?: (() => void) | undefined;
}

export interface DialogInstance {
  dialogElement: HTMLDialogElement;
  isOpen: Signal<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  destroy: CleanupFn;
}
