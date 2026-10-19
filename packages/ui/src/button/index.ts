import { signal, effect, type CleanupFn } from '@zuari/signals';
import type { ButtonProps, ButtonInstance, ButtonVariant } from './types.js';

export function createButton(props: ButtonProps = {}): ButtonInstance {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('zuari-btn');
  if (props.ariaLabel) btn.setAttribute('aria-label', props.ariaLabel);

  const size = props.size ?? 'md';
  btn.setAttribute('data-size', size);

  const variant = typeof props.variant === 'object' && props.variant !== null && 'value' in props.variant
    ? props.variant
    : signal<ButtonVariant>((props.variant as ButtonVariant) ?? 'primary');

  const disabled = typeof props.disabled === 'object' && props.disabled !== null && 'value' in props.disabled
    ? props.disabled
    : signal(Boolean(props.disabled));

  const loading = typeof props.loading === 'object' && props.loading !== null && 'value' in props.loading
    ? props.loading
    : signal(Boolean(props.loading));

  if (props.icon) {
    const iconWrapper = document.createElement('span');
    iconWrapper.classList.add('zuari-btn-icon');
    iconWrapper.appendChild(props.icon);
    btn.appendChild(iconWrapper);
  }

  const labelSpan = document.createElement('span');
  labelSpan.classList.add('zuari-btn-label');
  btn.appendChild(labelSpan);

  const handleClick = (e: MouseEvent) => {
    if (disabled.value || loading.value) {
      e.preventDefault();
      return;
    }
    props.onClick?.(e);
  };
  btn.addEventListener('click', handleClick);

  const dispose = effect(() => {
    btn.setAttribute('data-variant', variant.value);
    btn.disabled = disabled.value || loading.value;
    btn.setAttribute('aria-disabled', String(disabled.value || loading.value));
    btn.setAttribute('data-loading', String(loading.value));

    if (typeof props.label === 'object' && props.label !== null && 'value' in props.label) {
      labelSpan.textContent = props.label.value;
    } else if (props.label) {
      labelSpan.textContent = String(props.label);
    }
  });

  const destroy: CleanupFn = () => {
    dispose();
    btn.removeEventListener('click', handleClick);
  };

  return {
    element: btn,
    disabled,
    loading,
    variant,
    destroy
  };
}

export * from './types.js';
