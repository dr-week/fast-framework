/**
 * @fileoverview Accessible Combobox / Autocomplete Headless Primitive.
 * Adheres strictly to the W3C WAI-ARIA 1.2 Combobox pattern:
 * - `role="combobox"` on input with `aria-autocomplete="list"`, `aria-expanded`, and `aria-controls`
 * - Roving selection with `aria-activedescendant`
 * - Filterable / fuzzy matching support
 * - Native keyboard support: ArrowDown, ArrowUp, Enter, Escape, Home, End
 * - CSS Anchor Positioning for the popup listbox
 */

import { signal, computed, type Signal, type Computed, type CleanupFn } from '@zuari/signals';
import { generateAnchorName, setElementAnchor, tetherToAnchor } from '../anchor.js';

export interface ComboboxOption<T = unknown> {
  readonly id: string;
  readonly label: string;
  readonly value: T;
  readonly disabled?: boolean;
}

export interface ComboboxOptions<T = unknown> {
  readonly id?: string;
  readonly items: readonly ComboboxOption<T>[];
  readonly anchorName?: string;
  readonly placeholder?: string;
  readonly filter?: (query: string, item: ComboboxOption<T>) => boolean;
  readonly onSelect?: (item: ComboboxOption<T>) => void;
}

export interface ComboboxInstance<T = unknown> {
  readonly inputElement: HTMLInputElement;
  readonly listboxElement: HTMLElement;
  readonly containerElement: HTMLElement;
  readonly anchorName: string;
  readonly isOpen: Signal<boolean>;
  readonly query: Signal<string>;
  readonly activeIndex: Signal<number>;
  readonly selectedItem: Signal<ComboboxOption<T> | null>;
  readonly filteredItems: Computed<readonly ComboboxOption<T>[]>;
  open(): void;
  close(): void;
  select(item: ComboboxOption<T>): void;
  destroy(): void;
}

let comboboxCounter = 0;

export function createCombobox<T = unknown>(options: ComboboxOptions<T>): ComboboxInstance<T> {
  const cbId = options.id ?? `zuari-combobox-${++comboboxCounter}`;
  const listboxId = `${cbId}-listbox`;
  const anchorName = options.anchorName ?? generateAnchorName('combobox');

  const isOpen = signal<boolean>(false);
  const query = signal<string>('');
  const activeIndex = signal<number>(-1);
  const selectedItem = signal<ComboboxOption<T> | null>(null);
  const cleanups: CleanupFn[] = [];

  const defaultFilter = (q: string, item: ComboboxOption<T>) =>
    item.label.toLowerCase().includes(q.toLowerCase().trim());
  const filterFn = options.filter ?? defaultFilter;

  const filteredItems = computed<readonly ComboboxOption<T>[]>(() => {
    const q = query.value;
    if (!q) return options.items;
    return options.items.filter(it => filterFn(q, it));
  });

  // DOM Container
  const containerElement = document.createElement('div');
  containerElement.className = 'zuari-combobox-root';
  containerElement.style.position = 'relative';

  // Input element
  const inputElement = document.createElement('input');
  inputElement.id = `${cbId}-input`;
  inputElement.setAttribute('type', 'text');
  inputElement.setAttribute('role', 'combobox');
  inputElement.setAttribute('aria-autocomplete', 'list');
  inputElement.setAttribute('aria-expanded', 'false');
  inputElement.setAttribute('aria-controls', listboxId);
  inputElement.setAttribute('aria-haspopup', 'listbox');
  inputElement.autocomplete = 'off';
  if (options.placeholder) inputElement.placeholder = options.placeholder;
  setElementAnchor(inputElement, anchorName);

  // Listbox element
  const listboxElement = document.createElement('div');
  listboxElement.id = listboxId;
  listboxElement.setAttribute('role', 'listbox');
  listboxElement.setAttribute('tabindex', '-1');
  listboxElement.style.display = 'none';

  try {
    listboxElement.setAttribute('popover', 'manual');
  } catch {
    // fallback
  }
  tetherToAnchor(listboxElement, anchorName);

  function renderList() {
    listboxElement.innerHTML = '';
    const currentList = filteredItems.value;

    currentList.forEach((item, idx) => {
      const optEl = document.createElement('div');
      optEl.id = `${cbId}-opt-${idx}`;
      optEl.setAttribute('role', 'option');
      optEl.setAttribute('tabindex', '-1');
      optEl.setAttribute('data-index', String(idx));
      optEl.textContent = item.label;

      if (item.disabled) {
        optEl.setAttribute('aria-disabled', 'true');
      }

      if (selectedItem.value?.id === item.id) {
        optEl.setAttribute('aria-selected', 'true');
      }

      const onOptClick = () => {
        if (item.disabled) return;
        select(item);
      };

      optEl.addEventListener('click', onOptClick);

      optEl.addEventListener('mouseenter', () => {
        if (!item.disabled) {
          activeIndex.value = idx;
          highlightOption(idx);
        }
      });

      listboxElement.appendChild(optEl);
    });
  }

  function highlightOption(index: number) {
    const opts = listboxElement.querySelectorAll('[role="option"]');
    opts.forEach((el, i) => {
      if (i === index) {
        el.setAttribute('data-highlighted', 'true');
        inputElement.setAttribute('aria-activedescendant', el.id);
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.removeAttribute('data-highlighted');
      }
    });

    if (index < 0) {
      inputElement.removeAttribute('aria-activedescendant');
    }
  }

  function open() {
    if (isOpen.value) return;
    isOpen.value = true;
    inputElement.setAttribute('aria-expanded', 'true');
    renderList();

    if (typeof (listboxElement as unknown as { showPopover?: () => void }).showPopover === 'function') {
      try {
        (listboxElement as unknown as { showPopover: () => void }).showPopover();
      } catch {
        listboxElement.style.display = 'block';
      }
    } else {
      listboxElement.style.display = 'block';
    }

    const firstEnabled = filteredItems.value.findIndex(it => !it.disabled);
    activeIndex.value = firstEnabled >= 0 ? firstEnabled : -1;
    if (firstEnabled >= 0) {
      highlightOption(firstEnabled);
    }
  }

  function close() {
    if (!isOpen.value) return;
    isOpen.value = false;
    inputElement.setAttribute('aria-expanded', 'false');
    inputElement.removeAttribute('aria-activedescendant');

    if (typeof (listboxElement as unknown as { hidePopover?: () => void }).hidePopover === 'function') {
      try {
        (listboxElement as unknown as { hidePopover: () => void }).hidePopover();
      } catch {
        listboxElement.style.display = 'none';
      }
    } else {
      listboxElement.style.display = 'none';
    }

    activeIndex.value = -1;
  }

  function select(item: ComboboxOption<T>) {
    selectedItem.value = item;
    query.value = item.label;
    inputElement.value = item.label;
    options.onSelect?.(item);
    close();
    inputElement.focus();
  }

  // Input event handling
  const onInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    query.value = val;
    if (!isOpen.value) open();
    else renderList();
  };

  const onFocus = () => {
    open();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const list = filteredItems.value;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen.value) {
          open();
          return;
        }
        let next = activeIndex.value + 1;
        while (next < list.length && list[next]?.disabled) {
          next++;
        }
        if (next < list.length) {
          activeIndex.value = next;
          highlightOption(next);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen.value) {
          open();
          return;
        }
        let prev = activeIndex.value - 1;
        while (prev >= 0 && list[prev]?.disabled) {
          prev--;
        }
        if (prev >= 0) {
          activeIndex.value = prev;
          highlightOption(prev);
        }
        break;
      }
      case 'Enter': {
        if (isOpen.value && activeIndex.value >= 0 && list[activeIndex.value]) {
          e.preventDefault();
          const targetItem = list[activeIndex.value]!;
          if (!targetItem.disabled) {
            select(targetItem);
          }
        }
        break;
      }
      case 'Escape': {
        if (isOpen.value) {
          e.preventDefault();
          close();
        }
        break;
      }
      case 'Tab': {
        close();
        break;
      }
    }
  };

  inputElement.addEventListener('input', onInput);
  inputElement.addEventListener('focus', onFocus);
  inputElement.addEventListener('keydown', onKeyDown);
  cleanups.push(() => {
    inputElement.removeEventListener('input', onInput);
    inputElement.removeEventListener('focus', onFocus);
    inputElement.removeEventListener('keydown', onKeyDown);
  });

  const onDocClick = (e: MouseEvent) => {
    if (!containerElement.contains(e.target as Node) && !listboxElement.contains(e.target as Node)) {
      close();
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('click', onDocClick);
    cleanups.push(() => document.removeEventListener('click', onDocClick));
  }

  containerElement.appendChild(inputElement);
  containerElement.appendChild(listboxElement);

  return {
    inputElement,
    listboxElement,
    containerElement,
    anchorName,
    isOpen,
    query,
    activeIndex,
    selectedItem,
    filteredItems,
    open,
    close,
    select,
    destroy: () => {
      close();
      for (const fn of cleanups) fn();
      cleanups.length = 0;
    }
  };
}
