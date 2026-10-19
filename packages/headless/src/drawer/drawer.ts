import { signal, effect, type CleanupFn } from '@zuari/signals';
import type { DrawerOptions, DrawerInstance, DrawerPlacement } from './types.js';
import { captureFocus, restoreFocus } from '../dialog/focus.js';
import { bindInvokerCommand, type CommandEventLike } from '../invoker.js';

let drawerIdCounter = 0;

const TRANSLATE_MAP: Record<DrawerPlacement, { closed: string; open: string }> = {
  left: { closed: 'translate3d(-100%, 0, 0)', open: 'translate3d(0, 0, 0)' },
  right: { closed: 'translate3d(100%, 0, 0)', open: 'translate3d(0, 0, 0)' },
  top: { closed: 'translate3d(0, -100%, 0)', open: 'translate3d(0, 0, 0)' },
  bottom: { closed: 'translate3d(0, 100%, 0)', open: 'translate3d(0, 0, 0)' }
};

/**
 * Creates an accessible, high-performance sliding side/bottom drawer primitive.
 * Powered by HTML5 <dialog> with buttery-smooth 60-120 FPS Web Animations API sliding transforms,
 * touch swipe-to-dismiss gestures, ESC key trapping, and HTML Invoker Commands integration.
 */
export function createDrawer(options: DrawerOptions = {}): DrawerInstance {
  const dialog = document.createElement('dialog');
  const id = options.id ?? `zuari-drawer-${++drawerIdCounter}`;
  dialog.id = id;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.classList.add('zuari-drawer');

  const placement = signal<DrawerPlacement>(options.placement ?? 'right');
  const durationMs = options.durationMs ?? 280;
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)'; // Natural organic spring settle

  const isOpen = typeof options.isOpen === 'object' && options.isOpen !== null && 'value' in options.isOpen
    ? options.isOpen
    : signal(Boolean(options.isOpen));

  const closeOnBackdrop = options.closeOnBackdropClick ?? true;
  const closeOnEsc = options.closeOnEscape ?? true;
  const enableSwipe = options.enableSwipeToClose ?? true;
  const swipeThreshold = options.swipeThresholdPx ?? 60;

  let isAnimating = false;
  let activeAnimation: Animation | null = null;

  dialog.setAttribute('data-placement', placement.value);

  const applyPlacementStyle = (place: DrawerPlacement) => {
    dialog.setAttribute('data-placement', place);
  };

  const runSlideAnimation = (isOpening: boolean): Promise<void> => {
    if (activeAnimation) {
      activeAnimation.cancel();
      activeAnimation = null;
    }

    const currentPlace = placement.value;
    const { closed, open } = TRANSLATE_MAP[currentPlace] ?? TRANSLATE_MAP.right;

    const keyframes = isOpening
      ? [
          { transform: closed, opacity: 0.75 },
          { transform: open, opacity: 1 }
        ]
      : [
          { transform: open, opacity: 1 },
          { transform: closed, opacity: 0.75 }
        ];

    if (typeof dialog.animate === 'function') {
      try {
        isAnimating = true;
        const anim = dialog.animate(keyframes, {
          duration: durationMs,
          easing,
          fill: 'forwards'
        });
        activeAnimation = anim;

        return anim.finished
          .then(() => {
            isAnimating = false;
            activeAnimation = null;
          })
          .catch(() => {
            isAnimating = false;
            activeAnimation = null;
          });
      } catch {
        isAnimating = false;
      }
    }

    dialog.style.transform = isOpening ? open : closed;
    return Promise.resolve();
  };

  const open = async () => {
    if (isOpen.value && dialog.open) return;
    isOpen.value = true;
  };

  const close = async () => {
    if (!isOpen.value && !dialog.open) return;
    isOpen.value = false;
  };

  const toggle = async () => {
    if (isOpen.value) {
      await close();
    } else {
      await open();
    }
  };

  // 1. Backdrop Click
  const handleBackdropClick = (event: MouseEvent) => {
    if (!closeOnBackdrop) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.bottom &&
      rect.left <= event.clientX &&
      event.clientX <= rect.right
    );
    if (!isInDialog) {
      close();
    }
  };

  // 2. Escape & Cancel
  const handleCancel = (event: Event) => {
    if (!closeOnEsc) {
      event.preventDefault();
      return;
    }
    event.preventDefault(); // Prevent instant browser close so slide-out animation plays
    close();
  };

  // 3. HTML Invoker Commands
  const handleCommand = (event: Event) => {
    const cmd = (event as CommandEventLike).command;
    if (cmd === 'show-modal' || cmd === 'open') {
      open();
    } else if (cmd === 'close') {
      close();
    }
  };

  // 4. Touch Gestures (Swipe to close)
  let startX = 0;
  let startY = 0;
  let currentDelta = 0;

  const handleTouchStart = (e: TouchEvent) => {
    if (!enableSwipe || e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (touch) {
      startX = touch.clientX;
      startY = touch.clientY;
      currentDelta = 0;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!enableSwipe || e.touches.length !== 1 || isAnimating) return;
    const touch = e.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const place = placement.value;

    if (place === 'left' && deltaX < 0) {
      currentDelta = deltaX;
      dialog.style.transform = `translate3d(${deltaX}px, 0, 0)`;
    } else if (place === 'right' && deltaX > 0) {
      currentDelta = deltaX;
      dialog.style.transform = `translate3d(${deltaX}px, 0, 0)`;
    } else if (place === 'bottom' && deltaY > 0) {
      currentDelta = deltaY;
      dialog.style.transform = `translate3d(0, ${deltaY}px, 0)`;
    } else if (place === 'top' && deltaY < 0) {
      currentDelta = deltaY;
      dialog.style.transform = `translate3d(0, ${deltaY}px, 0)`;
    }
  };

  const handleTouchEnd = () => {
    if (!enableSwipe || currentDelta === 0) return;
    const place = placement.value;
    const absDelta = Math.abs(currentDelta);
    currentDelta = 0;

    if (absDelta >= swipeThreshold) {
      close();
    } else {
      // Re-settle to open position smoothly
      const { open } = TRANSLATE_MAP[place] ?? TRANSLATE_MAP.right;
      if (typeof dialog.animate === 'function') {
        dialog.animate([{ transform: open }], { duration: 160, easing, fill: 'forwards' });
      } else {
        dialog.style.transform = open;
      }
    }
  };

  dialog.addEventListener('click', handleBackdropClick);
  dialog.addEventListener('cancel', handleCancel);
  dialog.addEventListener('command', handleCommand);
  dialog.addEventListener('touchstart', handleTouchStart, { passive: true });
  dialog.addEventListener('touchmove', handleTouchMove, { passive: true });
  dialog.addEventListener('touchend', handleTouchEnd, { passive: true });

  // 5. Reactive Synchronization
  const disposePlacementEffect = effect(() => {
    applyPlacementStyle(placement.value);
  });

  const disposeOpenEffect = effect(() => {
    if (isOpen.value) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        captureFocus();
        dialog.showModal();
        options.onOpen?.();
        runSlideAnimation(true);
      }
    } else {
      if (dialog.open) {
        runSlideAnimation(false).then(() => {
          if (!isOpen.value && dialog.open && typeof dialog.close === 'function') {
            dialog.close();
            restoreFocus();
            options.onClose?.();
          }
        });
      }
    }
  });

  const bindInvoker = (
    button: HTMLButtonElement,
    command: 'show-modal' | 'close' | `--${string}` = 'show-modal'
  ): CleanupFn => {
    return bindInvokerCommand(button, dialog, command);
  };

  const destroy: CleanupFn = () => {
    disposePlacementEffect();
    disposeOpenEffect();
    dialog.removeEventListener('click', handleBackdropClick);
    dialog.removeEventListener('cancel', handleCancel);
    dialog.removeEventListener('command', handleCommand);
    dialog.removeEventListener('touchstart', handleTouchStart);
    dialog.removeEventListener('touchmove', handleTouchMove);
    dialog.removeEventListener('touchend', handleTouchEnd);
    if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
  };

  return {
    id,
    drawerElement: dialog,
    placement,
    isOpen,
    open,
    close,
    toggle,
    bindInvoker,
    destroy
  };
}
