let lastActiveElement: HTMLElement | null = null;

export function captureFocus(): void {
  if (document.activeElement instanceof HTMLElement) {
    lastActiveElement = document.activeElement;
  }
}

export function restoreFocus(): void {
  if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
    try {
      lastActiveElement.focus();
    } catch {
      // Element might have been detached from DOM
    }
    lastActiveElement = null;
  }
}
