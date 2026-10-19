import type { Signal, CleanupFn } from '@zuari/signals';
import type { DrawerPlacement } from '@zuari/headless';

export interface UiDrawerOptions {
  id?: string;
  isOpen?: Signal<boolean> | boolean;
  placement?: DrawerPlacement;
  title?: string;
  description?: string;
  content?: HTMLElement | string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  enableSwipeToClose?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface UiDrawerComponent {
  element: HTMLDialogElement;
  isOpen: Signal<boolean>;
  placement: Signal<DrawerPlacement>;
  open: () => Promise<void>;
  close: () => Promise<void>;
  toggle: () => Promise<void>;
  bindTrigger: (button: HTMLButtonElement) => CleanupFn;
  destroy: CleanupFn;
}
