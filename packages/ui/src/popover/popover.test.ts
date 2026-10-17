import { describe, it, expect, vi } from 'vitest';
import { createPopover } from './index.js';

describe('@zuari/ui createPopover', () => {
  it('creates an HTML element with popover auto and anchor positioning', () => {
    const pop = createPopover();
    expect(pop.element.getAttribute('popover')).toBe('auto');
    expect(pop.element.getAttribute('role')).toBe('region');
    expect(pop.element.style.getPropertyValue('position-anchor')).not.toBe('');
    expect(pop.isOpen.value).toBe(false);
  });

  it('controls popover visibility via open, close, and toggle', () => {
    const pop = createPopover();
    pop.element.showPopover = vi.fn();
    pop.element.hidePopover = vi.fn();

    pop.open();
    expect(pop.isOpen.value).toBe(true);

    pop.close();
    expect(pop.isOpen.value).toBe(false);

    pop.toggle();
    expect(pop.isOpen.value).toBe(true);
  });

  it('supports HTML Invoker Commands via bindInvoker (<button commandfor command="toggle-popover">)', () => {
    const pop = createPopover({ id: 'menu-popover' });
    pop.element.showPopover = vi.fn();
    pop.element.hidePopover = vi.fn();

    const trigger = document.createElement('button');
    pop.bindInvoker(trigger, 'toggle-popover');

    expect(trigger.getAttribute('commandfor')).toBe('menu-popover');
    expect(trigger.getAttribute('command')).toBe('toggle-popover');

    trigger.click();
    expect(pop.isOpen.value).toBe(true);
  });
});

