import { signal, effect, type CleanupFn } from '@zuari/signals';
import type { SwitchProps, SwitchInstance } from './types.js';

/**
 * Creates an accessible, tactile toggle switch element.
 * 100% accessible via role="switch" and aria-checked.
 */
export function createSwitch(props: SwitchProps = {}): SwitchInstance {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-label', props.label ?? 'Toggle Switch');
  btn.classList.add('zuari-switch');

  if (props.disabled) {
    btn.disabled = true;
  }

  const thumb = document.createElement('span');
  thumb.classList.add('zuari-switch-thumb');
  btn.appendChild(thumb);

  const isChecked = typeof props.checked === 'object' && props.checked !== null && 'value' in props.checked
    ? props.checked
    : signal(Boolean(props.checked));

  const toggle = () => {
    if (btn.disabled) return;
    isChecked.value = !isChecked.value;
    props.onChange?.(isChecked.value);
  };

  btn.addEventListener('click', toggle);

  const disposeEffect = effect(() => {
    btn.setAttribute('aria-checked', String(isChecked.value));
  });

  const destroy: CleanupFn = () => {
    disposeEffect();
    btn.removeEventListener('click', toggle);
  };

  return {
    element: btn,
    isChecked,
    toggle,
    destroy
  };
}
