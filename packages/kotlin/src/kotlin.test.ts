import { describe, it, expect, vi } from 'vitest';
import {
  createKotlinBridge,
  createAndroidImeBridge,
  DEFAULT_MATERIAL_LIGHT,
  DEFAULT_MATERIAL_DARK
} from './index.js';

describe('@zuari/kotlin Native Android Bridge & Theme Synthesis', () => {
  it('initializes dynamic color signals for light and dark themes', () => {
    const bridge = createKotlinBridge(false);
    expect(bridge.isDarkTheme.value).toBe(false);
    expect(bridge.dynamicColors.value.primary).toBe(DEFAULT_MATERIAL_LIGHT.primary);

    const darkBridge = createKotlinBridge(true);
    expect(darkBridge.isDarkTheme.value).toBe(true);
    expect(darkBridge.dynamicColors.value.primary).toBe(DEFAULT_MATERIAL_DARK.primary);
  });

  it('generates idiomatic Jetpack Compose theme Kotlin code', () => {
    const bridge = createKotlinBridge();
    const composeCode = bridge.generateComposeThemeCode({
      packageName: 'com.example.app.ui',
      themeName: 'AppTheme'
    });

    expect(composeCode).toContain('package com.example.app.ui');
    expect(composeCode).toContain('fun AppTheme(');
    expect(composeCode).toContain('val ZuariPrimary = Color(');
    expect(composeCode).toContain('MaterialTheme(');
  });

  it('generates Material 3 Android XML themes', () => {
    const bridge = createKotlinBridge();
    const xmlCode = bridge.generateXmlThemeCode({ themeName: 'Theme.MyBrand.Native' });

    expect(xmlCode).toContain('<style name="Theme.MyBrand.Native"');
    expect(xmlCode).toContain('<item name="colorPrimary">#006A6A</item>');
    expect(xmlCode).toContain('</resources>');
  });

  it('ingests Material You dynamic palette and applies CSS variables', () => {
    const bridge = createKotlinBridge();
    const el = document.createElement('div');
    const cleanup = bridge.applyToCssVariables(el);

    expect(el.style.getPropertyValue('--md-sys-color-primary')).toBe('#006A6A');

    // Ingest wallpaper-extracted dynamic primary color
    bridge.ingestDynamicPalette({ primary: '#80CBC4' });
    expect(bridge.dynamicColors.value.primary).toBe('#80CBC4');
    expect(el.style.getPropertyValue('--md-sys-color-primary')).toBe('#80CBC4');

    cleanup();
  });

  it('bridges native function calls and handles Android callback dispatching', async () => {
    const bridge = createKotlinBridge();

    // Mock Android JavascriptInterface
    const mockHaptic = vi.fn((pattern: string) => JSON.stringify({ vibrationDone: true, pattern }));
    (window as any).Android = {
      vibrateHaptic: mockHaptic
    };

    const res: any = await bridge.callNativeFunction('vibrateHaptic', 'CLICK_HEAVY');
    expect(mockHaptic).toHaveBeenCalledWith('CLICK_HEAVY');
    expect(res.vibrationDone).toBe(true);

    // Test reverse callback from Kotlin
    const callbackMock = vi.fn();
    bridge.registerNativeCallback('onScanResult', callbackMock);

    (window as any).__zuariKotlinDispatcher('onScanResult', JSON.stringify({ barcode: '9780201616224' }));
    expect(callbackMock).toHaveBeenCalledWith({ barcode: '9780201616224' });

    delete (window as any).Android;
    delete (window as any).__zuariKotlinDispatcher;
  });

  it('manages Android IME keyboard lifecycle, text buffer, haptics, and screenshot sync (RizzBoard Integration)', async () => {
    const bridge = createKotlinBridge();
    const ime = createAndroidImeBridge(bridge);

    expect(ime.typedBuffer.value).toBe('');
    expect(ime.lastScreenshotUri.value).toBeNull();
    expect(ime.clipboardHistory.value.length).toBe(0);

    // Commit characters
    await ime.commitText('H');
    await ime.commitText('i');
    expect(ime.typedBuffer.value).toBe('Hi');

    // Delete backward
    await ime.deleteBackward();
    expect(ime.typedBuffer.value).toBe('H');

    // Send enter / action
    await ime.sendEnter();
    expect(ime.typedBuffer.value).toBe('');

    // Trigger screenshot event from Android native observer
    (window as any).__zuariKotlinDispatcher('screenshotDetected', JSON.stringify({ uri: 'content://media/external/images/media/420' }));
    expect(ime.lastScreenshotUri.value).toBe('content://media/external/images/media/420');

    // Trigger clipboard sync event
    (window as any).__zuariKotlinDispatcher('clipboardAdded', JSON.stringify({ text: 'https://zuari.dev' }));
    expect(ime.clipboardHistory.value[0]).toBe('https://zuari.dev');

    ime.destroy();
  });
});
