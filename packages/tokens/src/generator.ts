import type { NovaThemeContract } from './contract.js';

function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generates valid browser-native CSS with @property declarations
 * for hardware-accelerated token transitions and runtime type-safety.
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

  return `/* Nova Framework AOT @property Definitions */\n${propertyRules.join('\n')}\n\n${selector} {\n${cssLines.join('\n')}\n}`;
}
