import { signal, effect, type CleanupFn } from '@zuari/signals';
import type { TextInputProps, TextInputInstance } from './types.js';

export function createTextInput(props: TextInputProps = {}): TextInputInstance {
  const container = document.createElement('div');
  container.classList.add('zuari-input-group');

  if (props.label) {
    const lbl = document.createElement('label');
    lbl.classList.add('zuari-input-label');
    lbl.textContent = props.label;
    container.appendChild(lbl);
  }

  const input = document.createElement('input');
  input.type = props.type ?? 'text';
  input.classList.add('zuari-input');
  if (props.placeholder) input.placeholder = props.placeholder;

  const errorEl = document.createElement('span');
  errorEl.classList.add('zuari-input-error');
  container.appendChild(input);
  container.appendChild(errorEl);

  const value = typeof props.value === 'object' && props.value !== null && 'value' in props.value
    ? props.value
    : signal(props.value ?? '');

  const error = typeof props.error === 'object' && props.error !== null && 'value' in props.error
    ? props.error
    : signal<string | null>(props.error ?? null);

  const disabled = typeof props.disabled === 'object' && props.disabled !== null && 'value' in props.disabled
    ? props.disabled
    : signal(Boolean(props.disabled));

  const handleInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    value.value = val;
    props.onInput?.(val);
  };

  const handleChange = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    props.onChange?.(val);
  };

  input.addEventListener('input', handleInput);
  input.addEventListener('change', handleChange);

  const dispose = effect(() => {
    if (input.value !== value.value) {
      input.value = value.value;
    }
    input.disabled = disabled.value;
    const err = error.value;
    if (err) {
      container.setAttribute('data-invalid', 'true');
      errorEl.textContent = err;
      errorEl.style.display = 'block';
    } else {
      container.removeAttribute('data-invalid');
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  });

  const setValue = (next: string) => {
    value.value = next;
    input.value = next;
  };

  const destroy: CleanupFn = () => {
    dispose();
    input.removeEventListener('input', handleInput);
    input.removeEventListener('change', handleChange);
  };

  return {
    container,
    inputElement: input,
    value,
    error,
    disabled,
    setValue,
    destroy
  };
}

export * from './types.js';
