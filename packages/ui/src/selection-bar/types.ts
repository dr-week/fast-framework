import type { Signal } from '@zuari/signals';
import type { ButtonVariant } from '../button/types.js';

export interface SelectionBarAction {
  readonly id: string;
  readonly label: string;
  readonly variant?: ButtonVariant | undefined;
  readonly disabled?: boolean | undefined;
  readonly icon?: HTMLElement | SVGElement | undefined;
  readonly onClick: (event: MouseEvent) => void;
}

export interface SelectionBarProps {
  readonly selectedCount: number | Signal<number>;
  readonly selectedLabel?: string | undefined;
  readonly ariaLabel?: string | undefined;
  readonly actions: readonly SelectionBarAction[];
  readonly onClear?: (() => void) | undefined;
}

export interface SelectionBarInstance {
  readonly element: HTMLElement;
  readonly selectedCount: Signal<number>;
  setSelectedCount(count: number): void;
  destroy(): void;
}
