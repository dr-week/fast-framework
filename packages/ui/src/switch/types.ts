import type { Signal } from '@zuari/signals';

export interface SwitchProps {
  checked?: Signal<boolean> | boolean | undefined;
  label?: string | undefined;
  onChange?: ((checked: boolean) => void) | undefined;
  disabled?: boolean | undefined;
}

export interface SwitchInstance {
  element: HTMLButtonElement;
  isChecked: Signal<boolean>;
  toggle: () => void;
  destroy: () => void;
}
