import type { Signal } from '@zuari/signals';

export interface TabItem {
  id: string;
  label?: string | undefined;
  icon?: SVGElement | undefined;
  tooltip?: string | undefined;
}

export interface TabsProps {
  items: TabItem[];
  activeId?: Signal<string> | string | undefined;
  onChange?: ((id: string) => void) | undefined;
  ariaLabel?: string | undefined;
}

export interface TabsInstance {
  element: HTMLElement;
  activeId: Signal<string>;
  setActive: (id: string) => void;
  destroy: () => void;
}
