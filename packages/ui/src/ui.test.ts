import { describe, it, expect, vi } from 'vitest';
import { signal } from '@zuari/signals';
import { createSwitch, createBadge, createCard } from './index.js';

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
});
