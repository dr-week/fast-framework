import type { NovaThemeContract, JapaneseAestheticPresetName } from './contract.js';
import { JAPANESE_THEME_PRESETS } from './themes.js';

function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generates valid browser-native CSS with @property declarations
 * for hardware-accelerated token transitions, lightweight Japanese elevations, and motion curves.
 */
export function generateCssVariables(tokens: NovaThemeContract, selector: string = ':root'): string {
  const cssLines: string[] = [];
  const propertyRules: string[] = [];

  // Register colors
  for (const [key, value] of Object.entries(tokens.colors)) {
    const varName = `--nova-color-${kebabCase(key)}`;
    propertyRules.push(`@property ${varName} { syntax: "<color>"; inherits: true; initial-value: ${value}; }`);
    cssLines.push(`  ${varName}: ${value};`);
  }

  // Register spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    const varName = `--nova-space-${kebabCase(key)}`;
    propertyRules.push(`@property ${varName} { syntax: "<length>"; inherits: true; initial-value: ${value}; }`);
    cssLines.push(`  ${varName}: ${value};`);
  }

  // Register radii
  for (const [key, value] of Object.entries(tokens.radii)) {
    const varName = `--nova-radius-${kebabCase(key)}`;
    cssLines.push(`  ${varName}: ${value};`);
  }

  // Register lightweight Japanese elevation tiers (kami, shoji, kaze, sora)
  if (tokens.elevations) {
    for (const [key, value] of Object.entries(tokens.elevations)) {
      const varName = `--zuari-elevation-${kebabCase(key)}`;
      cssLines.push(`  ${varName}: ${value};`);
    }
  }

  // Register human-artistic & anime motion presets
  if (tokens.motion) {
    for (const [key, value] of Object.entries(tokens.motion)) {
      const varName = `--zuari-motion-${kebabCase(key)}`;
      cssLines.push(`  ${varName}: ${value};`);
    }
  }

  return `/* Nova Framework AOT @property Definitions */\n${propertyRules.join('\n')}\n\n${selector} {\n${cssLines.join('\n')}\n}`;
}

/**
 * Applies a named Japanese minimal / anime-artistic theme preset directly to a DOM root element
 * (defaults to `document.documentElement`).
 */
export function applyThemePreset(
  preset: JapaneseAestheticPresetName | NovaThemeContract,
  target?: HTMLElement
): NovaThemeContract {
  const resolved = typeof preset === 'string' ? JAPANESE_THEME_PRESETS[preset] : preset;
  const root =
    target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);

  if (root) {
    if (resolved.name) {
      root.setAttribute('data-zuari-theme', resolved.name);
    }
    for (const [key, value] of Object.entries(resolved.colors)) {
      root.style.setProperty(`--nova-color-${kebabCase(key)}`, value);
    }
    for (const [key, value] of Object.entries(resolved.spacing)) {
      root.style.setProperty(`--nova-space-${kebabCase(key)}`, value);
    }
    for (const [key, value] of Object.entries(resolved.radii)) {
      root.style.setProperty(`--nova-radius-${kebabCase(key)}`, value);
    }
    if (resolved.elevations) {
      for (const [key, value] of Object.entries(resolved.elevations)) {
        root.style.setProperty(`--zuari-elevation-${kebabCase(key)}`, value);
      }
    }
    if (resolved.motion) {
      for (const [key, value] of Object.entries(resolved.motion)) {
        root.style.setProperty(`--zuari-motion-${kebabCase(key)}`, value);
      }
    }
  }

  return resolved;
}

