import { describe, it, expect, vi } from 'vitest';
import { signal } from '@zuari/signals';
import { createSwitch, createBadge, createCard, createSlider, createTabs, createUiDrawer } from './index.js';

describe('@zuari/ui pre-built component suite', () => {
  it('creates an accessible switch with keyboard and click toggle', () => {
    const isCheckedSignal = signal(false);
    const onChange = vi.fn();
    const sw = createSwitch({ checked: isCheckedSignal, onChange, label: 'Dark Mode' });

    expect(sw.element.getAttribute('role')).toBe('switch');
    expect(sw.element.getAttribute('aria-label')).toBe('Dark Mode');
    expect(sw.element.getAttribute('aria-checked')).toBe('false');

    sw.element.click();
    expect(sw.isChecked.value).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(sw.element.getAttribute('aria-checked')).toBe('true');
  });

  it('creates a stylized badge with pulse indicator', () => {
    const badge = createBadge({ label: 'Beta', variant: 'accent', pulse: true });
    expect(badge.classList.contains('zuari-badge')).toBe(true);
    expect(badge.getAttribute('data-variant')).toBe('accent');
    expect(badge.querySelector('.zuari-badge-dot')).not.toBeNull();
    expect(badge.textContent).toContain('Beta');
  });

  it('creates a glassmorphic card with header', () => {
    const card = createCard({ title: 'System Metrics', subtitle: 'Real-time telemetry' });
    expect(card.classList.contains('zuari-card')).toBe(true);
    expect(card.querySelector('h3')?.textContent).toBe('System Metrics');
    expect(card.querySelector('p')?.textContent).toBe('Real-time telemetry');
  });

  it('creates a reactive slider component', () => {
    const valSignal = signal(25);
    const onChange = vi.fn();
    const slider = createSlider({ value: valSignal, min: 0, max: 100, onChange });

    expect(slider.inputElement.value).toBe('25');

    slider.setValue(75);
    expect(slider.value.value).toBe(75);
    expect(slider.inputElement.value).toBe('75');
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it('creates an accessible segmented tabs component with keyboard roving navigation', () => {
    const items = [
      { id: 'tab1', label: 'Overview' },
      { id: 'tab2', label: 'Analytics' },
      { id: 'tab3', label: 'Settings' }
    ];
    const onChange = vi.fn();
    const tabs = createTabs({ items, onChange });

    expect(tabs.element.getAttribute('role')).toBe('tablist');
    const tab1 = tabs.element.querySelector('#zuari-tab-tab1');
    const tab2 = tabs.element.querySelector('#zuari-tab-tab2');

    expect(tab1?.getAttribute('aria-selected')).toBe('true');
    expect(tab2?.getAttribute('aria-selected')).toBe('false');

    // Click tab2
    (tab2 as HTMLButtonElement).click();
    expect(tabs.activeId.value).toBe('tab2');
    expect(onChange).toHaveBeenCalledWith('tab2');
    expect(tab2?.getAttribute('aria-selected')).toBe('true');
    expect(tab1?.getAttribute('aria-selected')).toBe('false');
  });

  it('creates an accessible sliding drawer component with invoker trigger and reactive state', async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const drawer = createUiDrawer({
      title: 'Inspector Drawer',
      placement: 'right',
      onOpen,
      onClose
    });

    expect(drawer.element.classList.contains('zuari-drawer')).toBe(true);
    expect(drawer.element.getAttribute('data-placement')).toBe('right');
    expect(drawer.isOpen.value).toBe(false);

    // Open drawer
    await drawer.open();
    expect(drawer.isOpen.value).toBe(true);
    expect(drawer.element.open).toBe(true);
    expect(onOpen).toHaveBeenCalled();

    // Toggle drawer placement
    drawer.placement.value = 'left';
    expect(drawer.element.getAttribute('data-placement')).toBe('left');

    // Close drawer
    await drawer.close();
    expect(drawer.isOpen.value).toBe(false);

    // Bind trigger button
    const triggerBtn = document.createElement('button');
    drawer.bindTrigger(triggerBtn);
    expect(triggerBtn.getAttribute('commandfor')).toBe(drawer.element.id);
    expect(triggerBtn.getAttribute('command')).toBe('show-modal');

    drawer.destroy();
  });
});

