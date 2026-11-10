import type { ActiveTab } from './state.js';

interface FeatureArtwork {
  card: string;
  station: string;
  glow: string;
  hue: string;
  blend: 'screen' | 'lighten' | 'soft-light';
  position: string;
}

export const FEATURE_ARTWORK: Record<ActiveTab, FeatureArtwork> = {
  repl: {
    card: 'signal-orbs.jpg',
    station: 'color-spheres.jpg',
    glow: 'oklch(77% 0.16 195)',
    hue: '8deg',
    blend: 'screen',
    position: 'center 46%'
  },
  bench: {
    card: 'star-arc.jpg',
    station: 'grid-horizon.jpg',
    glow: 'oklch(76% 0.16 220)',
    hue: '-5deg',
    blend: 'screen',
    position: 'center 48%'
  },
  hardware: {
    card: 'hover-car.jpg',
    station: 'golden-door.jpg',
    glow: 'oklch(78% 0.16 72)',
    hue: '-8deg',
    blend: 'soft-light',
    position: 'center 55%'
  },
  core: {
    card: 'prism-cube.jpg',
    station: 'color-cross.jpg',
    glow: 'oklch(74% 0.19 315)',
    hue: '12deg',
    blend: 'screen',
    position: 'center 46%'
  },
  spatial: {
    card: 'blue-eye.jpg',
    station: 'blue-meadow.jpg',
    glow: 'oklch(78% 0.14 195)',
    hue: '-6deg',
    blend: 'screen',
    position: 'center 48%'
  },
  wasm: {
    card: 'glass-polyhedron.jpg',
    station: 'light-corridor.jpg',
    glow: 'oklch(77% 0.15 185)',
    hue: '2deg',
    blend: 'screen',
    position: 'center 50%'
  },
  tokens: {
    card: 'light-panels.jpg',
    station: 'sunset-window.jpg',
    glow: 'oklch(77% 0.17 335)',
    hue: '-18deg',
    blend: 'lighten',
    position: 'center 48%'
  },
  alliances: {
    card: 'violet-portal.jpg',
    station: 'amber-orb.jpg',
    glow: 'oklch(76% 0.17 285)',
    hue: '8deg',
    blend: 'screen',
    position: 'center 46%'
  }
};

export function getArcadeArtworkUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}images/arcade/${fileName}`;
}
