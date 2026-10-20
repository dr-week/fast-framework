/**
 * @fileoverview Android IME Keyboard & System Bridge for @zuari/kotlin.
 * Derived from production architecture of RizzBoard.
 * Provides fine-grained reactive signals and high-performance native method wrappers for:
 * - Text insertion via InputConnection (`commitText`)
 * - Backward deletion (`deleteBackward`)
 * - Action submission (`sendEnter` / `IME_ACTION_SEND`)
 * - Native haptic feedback trigger
 * - MediaStore screenshot observer callback
 * - Clipboard history synchronization
 * - System app context switches (e.g. WhatsApp, Instagram, Telegram)
 */

import { signal, computed, type Signal } from '@zuari/signals';
import type { NativeKotlinBridge } from './types.js';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'error';

export interface AndroidImeBridge {
  readonly typedBuffer: Signal<string>;
  readonly lastScreenshotUri: Signal<string | null>;
  readonly currentAppPackage: Signal<string | null>;
  readonly clipboardHistory: Signal<readonly string[]>;
  
  commitText(text: string): Promise<void>;
  deleteBackward(): Promise<void>;
  sendEnter(): Promise<void>;
  triggerHaptic(type?: HapticType): Promise<void>;
  hideKeyboard(): Promise<void>;
  requestScreenshotAnalysis(uri: string): Promise<{ text: string; blocks?: string[] }>;
  clearBuffer(): void;
  destroy(): void;
}

export function createAndroidImeBridge(bridge: NativeKotlinBridge): AndroidImeBridge {
  const typedBuffer = signal<string>('');
  const lastScreenshotUri = signal<string | null>(null);
  const currentAppPackage = signal<string | null>(null);
  const clipboardHistory = signal<readonly string[]>([]);

  // Listen to native Android MediaStore screenshot event
  const unregScreenshot = bridge.registerNativeCallback('screenshotDetected', (payload: any) => {
    const uri = typeof payload === 'string' ? payload : payload?.uri;
    if (uri) {
      lastScreenshotUri.value = uri;
      bridge.callNativeFunction('triggerHaptic', 'heavy').catch(() => {});
    }
  });

  // Listen to system clipboard additions
  const unregClipboard = bridge.registerNativeCallback('clipboardAdded', (payload: any) => {
    const text = typeof payload === 'string' ? payload : payload?.text;
    if (text) {
      clipboardHistory.value = [text, ...clipboardHistory.value.filter(t => t !== text).slice(0, 9)];
    }
  });

  // Listen to foreground app package changes
  const unregAppContext = bridge.registerNativeCallback('appContextChanged', (payload: any) => {
    const pkg = typeof payload === 'string' ? payload : payload?.packageName;
    if (pkg) {
      currentAppPackage.value = pkg;
    }
  });

  async function commitText(text: string): Promise<void> {
    typedBuffer.value += text;
    await bridge.callNativeFunction('commitText', text);
  }

  async function deleteBackward(): Promise<void> {
    if (typedBuffer.value.length > 0) {
      typedBuffer.value = typedBuffer.value.slice(0, -1);
    }
    await bridge.callNativeFunction('deleteBackward');
  }

  async function sendEnter(): Promise<void> {
    typedBuffer.value = '';
    await bridge.callNativeFunction('sendEnter');
  }

  async function triggerHaptic(type: HapticType = 'light'): Promise<void> {
    await bridge.callNativeFunction('triggerHaptic', type);
  }

  async function hideKeyboard(): Promise<void> {
    await bridge.callNativeFunction('hideKeyboard');
  }

  async function requestScreenshotAnalysis(uri: string): Promise<{ text: string; blocks?: string[] }> {
    const res = await bridge.callNativeFunction<{ text: string; blocks?: string[] }>('requestScreenshotAnalysis', uri);
    return res ?? { text: '' };
  }

  function clearBuffer(): void {
    typedBuffer.value = '';
  }

  function destroy(): void {
    unregScreenshot();
    unregClipboard();
    unregAppContext();
  }

  return {
    typedBuffer,
    lastScreenshotUri,
    currentAppPackage,
    clipboardHistory,
    commitText,
    deleteBackward,
    sendEnter,
    triggerHaptic,
    hideKeyboard,
    requestScreenshotAnalysis,
    clearBuffer,
    destroy
  };
}
