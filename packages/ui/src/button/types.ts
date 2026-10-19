import type { Signal, CleanupFn } from '@zuari/signals';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'tactical';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label?: string | Signal<string>;
  variant?: ButtonVariant | Signal<ButtonVariant>;
  size?: ButtonSize;
  disabled?: boolean | Signal<boolean>;
  loading?: boolean | Signal<boolean>;
  icon?: HTMLElement | SVGElement;
  onClick?: (event: MouseEvent) => void;
  ariaLabel?: string;
}

export interface ButtonInstance {
  element: HTMLButtonElement;
  disabled: Signal<boolean>;
  loading: Signal<boolean>;
  variant: Signal<ButtonVariant>;
  destroy: CleanupFn;
}
