/**
 * @fileoverview @zuari/ui Drawer Component
 * Pre-styled, accessible, sliding drawer primitive for panels, menus, and inspector sheets.
 */

import { createDrawer } from '@zuari/headless';
import { type CleanupFn } from '@zuari/signals';
import type { UiDrawerOptions, UiDrawerComponent } from './types.js';

export function createUiDrawer(options: UiDrawerOptions = {}): UiDrawerComponent {
  const drawer = createDrawer({
    id: options.id,
    isOpen: options.isOpen,
    placement: options.placement ?? 'right',
    closeOnBackdropClick: options.closeOnBackdropClick ?? true,
    closeOnEscape: options.closeOnEscape ?? true,
    enableSwipeToClose: options.enableSwipeToClose ?? true,
    onOpen: options.onOpen,
    onClose: options.onClose
  });

  const dialog = drawer.drawerElement;
  dialog.classList.add('zuari-drawer');

  // Build clean drawer header, body, close action
  dialog.innerHTML = `
    <div class="zuari-drawer-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div>
        ${options.title ? `<h3 style="font-size:1.1rem;font-weight:600;margin:0;letter-spacing:0.02em;">${options.title}</h3>` : ''}
        ${options.description ? `<p style="font-size:0.8rem;color:oklch(65% 0.02 260);margin-top:4px;">${options.description}</p>` : ''}
      </div>
      <button type="button" class="zuari-drawer-close-btn" aria-label="Close Drawer" style="background:transparent;border:none;color:currentColor;cursor:pointer;padding:6px;border-radius:8px;display:grid;place-items:center;opacity:0.75;transition:opacity 140ms ease;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="zuari-drawer-content" style="overflow-y:auto;flex:1;max-height:calc(100vh - 100px);"></div>
  `;

  const closeBtn = dialog.querySelector<HTMLButtonElement>('.zuari-drawer-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      drawer.close();
    });
  }

  const contentContainer = dialog.querySelector<HTMLDivElement>('.zuari-drawer-content');
  if (contentContainer && options.content) {
    if (typeof options.content === 'string') {
      contentContainer.innerHTML = options.content;
    } else {
      contentContainer.appendChild(options.content);
    }
  }

  // Ensure drawer is placed in document.body
  if (typeof document !== 'undefined' && document.body && !dialog.parentElement) {
    document.body.appendChild(dialog);
  }

  const bindTrigger = (button: HTMLButtonElement): CleanupFn => {
    return drawer.bindInvoker(button, 'show-modal');
  };

  const destroy: CleanupFn = () => {
    drawer.destroy();
    if (dialog.parentElement) {
      dialog.parentElement.removeChild(dialog);
    }
  };

  return {
    element: dialog,
    isOpen: drawer.isOpen,
    placement: drawer.placement,
    open: drawer.open,
    close: drawer.close,
    toggle: drawer.toggle,
    bindTrigger,
    destroy
  };
}

export * from './types.js';
