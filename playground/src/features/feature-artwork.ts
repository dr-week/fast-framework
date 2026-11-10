import type { ActiveTab } from './state.js';

interface FeatureArtwork {
  card: string;
  station: string;
  ambient?: string;
  glow: string;
  hue: string;
  blend: 'screen' | 'lighten' | 'soft-light';
  position: string;
  ambientPosition?: string;
}

export const FEATURE_ARTWORK: Record<ActiveTab, FeatureArtwork> = {
  repl: {
    card: 'signal-orbs.jpg',
    station: 'color-spheres.jpg',
    ambient: 'cosmic-streak.jpg',
    glow: 'oklch(77% 0.16 195)',
    hue: '8deg',
    blend: 'screen',
    position: 'center 46%',
    ambientPosition: 'center 54%'
  },
  bench: {
    card: 'star-arc.jpg',
    station: 'grid-horizon.jpg',
    ambient: 'spectral-runner.jpg',
    glow: 'oklch(76% 0.16 220)',
    hue: '-5deg',
    blend: 'screen',
    position: 'center 48%',
    ambientPosition: 'center 52%'
  },
  hardware: {
    card: 'hover-car.jpg',
    station: 'golden-door.jpg',
    ambient: 'speed-trail.jpg',
    glow: 'oklch(78% 0.16 72)',
    hue: '-8deg',
    blend: 'soft-light',
    position: 'center 55%',
    ambientPosition: 'center 50%'
  },
  core: {
    card: 'prism-cube.jpg',
    station: 'color-cross.jpg',
    ambient: 'spotlight-crowd.jpg',
    glow: 'oklch(74% 0.19 315)',
    hue: '12deg',
    blend: 'screen',
    position: 'center 46%',
    ambientPosition: 'center 48%'
  },
  spatial: {
    card: 'blue-eye.jpg',
    station: 'blue-meadow.jpg',
    ambient: 'space-window.jpg',
    glow: 'oklch(78% 0.14 195)',
    hue: '-6deg',
    blend: 'screen',
    position: 'center 48%',
    ambientPosition: 'center 52%'
  },
  wasm: {
    card: 'glass-polyhedron.jpg',
    station: 'light-corridor.jpg',
    ambient: 'clock-arc.jpg',
    glow: 'oklch(77% 0.15 185)',
    hue: '2deg',
    blend: 'screen',
    position: 'center 50%',
    ambientPosition: 'center'
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
