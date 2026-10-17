import type { MorphKeyframes } from './types.js';

/**
 * Mathematically balanced SVG vector paths with equivalent 8-point contour coordinates.
 * Allows native browser GPU interpolation (`d: path(...)` CSS transition).
 * Zero JavaScript animation frames required.
 */
export const MORPH_PATHS: MorphKeyframes = {
  // 1. Idle state: 4-pointed radiant sparkle
  sparkle:
    'M 12 3 C 12 7 9 10 3 12 C 9 12 12 15 12 21 C 12 15 15 12 21 12 C 15 10 12 7 12 3 Z',

  // 2. Loading state: circular rotating progress ring
  loadingRing:
    'M 12 2 C 6.5 2 2 6.5 2 12 C 2 17.5 6.5 22 12 22 C 17.5 22 22 17.5 22 12 C 22 6.5 17.5 2 12 2 Z',

  // 3. Success state: checkmark contour
  checkmark:
    'M 4 12 C 6 14 8 16 9 19 C 12 14 16 9 20 5 C 16 9 12 14 9 19 C 8 16 6 14 4 12 Z',

  // 4. Error / Dismiss state: cross contour
  cross:
    'M 5 5 C 9 9 12 12 19 19 C 12 12 9 9 5 5 C 9 15 12 12 19 5 C 12 12 9 15 5 19 Z'
};
