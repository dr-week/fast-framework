import { describe, it, expect, vi } from 'vitest';
import { signal } from '@zuari/signals';
import { createDialog } from './index.js';
import { applyReadingFlow } from '../invoker.js';

describe('@zuari/headless createDialog & Invoker Commands', () => {
  it('creates an accessible HTMLDialogElement with initial closed state', () => {
    const dialog = createDialog();
    expect(dialog.dialogElement.tagName.toLowerCase()).toBe('dialog');
    expect(dialog.dialogElement.getAttribute('role')).toBe('dialog');
    expect(dialog.dialogElement.getAttribute('aria-modal')).toBe('true');
    expect(dialog.isOpen.value).toBe(false);
  });

  it('controls open and close state imperatively', () => {
    const dialog = createDialog();
    // Happy-dom polyfill mocks for dialog methods if needed
    dialog.dialogElement.showModal = vi.fn(() => {
      dialog.dialogElement.setAttribute('open', '');
    });
    dialog.dialogElement.close = vi.fn(() => {
      dialog.dialogElement.removeAttribute('open');
    });

    dialog.open();
    expect(dialog.isOpen.value).toBe(true);
    expect(dialog.dialogElement.showModal).toHaveBeenCalledTimes(1);

    dialog.close();
    expect(dialog.isOpen.value).toBe(false);
    expect(dialog.dialogElement.close).toHaveBeenCalledTimes(1);
  });

  it('synchronizes with an external reactive signal', () => {
    const isOpenSignal = signal(false);
    const dialog = createDialog({ isOpen: isOpenSignal });

    dialog.dialogElement.showModal = vi.fn(() => {
      dialog.dialogElement.open = true;
    });
    dialog.dialogElement.close = vi.fn(() => {
      dialog.dialogElement.open = false;
    });

    isOpenSignal.value = true;
    expect(dialog.dialogElement.showModal).toHaveBeenCalledTimes(1);

    isOpenSignal.value = false;
    expect(dialog.dialogElement.close).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpen and onClose callback hooks', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const dialog = createDialog({ onOpen, onClose });

    dialog.dialogElement.showModal = vi.fn(() => {
      dialog.dialogElement.open = true;
    });
    dialog.dialogElement.close = vi.fn(() => {
      dialog.dialogElement.open = false;
    });

    dialog.open();
    expect(onOpen).toHaveBeenCalledTimes(1);

    dialog.close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('binds HTML Invoker Commands (<button commandfor command="show-modal">) and applies CSS reading-flow', () => {
    const dialog = createDialog({ id: 'my-dialog' });
    dialog.dialogElement.showModal = vi.fn(() => {
      dialog.dialogElement.open = true;
    });

    const btn = document.createElement('button');
    dialog.bindInvoker(btn, 'show-modal');

    expect(btn.getAttribute('commandfor')).toBe('my-dialog');
    expect(btn.getAttribute('command')).toBe('show-modal');

    btn.click();
    expect(dialog.isOpen.value).toBe(true);
    expect(dialog.dialogElement.showModal).toHaveBeenCalledTimes(1);

    const grid = document.createElement('div');
    applyReadingFlow(grid, 'grid-rows');
    expect(grid.getAttribute('data-reading-flow')).toBe('grid-rows');
    expect(grid.style.getPropertyValue('reading-flow')).toBe('grid-rows');
  });
});

