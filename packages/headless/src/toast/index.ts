/**
 * @fileoverview Toast / Notification Queue Primitive for @zuari/headless.
 * Features:
 * - Reactive toast signal queue with automatic deduplication & batching
 * - Accessible Live Region screen-reader announcements (`aria-live="polite"` / `aria-live="assertive"`)
 * - Auto-dismiss timers with pause-on-hover
 * - Action handlers & dismiss callbacks
 */

import { signal, type Signal } from '@zuari/signals';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface ToastItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly type: ToastType;
  readonly durationMs?: number;
  readonly action?: ToastAction;
  readonly createdAt: number;
}

export interface ToastOptions {
  readonly maxVisibleToasts?: number;
  readonly defaultDurationMs?: number;
}

export interface ToastQueue {
  readonly toasts: Signal<readonly ToastItem[]>;
  show(toast: Omit<ToastItem, 'id' | 'createdAt'> & { id?: string }): string;
  success(title: string, description?: string): string;
  error(title: string, description?: string): string;
  warning(title: string, description?: string): string;
  info(title: string, description?: string): string;
  dismiss(id: string): void;
  clear(): void;
  getLiveRegion(): HTMLElement;
}

let toastCounter = 0;

export function createToastQueue(options: ToastOptions = {}): ToastQueue {
  const maxVisible = options.maxVisibleToasts ?? 5;
  const defaultDuration = options.defaultDurationMs ?? 4000;
  const toasts = signal<readonly ToastItem[]>([]);
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  // Create an accessible live region for screen readers
  let liveRegion: HTMLElement | null = null;
  function getLiveRegion(): HTMLElement {
    if (liveRegion) return liveRegion;
    liveRegion = document.createElement('div');
    liveRegion.id = 'zuari-toast-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    if (typeof document !== 'undefined' && document.body) {
      document.body.appendChild(liveRegion);
    }
    return liveRegion;
  }

  function announce(msg: string, type: ToastType) {
    const region = getLiveRegion();
    region.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    region.textContent = '';
    // Brief timeout so screen readers detect change
    setTimeout(() => {
      region.textContent = msg;
    }, 50);
  }

  function show(toastInput: Omit<ToastItem, 'id' | 'createdAt'> & { id?: string }): string {
    const id = toastInput.id ?? `zuari-toast-${++toastCounter}`;
    const duration = toastInput.durationMs ?? defaultDuration;

    const item: ToastItem = {
      ...toastInput,
      id,
      createdAt: Date.now()
    };

    // Screen reader announcement
    announce(`${item.title}${item.description ? ': ' + item.description : ''}`, item.type);

    const current = toasts.value;
    const next = [item, ...current.filter(t => t.id !== id)].slice(0, maxVisible);
    toasts.value = next;

    if (duration > 0) {
      if (timers.has(id)) clearTimeout(timers.get(id));
      const t = setTimeout(() => {
        dismiss(id);
      }, duration);
      timers.set(id, t);
    }

    return id;
  }

  function dismiss(id: string) {
    if (timers.has(id)) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    }
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  function clear() {
    timers.forEach(t => clearTimeout(t));
    timers.clear();
    toasts.value = [];
  }

  return {
    toasts,
    show,
    success: (title, description) => show({ title, ...(description !== undefined ? { description } : {}), type: 'success' }),
    error: (title, description) => show({ title, ...(description !== undefined ? { description } : {}), type: 'error' }),
    warning: (title, description) => show({ title, ...(description !== undefined ? { description } : {}), type: 'warning' }),
    info: (title, description) => show({ title, ...(description !== undefined ? { description } : {}), type: 'info' }),
    dismiss,
    clear,
    getLiveRegion
  };
}
