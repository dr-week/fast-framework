import { describe, it, expect, vi } from 'vitest';
import {
  createDropdownMenu,
  createContextMenu,
  createCombobox,
  createToastQueue,
  createVirtualList,
  createField,
  createForm
} from './index.js';

describe('@zuari/headless Suite Primitives', () => {
  describe('DropdownMenu', () => {
    it('creates accessible dropdown menu with items and roving focus', () => {
      const selectSpy = vi.fn();
      const menu = createDropdownMenu({
        items: [
          { id: 'cut', label: 'Cut', onSelect: selectSpy },
          { id: 'copy', label: 'Copy', disabled: true },
          { id: 'paste', label: 'Paste' }
        ]
      });

      expect(menu.menuElement.getAttribute('role')).toBe('menu');
      expect(menu.triggerElement.getAttribute('aria-haspopup')).toBe('menu');
      expect(menu.isOpen.value).toBe(false);

      // Open menu
      menu.open();
      expect(menu.isOpen.value).toBe(true);
      expect(menu.triggerElement.getAttribute('aria-expanded')).toBe('true');
      expect(menu.activeIndex.value).toBe(0);

      // Keyboard arrow down skips disabled items
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      menu.menuElement.dispatchEvent(downEvent);
      // Since item 1 is disabled, skips to item 2
      expect(menu.activeIndex.value).toBe(2);

      // Keyboard enter selects active item
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      menu.menuElement.dispatchEvent(enterEvent);
      expect(menu.isOpen.value).toBe(false);

      menu.destroy();
    });

    it('creates context menu and triggers on contextmenu event', () => {
      const target = document.createElement('div');
      const actionSpy = vi.fn();
      const contextMenu = createContextMenu({
        items: [
          { id: 'inspect', label: 'Inspect Element', onSelect: actionSpy }
        ]
      });

      const cleanup = contextMenu.attach(target);
      expect(contextMenu.isOpen.value).toBe(false);

      const ctxEvt = new MouseEvent('contextmenu', { clientX: 150, clientY: 250 });
      target.dispatchEvent(ctxEvt);

      expect(contextMenu.isOpen.value).toBe(true);
      expect(contextMenu.menuElement.style.left).toBe('150px');
      expect(contextMenu.menuElement.style.top).toBe('250px');

      contextMenu.close();
      expect(contextMenu.isOpen.value).toBe(false);

      cleanup();
      contextMenu.destroy();
    });
  });

  describe('Combobox', () => {
    it('implements ARIA 1.2 combobox pattern with filtering and roving selection', () => {
      const selectSpy = vi.fn();
      const cb = createCombobox({
        items: [
          { id: 'apple', label: 'Apple', value: 'a' },
          { id: 'banana', label: 'Banana', value: 'b' },
          { id: 'berry', label: 'Blueberry', value: 'bb' }
        ],
        onSelect: selectSpy
      });

      expect(cb.inputElement.getAttribute('role')).toBe('combobox');
      expect(cb.inputElement.getAttribute('aria-autocomplete')).toBe('list');
      expect(cb.listboxElement.getAttribute('role')).toBe('listbox');

      cb.inputElement.dispatchEvent(new Event('focus'));
      expect(cb.isOpen.value).toBe(true);
      expect(cb.filteredItems.value.length).toBe(3);

      // Filter query
      cb.inputElement.value = 'blue';
      cb.inputElement.dispatchEvent(new Event('input'));
      expect(cb.filteredItems.value.length).toBe(1);
      expect(cb.filteredItems.value[0]?.id).toBe('berry');

      // Select with enter
      cb.inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      cb.inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(selectSpy).toHaveBeenCalledWith({ id: 'berry', label: 'Blueberry', value: 'bb' });
      expect(cb.selectedItem.value?.id).toBe('berry');
      expect(cb.isOpen.value).toBe(false);

      cb.destroy();
    });
  });

  describe('ToastQueue', () => {
    it('enqueues toasts and announces via live region', () => {
      const queue = createToastQueue({ maxVisibleToasts: 3 });
      expect(queue.toasts.value.length).toBe(0);

      const id1 = queue.success('Deployment complete', 'All 25 nodes ready');
      expect(queue.toasts.value.length).toBe(1);
      expect(queue.toasts.value[0]?.id).toBe(id1);

      const liveRegion = queue.getLiveRegion();
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');

      queue.error('Kernel Fault', 'Memory boundary reached');
      expect(queue.toasts.value.length).toBe(2);

      queue.dismiss(id1);
      expect(queue.toasts.value.length).toBe(1);

      queue.clear();
      expect(queue.toasts.value.length).toBe(0);
    });
  });

  describe('VirtualList', () => {
    it('virtualizes 10,000 items with overscan windowing', () => {
      const vl = createVirtualList({
        count: 10000,
        itemHeight: 40,
        viewportHeight: 400,
        overscan: 2
      });

      expect(vl.totalHeight.value).toBe(400000);
      expect(vl.visibleItems.value.length).toBeGreaterThan(0);
      expect(vl.visibleItems.value[0]?.index).toBe(0);

      // Scroll down
      vl.scrollToIndex(500);
      expect(vl.scrollTop.value).toBe(500 * 40);
      expect(vl.visibleItems.value[0]?.index).toBeGreaterThanOrEqual(498);

      vl.destroy();
    });
  });

  describe('Form Validation & State Machine', () => {
    it('manages field state machine with validation and HTML5 attribute binding', async () => {
      const field = createField<string>({
        initial: '',
        validator: (v) => (!v ? 'Required field' : null)
      });

      const input = document.createElement('input');
      const cleanup = field.attach(input);

      expect(field.isValid.value).toBe(true);
      expect(field.isDirty.value).toBe(false);
      expect(field.isTouched.value).toBe(false);
      expect(input.getAttribute('data-valid')).toBe('true');

      // Blur to trigger validation
      input.dispatchEvent(new Event('blur'));
      expect(field.isTouched.value).toBe(true);
      expect(input.getAttribute('data-touched')).toBe('true');

      // Await validation cycle
      await field.validate();
      expect(field.error.value).toBe('Required field');
      expect(field.isValid.value).toBe(false);
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('data-invalid')).toBe('true');

      // Type valid input
      input.value = 'john@dangerlabs.io';
      input.dispatchEvent(new Event('input'));
      expect(field.isDirty.value).toBe(true);
      expect(input.getAttribute('data-dirty')).toBe('true');

      // Re-validate
      const valid = await field.validate();
      expect(valid).toBe(true);
      expect(field.error.value).toBe(null);
      expect(field.isValid.value).toBe(true);

      cleanup();
    });

    it('coordinates form submit and validates whole form with Standard Schema compatibility', async () => {
      const submitSpy = vi.fn();
      const form = createForm({
        initialValues: {
          username: '',
          email: ''
        },
        validators: {
          username: (u) => (u.length < 3 ? 'Min 3 chars' : null),
          email: (e) => (!e.includes('@') ? 'Invalid email' : null)
        }
      });

      const handler = form.handleSubmit(submitSpy);
      await handler();

      // Submit failed because fields are empty
      expect(submitSpy).not.toHaveBeenCalled();
      expect(form.fields.username.error.value).toBe('Min 3 chars');
      expect(form.fields.email.error.value).toBe('Invalid email');
      expect(form.isValid.value).toBe(false);

      // Populate valid fields
      form.fields.username.setValue('danger_agent');
      form.fields.email.setValue('agent@dangerlabs.io');

      await handler();
      expect(submitSpy).toHaveBeenCalledWith({
        username: 'danger_agent',
        email: 'agent@dangerlabs.io'
      });
      expect(form.submitCount.value).toBe(2);
    });
  });
});
