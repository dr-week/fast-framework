import { effect, signal, type Signal } from '@zuari/signals';
import { createButton, type ButtonInstance } from '../button/index.js';
import type { SelectionBarInstance, SelectionBarProps } from './types.js';

/**
 * Creates an optional floating action bar for contextual actions on a selection.
 * The selection model and action behavior remain owned by the consuming application.
 */
export function createSelectionBar(props: SelectionBarProps): SelectionBarInstance {
  const count = isSignal(props.selectedCount) ? props.selectedCount : signal(props.selectedCount);
  const element = document.createElement('div');
  element.className = 'zuari-selection-bar';
  element.setAttribute('role', 'region');
  element.setAttribute('aria-label', props.ariaLabel ?? 'Selection actions');
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('inert', '');
  element.dataset.visible = 'false';

  const status = document.createElement('span');
  status.className = 'zuari-selection-bar__count';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  element.appendChild(status);

  const actions = document.createElement('div');
  actions.className = 'zuari-selection-bar__actions';
  const buttons: ButtonInstance[] = [];

  for (const action of props.actions) {
    const button = createButton({
      label: action.label,
      variant: action.variant ?? 'secondary',
      disabled: action.disabled,
      icon: action.icon,
      onClick: action.onClick
    });
    button.element.dataset.selectionAction = action.id;
    buttons.push(button);
    actions.appendChild(button.element);
  }
  element.appendChild(actions);

  if (props.onClear) {
    const clear = createButton({
      label: 'Clear selection',
      variant: 'ghost',
      ariaLabel: 'Clear selection',
      onClick: () => {
        count.value = 0;
        props.onClear?.();
      }
    });
    clear.element.classList.add('zuari-selection-bar__clear');
    buttons.push(clear);
    element.appendChild(clear.element);
  }

  const dispose = effect(() => {
    const value = Math.max(0, Math.floor(Number(count.value) || 0));
    const visible = value > 0;
    status.textContent = `${value} ${props.selectedLabel ?? 'selected'}`;
    element.dataset.visible = String(visible);
    element.setAttribute('aria-hidden', String(!visible));
    if (visible) element.removeAttribute('inert');
    else element.setAttribute('inert', '');
  });

  return {
    element,
    selectedCount: count,
    setSelectedCount: (value) => {
      count.value = Math.max(0, Math.floor(Number(value) || 0));
    },
    destroy: () => {
      dispose();
      for (const button of buttons) button.destroy();
    }
  };
}

function isSignal(value: number | Signal<number>): value is Signal<number> {
  return typeof value === 'object' && value !== null && 'value' in value;
}

export * from './types.js';
