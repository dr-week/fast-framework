import type { NovaThemeContract, ThemePresetName } from './contract.js';
import { THEME_PRESETS } from './themes.js';

function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generates valid browser-native CSS with @property declarations
 * for hardware-accelerated token transitions, lightweight elevations, and motion curves.
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

  // Register lightweight elevation levels (flat, soft, float, halo)
  if (tokens.elevations) {
    for (const [key, value] of Object.entries(tokens.elevations)) {
      const varName = `--zuari-elevation-${kebabCase(key)}`;
      cssLines.push(`  ${varName}: ${value};`);
    }
  }

  // Register motion presets (crisp, smooth, calm, bounce)
  if (tokens.motion) {
    for (const [key, value] of Object.entries(tokens.motion)) {
      const varName = `--zuari-motion-${kebabCase(key)}`;
      cssLines.push(`  ${varName}: ${value};`);
    }
  }

  return `/* Nova Framework AOT @property Definitions */\n${propertyRules.join('\n')}\n\n${selector} {\n${cssLines.join('\n')}\n}`;
}

/**
 * Applies a named theme preset ('paper', 'blossom', 'matcha', 'twilight', 'midnight')
 * directly to a DOM root element (defaults to `document.documentElement`).
 */
export function applyThemePreset(
  preset: ThemePresetName | NovaThemeContract,
  target?: HTMLElement
): NovaThemeContract {
  const resolved = typeof preset === 'string' ? THEME_PRESETS[preset] : preset;
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


