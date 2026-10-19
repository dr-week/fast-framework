import type { CleanupFn, Signal } from '@zuari/signals';
import type { NativeInvokerCommand } from '../invoker.js';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerOptions {
  id?: string | undefined;
  isOpen?: Signal<boolean> | boolean | undefined;
  placement?: DrawerPlacement | undefined;
  closeOnBackdropClick?: boolean | undefined;
  closeOnEscape?: boolean | undefined;
  enableSwipeToClose?: boolean | undefined;
  swipeThresholdPx?: number | undefined;
  durationMs?: number | undefined;
  onOpen?: (() => void) | undefined;
  onClose?: (() => void) | undefined;
}

export interface DrawerInstance {
  id: string;
  drawerElement: HTMLDialogElement;
  placement: Signal<DrawerPlacement>;
  isOpen: Signal<boolean>;
  open: () => Promise<void>;
  close: () => Promise<void>;
  toggle: () => Promise<void>;
  bindInvoker: (button: HTMLButtonElement, command?: 'show-modal' | 'close' | `--${string}`) => CleanupFn;
  destroy: CleanupFn;
}
