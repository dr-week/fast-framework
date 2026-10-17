import { signal, effect, type CleanupFn } from '@zuari/signals';
import type { TabsProps, TabsInstance } from './types.js';

/**
 * Creates an accessible segmented tab bar with keyboard arrow navigation.
 * Standard WCAG role="tablist" and role="tab".
 */
export function createTabs(props: TabsProps): TabsInstance {
  const nav = document.createElement('nav');
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', props.ariaLabel ?? 'Navigation Tabs');
  nav.classList.add('zuari-tabs');

  const initialId = typeof props.activeId === 'object' && props.activeId !== null && 'value' in props.activeId
    ? props.activeId.value
    : props.activeId ?? props.items[0]?.id ?? '';

  const activeSignal = typeof props.activeId === 'object' && props.activeId !== null && 'value' in props.activeId
    ? props.activeId
    : signal(initialId);

  const tabButtons = new Map<string, HTMLButtonElement>();
  const cleanups: CleanupFn[] = [];

  props.items.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.id = `zuari-tab-${item.id}`;

    if (item.icon) {
      btn.appendChild(item.icon);
    }
    if (item.label) {
      const span = document.createElement('span');
      span.textContent = item.label;
      btn.appendChild(span);
    }

    const select = () => {
      activeSignal.value = item.id;
      props.onChange?.(item.id);
    };

    btn.addEventListener('click', select);
    cleanups.push(() => btn.removeEventListener('click', select));

    // Keyboard roving index
    const handleKey = (e: KeyboardEvent) => {
      let targetIndex = -1;
      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % props.items.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + props.items.length) % props.items.length;
      }
      if (targetIndex !== -1) {
        e.preventDefault();
        const targetItem = props.items[targetIndex];
        if (targetItem) {
          activeSignal.value = targetItem.id;
          props.onChange?.(targetItem.id);
          tabButtons.get(targetItem.id)?.focus();
        }
      }
    };
    btn.addEventListener('keydown', handleKey);
    cleanups.push(() => btn.removeEventListener('keydown', handleKey));

    tabButtons.set(item.id, btn);
    nav.appendChild(btn);
  });

  const disposeEffect = effect(() => {
    tabButtons.forEach((btn, id) => {
      const isSelected = activeSignal.value === id;
      btn.setAttribute('aria-selected', String(isSelected));
      btn.tabIndex = isSelected ? 0 : -1;
    });
  });
  cleanups.push(disposeEffect);

  return {
    element: nav,
    activeId: activeSignal,
    setActive: (id: string) => {
      activeSignal.value = id;
      props.onChange?.(id);
    },
    destroy: () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    }
  };
}
