import type { CleanupFn, Signal } from '@zuari/signals';
import type { NativeInvokerCommand } from '../invoker.js';

export interface DialogOptions {
  id?: string | undefined;
  isOpen?: Signal<boolean> | boolean | undefined;
  closeOnBackdropClick?: boolean | undefined;
  closeOnEscape?: boolean | undefined;
  onOpen?: (() => void) | undefined;
  onClose?: (() => void) | undefined;
}

export interface DialogInstance {
  id: string;
  dialogElement: HTMLDialogElement;
  isOpen: Signal<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Binds or creates an HTML Invoker Command button (<button commandfor="id" command="show-modal">) */
  bindInvoker: (button: HTMLButtonElement, command?: 'show-modal' | 'close' | `--${string}`) => CleanupFn;
  destroy: CleanupFn;
}

