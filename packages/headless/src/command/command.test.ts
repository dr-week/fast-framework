import { describe, it, expect, vi } from 'vitest';
import { signal } from '@zuari/signals';
import { createCommandPalette, fuzzyFilter } from './index.js';
import type { CommandItem } from './types.js';

describe('@zuari/headless createCommandPalette', () => {
  const sampleItems: CommandItem[] = [
    { id: '1', title: 'Open Settings', onSelect: vi.fn() },
    { id: '2', title: 'Toggle Theme', onSelect: vi.fn() },
    { id: '3', title: 'Deploy Application', onSelect: vi.fn() }
  ];

  it('fuzzy filters items accurately based on substring and boundaries', () => {
    const matches1 = fuzzyFilter(sampleItems, 'set');
    expect(matches1).toHaveLength(1);
    expect(matches1[0]?.title).toBe('Open Settings');

    const matches2 = fuzzyFilter(sampleItems, 'theme');
    expect(matches2).toHaveLength(1);
    expect(matches2[0]?.title).toBe('Toggle Theme');

    const all = fuzzyFilter(sampleItems, '');
    expect(all).toHaveLength(3);
  });

  it('initializes with closed state and opens on open()', () => {
    const palette = createCommandPalette({ items: sampleItems });
    expect(palette.isOpen.value).toBe(false);

    palette.open();
    expect(palette.isOpen.value).toBe(true);
    expect(palette.query.value).toBe('');
    expect(palette.selectedIndex.value).toBe(0);
  });

  it('navigates through items with arrow keys', () => {
    const palette = createCommandPalette({ items: sampleItems });
    palette.open();

    const input = palette.inputElement;

    // Arrow down
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(palette.selectedIndex.value).toBe(1);

    // Arrow down again
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(palette.selectedIndex.value).toBe(2);

    // Loops around on next arrow down
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(palette.selectedIndex.value).toBe(0);

    // Arrow up loops to bottom
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(palette.selectedIndex.value).toBe(2);
  });

  it('executes the selected item action on Enter key', () => {
    const onSelectSpy = vi.fn();
    const items: CommandItem[] = [
      { id: 'a', title: 'Execute Alpha', onSelect: onSelectSpy }
    ];

    const palette = createCommandPalette({ items });
    palette.open();

    palette.inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onSelectSpy).toHaveBeenCalledTimes(1);
    expect(palette.isOpen.value).toBe(false); // Closes on selection
  });

  it('closes on Escape key', () => {
    const palette = createCommandPalette({ items: sampleItems });
    palette.open();
    expect(palette.isOpen.value).toBe(true);

    palette.inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(palette.isOpen.value).toBe(false);
  });
});
