/**
 * @fileoverview Menu, DropdownMenu & ContextMenu headless primitives.
 * Built on native HTML Popover API (`popover="auto"` / `popover="manual"`),
 * CSS Anchor Positioning (`position-anchor`), and full WAI-ARIA Menu pattern keyboard roving.
 */

import { signal, type Signal, type CleanupFn } from '@zuari/signals';
import { generateAnchorName, setElementAnchor, tetherToAnchor } from '../anchor.js';

export interface MenuItemOption {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly onSelect?: () => void;
  readonly shortcut?: string;
  readonly role?: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
  readonly checked?: boolean | Signal<boolean>;
}

export interface MenuOptions {
  readonly id?: string;
  readonly items: readonly MenuItemOption[];
  readonly anchorName?: string;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly onOpenChange?: (open: boolean) => void;
}

export interface MenuInstance {
  readonly menuElement: HTMLElement;
  readonly triggerElement: HTMLElement;
  readonly anchorName: string;
  readonly isOpen: Signal<boolean>;
  readonly activeIndex: Signal<number>;
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}

export interface ContextMenuOptions {
  readonly items: readonly MenuItemOption[];
  readonly onOpenChange?: (open: boolean) => void;
}

export interface ContextMenuInstance {
  readonly menuElement: HTMLElement;
  readonly isOpen: Signal<boolean>;
  readonly activeIndex: Signal<number>;
  attach(targetElement: HTMLElement): CleanupFn;
  openAt(clientX: number, clientY: number): void;
  close(): void;
  destroy(): void;
}

let menuCounter = 0;

/**
 * Creates an accessible headless DropdownMenu primitive.
 */
export function createDropdownMenu(options: MenuOptions): MenuInstance {
  const menuId = options.id ?? `zuari-menu-${++menuCounter}`;
  const anchorName = options.anchorName ?? generateAnchorName('menu');
  const isOpen = signal<boolean>(false);
  const activeIndex = signal<number>(-1);
  const cleanups: CleanupFn[] = [];

  // Trigger Element
  const triggerElement = document.createElement('button');
  triggerElement.setAttribute('type', 'button');
  triggerElement.setAttribute('aria-haspopup', 'menu');
  triggerElement.setAttribute('aria-expanded', 'false');
  triggerElement.setAttribute('aria-controls', menuId);
  setElementAnchor(triggerElement, anchorName);

  // Menu Popup Element
  const menuElement = document.createElement('div');
  menuElement.id = menuId;
  menuElement.setAttribute('role', 'menu');
  menuElement.setAttribute('aria-orientation', options.orientation ?? 'vertical');
  menuElement.setAttribute('tabindex', '-1');

  // Support HTML Popover API natively
  try {
    menuElement.setAttribute('popover', 'auto');
  } catch {
    // fallback if unsupported
  }
  tetherToAnchor(menuElement, anchorName);

  // Render items
  const itemElements: HTMLElement[] = [];
  options.items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.id = `${menuId}-item-${idx}`;
    el.setAttribute('role', item.role ?? 'menuitem');
    el.setAttribute('tabindex', '-1');
    el.setAttribute('data-index', String(idx));
    el.textContent = item.label;

    if (item.disabled) {
      el.setAttribute('aria-disabled', 'true');
    }

    if (item.checked !== undefined) {
      const isChecked = typeof item.checked === 'object' && 'value' in item.checked
        ? item.checked.value
        : Boolean(item.checked);
      el.setAttribute('aria-checked', String(isChecked));
    }

    const selectItem = () => {
      if (item.disabled) return;
      item.onSelect?.();
      close();
      triggerElement.focus();
    };

    el.addEventListener('click', selectItem);
    cleanups.push(() => el.removeEventListener('click', selectItem));

    el.addEventListener('mouseenter', () => {
      if (!item.disabled) {
        activeIndex.value = idx;
        updateFocus(idx);
      }
    });

    itemElements.push(el);
    menuElement.appendChild(el);
  });

  function updateFocus(index: number) {
    itemElements.forEach((el, i) => {
      if (i === index) {
        el.setAttribute('data-highlighted', 'true');
        el.focus();
      } else {
        el.removeAttribute('data-highlighted');
      }
    });
  }

  function open() {
    if (isOpen.value) return;
    isOpen.value = true;
    triggerElement.setAttribute('aria-expanded', 'true');

    if (typeof (menuElement as unknown as { showPopover?: () => void }).showPopover === 'function') {
      try {
        (menuElement as unknown as { showPopover: () => void }).showPopover();
      } catch {
        menuElement.style.display = 'block';
      }
    } else {
      menuElement.style.display = 'block';
    }

    // Set initial focus to first enabled item
    const firstEnabled = options.items.findIndex(it => !it.disabled);
    activeIndex.value = firstEnabled >= 0 ? firstEnabled : 0;
    if (firstEnabled >= 0) {
      updateFocus(firstEnabled);
    }
    options.onOpenChange?.(true);
  }

  function close() {
    if (!isOpen.value) return;
    isOpen.value = false;
    triggerElement.setAttribute('aria-expanded', 'false');

    if (typeof (menuElement as unknown as { hidePopover?: () => void }).hidePopover === 'function') {
      try {
        (menuElement as unknown as { hidePopover: () => void }).hidePopover();
      } catch {
        menuElement.style.display = 'none';
      }
    } else {
      menuElement.style.display = 'none';
    }

    activeIndex.value = -1;
    itemElements.forEach(el => el.removeAttribute('data-highlighted'));
    options.onOpenChange?.(false);
  }

  function toggle() {
    if (isOpen.value) close();
    else open();
  }

  // Trigger clicks
  const onTriggerClick = (e: MouseEvent) => {
    e.preventDefault();
    toggle();
  };
  triggerElement.addEventListener('click', onTriggerClick);
  cleanups.push(() => triggerElement.removeEventListener('click', onTriggerClick));

  // Native popover toggle event listener
  const onToggleEvent = (e: Event) => {
    const isNowOpen = (e as unknown as { newState?: string }).newState === 'open';
    if (isOpen.value !== isNowOpen) {
      if (isNowOpen) open();
      else close();
    }
  };
  menuElement.addEventListener('toggle', onToggleEvent);
  cleanups.push(() => menuElement.removeEventListener('toggle', onToggleEvent));

  // Keyboard Roving Navigation
  const onKeyDown = (e: KeyboardEvent) => {
    if (!isOpen.value) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        let next = activeIndex.value + 1;
        while (next < options.items.length && options.items[next]?.disabled) {
          next++;
        }
        if (next >= options.items.length) {
          next = options.items.findIndex(it => !it.disabled);
        }
        if (next >= 0) {
          activeIndex.value = next;
          updateFocus(next);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        let prev = activeIndex.value - 1;
        while (prev >= 0 && options.items[prev]?.disabled) {
          prev--;
        }
        if (prev < 0) {
          for (let i = options.items.length - 1; i >= 0; i--) {
            if (!options.items[i]?.disabled) {
              prev = i;
              break;
            }
          }
        }
        if (prev >= 0) {
          activeIndex.value = prev;
          updateFocus(prev);
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        const first = options.items.findIndex(it => !it.disabled);
        if (first >= 0) {
          activeIndex.value = first;
          updateFocus(first);
        }
        break;
      }
      case 'End': {
        e.preventDefault();
        for (let i = options.items.length - 1; i >= 0; i--) {
          if (!options.items[i]?.disabled) {
            activeIndex.value = i;
            updateFocus(i);
            break;
          }
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const curr = options.items[activeIndex.value];
        if (curr && !curr.disabled) {
          curr.onSelect?.();
          close();
          triggerElement.focus();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        close();
        triggerElement.focus();
        break;
      }
      case 'Tab': {
        close();
        break;
      }
    }
  };

  triggerElement.addEventListener('keydown', onKeyDown);
  menuElement.addEventListener('keydown', onKeyDown);
  cleanups.push(() => {
    triggerElement.removeEventListener('keydown', onKeyDown);
    menuElement.removeEventListener('keydown', onKeyDown);
  });

  return {
    menuElement,
    triggerElement,
    anchorName,
    isOpen,
    activeIndex,
    open,
    close,
    toggle,
    destroy: () => {
      close();
      for (const fn of cleanups) fn();
      cleanups.length = 0;
    }
  };
}

/**
 * Creates an accessible headless ContextMenu primitive.
 */
export function createContextMenu(options: ContextMenuOptions): ContextMenuInstance {
  const menuId = `zuari-contextmenu-${++menuCounter}`;
  const isOpen = signal<boolean>(false);
  const activeIndex = signal<number>(-1);
  const cleanups: CleanupFn[] = [];

  const menuElement = document.createElement('div');
  menuElement.id = menuId;
  menuElement.setAttribute('role', 'menu');
  menuElement.setAttribute('tabindex', '-1');
  menuElement.style.position = 'fixed';
  menuElement.style.margin = '0';
  menuElement.style.display = 'none';

  try {
    menuElement.setAttribute('popover', 'manual');
  } catch {
    // fallback
  }

  const itemElements: HTMLElement[] = [];
  options.items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.setAttribute('role', item.role ?? 'menuitem');
    el.setAttribute('tabindex', '-1');
    el.textContent = item.label;

    if (item.disabled) {
      el.setAttribute('aria-disabled', 'true');
    }

    const onSelect = () => {
      if (item.disabled) return;
      item.onSelect?.();
      close();
    };

    el.addEventListener('click', onSelect);
    cleanups.push(() => el.removeEventListener('click', onSelect));

    el.addEventListener('mouseenter', () => {
      if (!item.disabled) {
        activeIndex.value = idx;
        itemElements.forEach((other, i) => {
          if (i === idx) {
            other.setAttribute('data-highlighted', 'true');
            other.focus();
          } else {
            other.removeAttribute('data-highlighted');
          }
        });
      }
    });

    itemElements.push(el);
    menuElement.appendChild(el);
  });

  function openAt(clientX: number, clientY: number) {
    isOpen.value = true;
    menuElement.style.left = `${clientX}px`;
    menuElement.style.top = `${clientY}px`;

    if (typeof (menuElement as unknown as { showPopover?: () => void }).showPopover === 'function') {
      try {
        (menuElement as unknown as { showPopover: () => void }).showPopover();
      } catch {
        menuElement.style.display = 'block';
      }
    } else {
      menuElement.style.display = 'block';
    }

    const first = options.items.findIndex(it => !it.disabled);
    activeIndex.value = first >= 0 ? first : 0;
    if (first >= 0) {
      itemElements[first]?.focus();
      itemElements[first]?.setAttribute('data-highlighted', 'true');
    }
    options.onOpenChange?.(true);
  }

  function close() {
    if (!isOpen.value) return;
    isOpen.value = false;

    if (typeof (menuElement as unknown as { hidePopover?: () => void }).hidePopover === 'function') {
      try {
        (menuElement as unknown as { hidePopover: () => void }).hidePopover();
      } catch {
        menuElement.style.display = 'none';
      }
    } else {
      menuElement.style.display = 'none';
    }

    activeIndex.value = -1;
    itemElements.forEach(el => el.removeAttribute('data-highlighted'));
    options.onOpenChange?.(false);
  }

  function attach(targetElement: HTMLElement): CleanupFn {
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      openAt(e.clientX, e.clientY);
    };

    targetElement.addEventListener('contextmenu', onContextMenu);
    return () => {
      targetElement.removeEventListener('contextmenu', onContextMenu);
    };
  }

  // Close on outside click or escape
  const onDocClick = (e: MouseEvent) => {
    if (isOpen.value && !menuElement.contains(e.target as Node)) {
      close();
    }
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (!isOpen.value) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    cleanups.push(() => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    });
  }

  return {
    menuElement,
    isOpen,
    activeIndex,
    attach,
    openAt,
    close,
    destroy: () => {
      close();
      for (const fn of cleanups) fn();
      cleanups.length = 0;
    }
  };
}
