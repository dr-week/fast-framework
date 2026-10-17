import type { CleanupFn } from '@zuari/signals';

export interface KeyNavigationOptions {
  onNext: () => void;
  onPrev: () => void;
  onSelect: () => void;
  onEscape: () => void;
}

/**
 * Handles keyboard accessibility (ArrowDown, ArrowUp, Enter, Escape)
 * for list-based navigation with roving selection.
 */
export function bindKeyboardNavigation(
  inputElement: HTMLElement,
  options: KeyNavigationOptions
): CleanupFn {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        options.onNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        options.onPrev();
        break;
      case 'Enter':
        event.preventDefault();
        options.onSelect();
        break;
      case 'Escape':
        event.preventDefault();
        options.onEscape();
        break;
    }
  };

  inputElement.addEventListener('keydown', handleKeyDown);
  return () => {
    inputElement.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Binds global window shortcut (e.g., Cmd+K or Ctrl+K).
 */
export function bindGlobalHotkey(key: string, onTrigger: () => void): CleanupFn {
  const handleGlobal = (event: KeyboardEvent) => {
    const isMeta = event.metaKey || event.ctrlKey;
    if (isMeta && event.key.toLowerCase() === key.toLowerCase()) {
      event.preventDefault();
      onTrigger();
    }
  };

  window.addEventListener('keydown', handleGlobal);
  return () => {
    window.removeEventListener('keydown', handleGlobal);
  };
}
