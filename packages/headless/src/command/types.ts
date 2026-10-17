import type { CleanupFn, Signal, Computed } from '@zuari/signals';

export interface CommandItem {
  id: string;
  title: string;
  category?: string | undefined;
  shortcut?: string | undefined;
  icon?: string | SVGElement | undefined;
  onSelect: () => void;
}

export interface CommandPaletteOptions {
  items: CommandItem[] | Signal<CommandItem[]>;
  isOpen?: Signal<boolean> | boolean | undefined;
  placeholder?: string | undefined;
  hotkey?: string | undefined; // e.g., 'k' for Cmd/Ctrl+K
  onClose?: (() => void) | undefined;
}

export interface CommandPaletteInstance {
  containerElement: HTMLDivElement;
  inputElement: HTMLInputElement;
  listElement: HTMLUListElement;
  isOpen: Signal<boolean>;
  query: Signal<string>;
  filteredItems: Computed<CommandItem[]> | Signal<CommandItem[]>;
  selectedIndex: Signal<number>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  destroy: CleanupFn;
}
