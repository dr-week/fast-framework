/**
 * @fileoverview @zuari/hardware/dpad
 * KaiOS, Dumbphone & Feature Phone Spatial D-Pad Navigator, SoftKey Bar Manager,
 * and Multi-Tap T9 Keypad Decoder for non-touchscreen devices (JioPhone, Nokia Flip, Light Phone).
 */

import { signal, batch } from '@zuari/signals';
import type { DpadNavOptions, DpadNavigator, SoftKeyLabels } from '../types.js';

const T9_KEYMAP: Record<string, string> = {
  '1': '.,?!1',
  '2': 'abc2',
  '3': 'def3',
  '4': 'ghi4',
  '5': 'jkl5',
  '6': 'mno6',
  '7': 'pqrs7',
  '8': 'tuv8',
  '9': 'wxyz9',
  '0': ' 0'
};

export function createDpadNav(options: DpadNavOptions): DpadNavigator {
  const count = Math.max(1, options.itemCount);
  const cols = Math.max(1, options.columns ?? 1);
  const wrap = options.wrap ?? true;

  const focusedIndex = signal(options.initialIndex ?? 0);
  const softKeys = signal<SoftKeyLabels>(
    options.defaultSoftKeys ?? { left: 'Options', center: 'SELECT', right: 'Back' }
  );
  const t9Buffer = signal('');

  let lastDigit = '';
  let lastTapTime = 0;
  let cycleIdx = 0;

  function setFocus(next: number): void {
    if (wrap) {
      focusedIndex.value = ((next % count) + count) % count;
    } else {
      focusedIndex.value = Math.max(0, Math.min(count - 1, next));
    }
  }

  function moveUp(): void {
    setFocus(focusedIndex.value - cols);
  }

  function moveDown(): void {
    setFocus(focusedIndex.value + cols);
  }

  function moveLeft(): void {
    setFocus(focusedIndex.value - 1);
  }

  function moveRight(): void {
    setFocus(focusedIndex.value + 1);
  }

  function selectCurrent(): void {
    options.onSelect?.(focusedIndex.value);
  }

  function pressT9Digit(digit: string): void {
    const chars = T9_KEYMAP[digit];
    if (!chars) return;

    const now = Date.now();
    if (digit === lastDigit && now - lastTapTime < 650 && t9Buffer.value.length > 0) {
      cycleIdx = (cycleIdx + 1) % chars.length;
      const char = chars[cycleIdx] ?? digit;
      t9Buffer.value = t9Buffer.value.slice(0, -1) + char;
    } else {
      cycleIdx = 0;
      const char = chars[0] ?? digit;
      t9Buffer.value = t9Buffer.value + char;
    }
    lastDigit = digit;
    lastTapTime = now;
  }

  function clearT9(): void {
    batch(() => {
      t9Buffer.value = '';
      lastDigit = '';
      cycleIdx = 0;
    });
  }

  function handleKeyEvent(key: string): boolean {
    switch (key) {
      case 'ArrowUp':
        moveUp();
        return true;
      case 'ArrowDown':
        moveDown();
        return true;
      case 'ArrowLeft':
        moveLeft();
        return true;
      case 'ArrowRight':
        moveRight();
        return true;
      case 'Enter':
        selectCurrent();
        return true;
      case 'SoftLeft':
      case 'F1':
        options.onSoftLeft?.(focusedIndex.value);
        return true;
      case 'SoftRight':
      case 'F2':
      case 'Backspace':
        if (key === 'Backspace' && t9Buffer.value.length > 0) {
          t9Buffer.value = t9Buffer.value.slice(0, -1);
          return true;
        }
        options.onSoftRight?.(focusedIndex.value);
        return true;
      default:
        if (/^[0-9]$/.test(key)) {
          pressT9Digit(key);
          return true;
        }
        return false;
    }
  }

  return {
    focusedIndex,
    softKeys,
    t9Buffer,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    selectCurrent,
    pressT9Digit,
    clearT9,
    handleKeyEvent
  };
}
