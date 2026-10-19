/**
 * @fileoverview Form Validation & State Machine Primitives for @zuari/headless.
 * Features:
 * - Two-way reactive field binding (`bindField`, `bindValue`)
 * - State tracking: pristine, dirty, touched, focused, valid, invalid
 * - Automatic mapping to HTML5 pseudo-classes / data attributes (`:user-valid`, `:user-invalid`, `data-touched`, `data-dirty`)
 * - Standard Schema / Zod / TypeSpec / custom validator interoperability (`~standard` schema spec)
 * - Accessible error messaging (`aria-invalid`, `aria-describedby`, `aria-errormessage`)
 */

import { signal, computed, effect, type Signal, type Computed, type CleanupFn } from '@zuari/signals';

/**
 * Standard Schema Interface Specification (v1) compatible with Zod, Valibot, ArkType, TypeSpec.
 */
export interface StandardSchemaV1<TInput = unknown, TOutput = TInput> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown
    ) => { value: TOutput } | { issues: ReadonlyArray<{ message: string; path?: ReadonlyArray<PropertyKey> }> } | Promise<{ value: TOutput } | { issues: ReadonlyArray<{ message: string; path?: ReadonlyArray<PropertyKey> }> }>;
  };
}

export type ValidatorFn<T> = (value: T) => string | null | undefined | Promise<string | null | undefined>;

export type FieldValidator<T> = ValidatorFn<T> | StandardSchemaV1<T>;

export interface FieldState<T> {
  readonly value: Signal<T>;
  readonly error: Signal<string | null>;
  readonly isDirty: Signal<boolean>;
  readonly isTouched: Signal<boolean>;
  readonly isFocused: Signal<boolean>;
  readonly isValidating: Signal<boolean>;
  readonly isValid: Computed<boolean>;
  readonly isInvalid: Computed<boolean>;
  setValue(val: T): void;
  setError(err: string | null): void;
  validate(): Promise<boolean>;
  reset(initialValue?: T): void;
  attach(inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): CleanupFn;
}

export interface FieldOptions<T> {
  readonly initial: T;
  readonly validator?: FieldValidator<T>;
  readonly validateOn?: 'input' | 'blur' | 'change' | 'submit';
}

export interface FormState<TValues extends Record<string, unknown>> {
  readonly fields: { [K in keyof TValues]: FieldState<TValues[K]> };
  readonly isDirty: Computed<boolean>;
  readonly isTouched: Computed<boolean>;
  readonly isValid: Computed<boolean>;
  readonly isSubmitting: Signal<boolean>;
  readonly submitCount: Signal<number>;
  getValues(): TValues;
  validate(): Promise<boolean>;
  reset(): void;
  handleSubmit(onSubmit: (values: TValues) => void | Promise<void>): (e?: Event) => Promise<void>;
  attachForm(formElement: HTMLFormElement, onSubmit: (values: TValues) => void | Promise<void>): CleanupFn;
}

export interface FormOptions<TValues extends Record<string, unknown>> {
  readonly initialValues: TValues;
  readonly validators?: { [K in keyof TValues]?: FieldValidator<TValues[K]> };
  readonly schema?: StandardSchemaV1<TValues>;
}

let formCounter = 0;

/**
 * Creates an individual reactive form field state machine.
 */
export function createField<T>(options: FieldOptions<T>): FieldState<T> {
  const initialValue = options.initial;
  const value = signal<T>(initialValue);
  const error = signal<string | null>(null);
  const isDirty = signal<boolean>(false);
  const isTouched = signal<boolean>(false);
  const isFocused = signal<boolean>(false);
  const isValidating = signal<boolean>(false);
  const validateOn = options.validateOn ?? 'blur';

  const isValid = computed<boolean>(() => error.value === null);
  const isInvalid = computed<boolean>(() => error.value !== null);

  async function runValidation(val: T): Promise<string | null> {
    if (!options.validator) return null;

    // Check Standard Schema spec
    if (typeof options.validator === 'object' && '~standard' in options.validator) {
      const standardResult = await options.validator['~standard'].validate(val);
      if ('issues' in standardResult && standardResult.issues.length > 0) {
        return standardResult.issues[0]?.message ?? 'Invalid field';
      }
      return null;
    }

    if (typeof options.validator === 'function') {
      const res = await options.validator(val);
      return res ?? null;
    }

    return null;
  }

  async function validate(): Promise<boolean> {
    isValidating.value = true;
    try {
      const errMsg = await runValidation(value.value);
      error.value = errMsg;
      return errMsg === null;
    } finally {
      isValidating.value = false;
    }
  }

  function setValue(val: T) {
    value.value = val;
    isDirty.value = val !== initialValue;
    if (validateOn === 'input') {
      validate();
    }
  }

  function setError(err: string | null) {
    error.value = err;
  }

  function reset(newInitial?: T) {
    const nextInit = newInitial !== undefined ? newInitial : initialValue;
    value.value = nextInit;
    error.value = null;
    isDirty.value = false;
    isTouched.value = false;
    isFocused.value = false;
    isValidating.value = false;
  }

  function attach(inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): CleanupFn {
    const errorId = `zuari-err-${++formCounter}`;

    // Initial sync
    if ('checked' in inputElement && typeof initialValue === 'boolean') {
      (inputElement as HTMLInputElement).checked = initialValue;
    } else {
      inputElement.value = String(initialValue ?? '');
    }

    const onInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const val = ('checked' in target && target.type === 'checkbox')
        ? (target.checked as unknown as T)
        : (target.value as unknown as T);
      setValue(val);
    };

    const onFocus = () => {
      isFocused.value = true;
    };

    const onBlur = () => {
      isFocused.value = false;
      isTouched.value = true;
      inputElement.setAttribute('data-touched', 'true');
      if (validateOn === 'blur' || validateOn === 'input') {
        validate();
      }
    };

    const onChange = () => {
      if (validateOn === 'change') {
        validate();
      }
    };

    inputElement.addEventListener('input', onInput);
    inputElement.addEventListener('focus', onFocus);
    inputElement.addEventListener('blur', onBlur);
    inputElement.addEventListener('change', onChange);

    // Sync state to ARIA and DOM attributes
    const disposeEffect = effect(() => {
      const hasErr = error.value !== null;
      const touched = isTouched.value;

      inputElement.setAttribute('aria-invalid', String(hasErr));
      if (hasErr) {
        inputElement.setAttribute('aria-errormessage', errorId);
        inputElement.setAttribute('data-invalid', 'true');
        inputElement.removeAttribute('data-valid');
      } else {
        inputElement.removeAttribute('aria-errormessage');
        inputElement.removeAttribute('data-invalid');
        inputElement.setAttribute('data-valid', 'true');
      }

      if (touched) {
        inputElement.setAttribute('data-touched', 'true');
      } else {
        inputElement.removeAttribute('data-touched');
      }

      if (isDirty.value) {
        inputElement.setAttribute('data-dirty', 'true');
      } else {
        inputElement.removeAttribute('data-dirty');
      }
    });

    return () => {
      inputElement.removeEventListener('input', onInput);
      inputElement.removeEventListener('focus', onFocus);
      inputElement.removeEventListener('blur', onBlur);
      inputElement.removeEventListener('change', onChange);
      disposeEffect();
    };
  }

  return {
    value,
    error,
    isDirty,
    isTouched,
    isFocused,
    isValidating,
    isValid,
    isInvalid,
    setValue,
    setError,
    validate,
    reset,
    attach
  };
}

/**
 * Creates a coordinated form state machine supporting multiple fields and whole-form schema validation.
 */
export function createForm<TValues extends Record<string, unknown>>(
  options: FormOptions<TValues>
): FormState<TValues> {
  const fields = {} as { [K in keyof TValues]: FieldState<TValues[K]> };
  const fieldKeys = Object.keys(options.initialValues) as Array<keyof TValues>;

  for (const key of fieldKeys) {
    const initial = options.initialValues[key];
    const validator = options.validators?.[key];
    fields[key] = createField<TValues[typeof key]>({
      initial: initial as TValues[typeof key],
      ...(validator !== undefined ? { validator: validator as FieldValidator<TValues[typeof key]> } : {})
    });
  }

  const isDirty = computed<boolean>(() =>
    fieldKeys.some(k => fields[k].isDirty.value)
  );

  const isTouched = computed<boolean>(() =>
    fieldKeys.some(k => fields[k].isTouched.value)
  );

  const isValid = computed<boolean>(() =>
    fieldKeys.every(k => fields[k].isValid.value)
  );

  const isSubmitting = signal<boolean>(false);
  const submitCount = signal<number>(0);

  function getValues(): TValues {
    const vals = {} as TValues;
    for (const key of fieldKeys) {
      vals[key] = fields[key].value.value;
    }
    return vals;
  }

  async function validate(): Promise<boolean> {
    const results = await Promise.all(fieldKeys.map(k => fields[k].validate()));
    let allValid = results.every(Boolean);

    // Form-level Standard Schema validation
    if (options.schema && typeof options.schema === 'object' && '~standard' in options.schema) {
      const vals = getValues();
      const schemaRes = await options.schema['~standard'].validate(vals);
      if ('issues' in schemaRes && schemaRes.issues.length > 0) {
        allValid = false;
        for (const issue of schemaRes.issues) {
          const pathKey = issue.path?.[0] as keyof TValues | undefined;
          if (pathKey && fields[pathKey]) {
            fields[pathKey].setError(issue.message);
          }
        }
      }
    }

    return allValid;
  }

  function reset() {
    for (const key of fieldKeys) {
      fields[key].reset();
    }
    isSubmitting.value = false;
    submitCount.value = 0;
  }

  function handleSubmit(onSubmit: (values: TValues) => void | Promise<void>): (e?: Event) => Promise<void> {
    return async (e?: Event) => {
      if (e) e.preventDefault();
      submitCount.value++;
      isSubmitting.value = true;

      try {
        const valid = await validate();
        if (valid) {
          await onSubmit(getValues());
        }
      } finally {
        isSubmitting.value = false;
      }
    };
  }

  function attachForm(
    formElement: HTMLFormElement,
    onSubmit: (values: TValues) => void | Promise<void>
  ): CleanupFn {
    const handler = handleSubmit(onSubmit);
    formElement.addEventListener('submit', handler);
    return () => {
      formElement.removeEventListener('submit', handler);
    };
  }

  return {
    fields,
    isDirty,
    isTouched,
    isValid,
    isSubmitting,
    submitCount,
    getValues,
    validate,
    reset,
    handleSubmit,
    attachForm
  };
}
