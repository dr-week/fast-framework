import type { Signal } from '@zuari/signals';

export interface PopoverProps {
  isOpen?: Signal<boolean> | boolean | undefined;
  anchorName?: string | undefined;
  placement?: 'top' | 'bottom' | 'left' | 'right' | undefined;
}

export interface PopoverInstance {
  element: HTMLDivElement;
  isOpen: Signal<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  destroy: () => void;
}
