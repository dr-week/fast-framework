import type { Signal } from '@zuari/signals';

export interface SliderProps {
  value?: Signal<number> | number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  label?: string | undefined;
  onChange?: ((value: number) => void) | undefined;
  disabled?: boolean | undefined;
}

export interface SliderInstance {
  containerElement: HTMLDivElement;
  inputElement: HTMLInputElement;
  value: Signal<number>;
  setValue: (value: number) => void;
  destroy: () => void;
}
