/**
 * @fileoverview @zuari/hardware/display
 * Futuristic optical waveguide (Even Realities G1 530nm green), Night-Vision Phosphor (NVG),
 * FLIR Thermal, Laser Palm Projection, and 1-Bit Bistable E-Ink (Mudita / Light Phone) display modes.
 */

import { signal, computed, effect } from '@zuari/signals';
import type { HardwareDisplayPreset, DisplayModeController } from '../types.js';

const PRESET_PALETTES: Record<HardwareDisplayPreset, Record<string, string>> = {
  standard: {
    '--hw-bg': 'oklch(12% 0.02 260)',
    '--hw-fg': 'oklch(98% 0 0)',
    '--hw-accent': 'oklch(75% 0.18 190)',
    '--hw-border': 'oklch(100% 0 0 / 0.14)',
    '--hw-transition': '160ms ease'
  },
  'waveguide-green': {
    // Pure black (#000000) is optically transparent in Micro-LED waveguides
    '--hw-bg': '#000000',
    '--hw-fg': '#00ff66',
    '--hw-accent': '#00ff66',
    '--hw-border': '#00cc52',
    '--hw-transition': '0ms'
  },
  'nvg-phosphor': {
    '--hw-bg': '#021206',
    '--hw-fg': '#4dff88',
    '--hw-accent': '#7effa8',
    '--hw-border': '#1f7a3a',
    '--hw-transition': '40ms linear'
  },
  'thermal-flir': {
    '--hw-bg': '#14061f',
    '--hw-fg': '#ffcc00',
    '--hw-accent': '#ff5500',
    '--hw-border': '#ff8800',
    '--hw-transition': '60ms linear'
  },
  'laser-pin': {
    '--hw-bg': '#000000',
    '--hw-fg': '#00f0ff',
    '--hw-accent': '#00f0ff',
    '--hw-border': '#00a8b5',
    '--hw-transition': '0ms'
  },
  'eink-1bit': {
    // Bistable 1-bit high-contrast E-Ink with zero animation ghosting
    '--hw-bg': '#f4f4f0',
    '--hw-fg': '#111111',
    '--hw-accent': '#111111',
    '--hw-border': '#111111',
    '--hw-transition': '0ms'
  }
};

export function createDisplayMode(
  initialPreset: HardwareDisplayPreset = 'standard'
): DisplayModeController {
  const mode = signal<HardwareDisplayPreset>(initialPreset);
  const contrastBoost = signal<number>(1.0);

  const isMonochromeOptic = computed(
    () =>
      mode.value === 'waveguide-green' ||
      mode.value === 'nvg-phosphor' ||
      mode.value === 'laser-pin'
  );

  const isBistableEink = computed(() => mode.value === 'eink-1bit');

  const cssVariables = computed(() => {
    return PRESET_PALETTES[mode.value] ?? PRESET_PALETTES.standard;
  });

  function applyToElement(target: HTMLElement): () => void {
    return effect(() => {
      const vars = cssVariables.value;
      target.setAttribute('data-hw-display', mode.value);
      for (const [k, v] of Object.entries(vars)) {
        target.style.setProperty(k, v);
      }
    });
  }

  return {
    mode,
    contrastBoost,
    isMonochromeOptic,
    isBistableEink,
    cssVariables,
    applyToElement
  };
}
