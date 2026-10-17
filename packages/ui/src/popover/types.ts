import type { Signal, CleanupFn } from '@zuari/signals';

export interface PopoverProps {
  id?: string | undefined;
  isOpen?: Signal<boolean> | boolean | undefined;
  anchorName?: string | undefined;
  placement?: 'top' | 'bottom' | 'left' | 'right' | undefined;
}

export interface PopoverInstance {
  id: string;
  element: HTMLDivElement;
  isOpen: Signal<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Binds an HTML Invoker Command button (<button commandfor="id" command="toggle-popover">) */
  bindInvoker: (
    button: HTMLButtonElement,
    command?: 'toggle-popover' | 'show-popover' | 'hide-popover' | `--${string}`
  ) => CleanupFn;
  destroy: () => void;
}

