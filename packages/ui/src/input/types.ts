import type { Signal, CleanupFn } from '@zuari/signals';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'url';

export interface TextInputProps {
  value?: string | Signal<string>;
  placeholder?: string;
  type?: InputType;
  label?: string;
  error?: string | Signal<string | null>;
  disabled?: boolean | Signal<boolean>;
  onInput?: (val: string) => void;
  onChange?: (val: string) => void;
}

export interface TextInputInstance {
  container: HTMLDivElement;
  inputElement: HTMLInputElement;
  value: Signal<string>;
  error: Signal<string | null>;
  disabled: Signal<boolean>;
  setValue: (next: string) => void;
  destroy: CleanupFn;
}
