/**
 * @fileoverview Type definitions for @zuari/kotlin Android bridge & native design system.
 */

import type { Signal, Computed } from '@zuari/signals';

export interface AndroidMaterialColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  outline: string;
}

export interface AndroidThemeOptions {
  packageName?: string;
  themeName?: string;
  isDarkTheme?: boolean;
  colors?: Partial<AndroidMaterialColors>;
}

export interface NativeKotlinBridge {
  isAndroid: Computed<boolean>;
  dynamicColors: Signal<AndroidMaterialColors>;
  isDarkTheme: Signal<boolean>;
  
  /**
   * Invokes an Android native function exposed via WebView JavaScriptInterface or custom URL protocol.
   * Format: window.Android.<functionName>(...args) or postMessage({ action, payload })
   */
  callNativeFunction: <T = unknown>(fnName: string, ...args: unknown[]) => Promise<T>;
  
  /**
   * Registers a callback handler that Android native Kotlin code can invoke into the Zuari runtime.
   */
  registerNativeCallback: (name: string, handler: (...args: any[]) => void) => () => void;
  
  /**
   * Generates production-ready Jetpack Compose Theme Kotlin code (`Theme.kt`).
   */
  generateComposeThemeCode: (options?: AndroidThemeOptions) => string;
  
  /**
   * Generates Android XML Material 3 theme resource (`themes.xml`).
   */
  generateXmlThemeCode: (options?: AndroidThemeOptions) => string;
  
  /**
   * Ingests Material You Dynamic Colors extracted natively from Android 12+ wallpaper palette.
   */
  ingestDynamicPalette: (palette: Partial<AndroidMaterialColors>) => void;
  
  /**
   * Applies the Android theme tokens as CSS variables on document.documentElement.
   */
  applyToCssVariables: (target?: HTMLElement) => () => void;
}
