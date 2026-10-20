import { html, render, repeat, type TemplateResult } from '@zuari/dom';
import { createToastQueue, type ToastQueue, type ToastItem, type ToastType } from '@zuari/headless';
import { signal } from '@zuari/signals';

export interface UiToastOptions {
  readonly position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  readonly maxVisibleToasts?: number;
  readonly defaultDurationMs?: number;
}

export interface UiToastInstance {
  readonly queue: ToastQueue;
  readonly container: HTMLElement;
  success(title: string, description?: string): string;
  error(title: string, description?: string): string;
  warning(title: string, description?: string): string;
  info(title: string, description?: string): string;
  dismiss(id: string): void;
  clear(): void;
  destroy(): void;
}

const typeStyles: Record<ToastType, { border: string; bg: string; icon: string; text: string }> = {
  success: {
    border: 'rgba(16, 185, 129, 0.3)',
    bg: 'rgba(16, 185, 129, 0.08)',
    icon: '✓',
    text: '#10b981'
  },
  error: {
    border: 'rgba(239, 68, 68, 0.3)',
    bg: 'rgba(239, 68, 68, 0.08)',
    icon: '✕',
    text: '#ef4444'
  },
  warning: {
    border: 'rgba(245, 158, 11, 0.3)',
    bg: 'rgba(245, 158, 11, 0.08)',
    icon: '⚠',
    text: '#f59e0b'
  },
  info: {
    border: 'rgba(59, 130, 246, 0.3)',
    bg: 'rgba(59, 130, 246, 0.08)',
    icon: 'ℹ',
    text: '#3b82f6'
  }
};

/**
 * Creates a ready-to-mount reactive Toast Container on the Ambient Plane.
 * Conforms to Zuari's zero-VDOM, high-FPS, accessible notification requirements.
 */
export function createUiToast(options: UiToastOptions = {}): UiToastInstance {
  const position = options.position ?? 'bottom-right';
  const queue = createToastQueue({
    maxVisibleToasts: options.maxVisibleToasts ?? 4,
    defaultDurationMs: options.defaultDurationMs ?? 4000
  });

  const container = document.createElement('div');
  container.className = `zuari-toast-container zuari-toast-${position}`;
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'Notifications');

  // Positioning styles
  const isTop = position.startsWith('top');
  const isCenter = position.endsWith('center');
  const isLeft = position.endsWith('left');

  Object.assign(container.style, {
    position: 'fixed',
    zIndex: '99999',
    display: 'flex',
    flexDirection: isTop ? 'column' : 'column-reverse',
    gap: '8px',
    padding: '16px',
    pointerEvents: 'none',
    maxWidth: '380px',
    width: '100%',
    boxSizing: 'border-box',
    ...(isTop ? { top: '0' } : { bottom: '0' }),
    ...(isCenter ? { left: '50%', transform: 'translateX(-50%)' } : isLeft ? { left: '0' } : { right: '0' })
  });

  const view = html`
    <div style="display: contents;">
      ${repeat(queue.toasts, (t: ToastItem) => t.id, (t: ToastItem) => {
        const style = typeStyles[t.type] || typeStyles.info;
        return html`
          <div
            id="${t.id}"
            class="zuari-toast-item"
            style="
              pointer-events: auto;
              background: var(--zuari-surface-elevated, #1a1a1f);
              border: 1px solid ${style.border};
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
              border-radius: 8px;
              padding: 10px 14px;
              display: flex;
              align-items: flex-start;
              gap: 10px;
              font-family: inherit;
              animation: zuari-toast-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
              transition: opacity 0.18s ease, transform 0.18s ease;
            "
          >
            <span style="color: ${style.text}; font-weight: 700; line-height: 1.3; font-size: 14px;">${style.icon}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; font-size: 13px; color: var(--zuari-text, #f0f0f5);">${t.title}</div>
              <div style="font-size: 12px; color: var(--zuari-text-muted, #9e9ea7); margin-top: 2px;">${t.description ?? ''}</div>
            </div>
            <button
              type="button"
              @click=${() => queue.dismiss(t.id)}
              style="
                background: transparent;
                border: none;
                cursor: pointer;
                color: var(--zuari-text-muted, #9e9ea7);
                font-size: 14px;
                line-height: 1;
                padding: 2px 4px;
                opacity: 0.7;
              "
              aria-label="Close notification"
            >×</button>
          </div>
        `;
      })}
    </div>
  `;

  const { destroy } = render(view, container);

  return {
    queue,
    container,
    success: (title, desc) => queue.success(title, desc),
    error: (title, desc) => queue.error(title, desc),
    warning: (title, desc) => queue.warning(title, desc),
    info: (title, desc) => queue.info(title, desc),
    dismiss: (id) => queue.dismiss(id),
    clear: () => queue.clear(),
    destroy: () => {
      destroy();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };
}
