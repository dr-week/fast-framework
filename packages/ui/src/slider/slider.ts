import { signal, effect, type CleanupFn } from '@zuari/signals';
import type { SliderProps, SliderInstance } from './types.js';

/**
 * Creates an accessible, tactile slider component.
 * Synchronizes with fine-grained reactive signals and native range input.
 */
export function createSlider(props: SliderProps = {}): SliderInstance {
  const container = document.createElement('div');
  container.classList.add('zuari-slider');

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(props.min ?? 0);
  input.max = String(props.max ?? 100);
  input.step = String(props.step ?? 1);
  if (props.label) {
    input.setAttribute('aria-label', props.label);
  }
  if (props.disabled) {
    input.disabled = true;
  }

  container.appendChild(input);

  const valueSignal = typeof props.value === 'object' && props.value !== null && 'value' in props.value
    ? props.value
    : signal(Number(props.value ?? props.min ?? 0));

  const handleInput = (e: Event) => {
    const val = Number((e.target as HTMLInputElement).value);
    valueSignal.value = val;
    props.onChange?.(val);
  };

  input.addEventListener('input', handleInput);

  const disposeEffect = effect(() => {
    input.value = String(valueSignal.value);
  });

  const destroy: CleanupFn = () => {
    disposeEffect();
    input.removeEventListener('input', handleInput);
  };

  return {
    containerElement: container,
    inputElement: input,
    value: valueSignal,
    setValue: (val: number) => {
      valueSignal.value = val;
      input.value = String(val);
      props.onChange?.(val);
    },
    destroy
  };
}
