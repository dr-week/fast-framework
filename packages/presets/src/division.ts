/**
 * @fileoverview Information Architecture & Feature Division System for Zuari UI/UX.
 * Provides a proven, structured mental model for dividing software features cleanly
 * without visual clutter:
 *
 * 1. Surface Plane (Immediate Focus): Primary canvas, active task, zero clutter.
 * 2. Dock Plane (Quick Navigation): Compact floating icon bar with anchor tooltips.
 * 3. Sheet / Drawer Plane (Deep Context): Sliding side panels for inspectors, settings, and hardware telemetry.
 * 4. Command Palette Plane (Omni-Search): Fast modal keyboard summoning (Cmd+K / Ctrl+K).
 * 5. Ambient HUD Plane (Continuous Passive Awareness): Subtle status pills, FPS, metrics, and network state.
 */

import { signal, type Signal } from '@zuari/signals';

export type FeaturePlane =
  | 'surface'      // Primary viewport (e.g. editor, map, canvas, main feed)
  | 'dock'         // High-frequency switching bar
  | 'drawer'       // Auxiliary inspectors, deep configuration, property editors
  | 'command'      // Keyboard-driven power user launcher (Cmd+K)
  | 'ambient';     // Non-intrusive status, battery, telemetry, FPS

export interface FeatureDefinition {
  id: string;
  label: string;
  description?: string;
  category: 'core' | 'tools' | 'hardware' | 'settings' | 'systems';
  recommendedPlane: FeaturePlane;
  shortcut?: string;
  icon?: string;
}

export interface FeatureDivisionMatrix {
  surfaceFeatures: FeatureDefinition[];
  dockFeatures: FeatureDefinition[];
  drawerFeatures: FeatureDefinition[];
  commandFeatures: FeatureDefinition[];
  ambientFeatures: FeatureDefinition[];
}

/**
 * Recommends the optimal UI/UX plane for any feature based on usage frequency and cognitive load.
 */
export function classifyFeaturePlane(frequency: 'continuous' | 'frequent' | 'intermittent' | 'on-demand'): FeaturePlane {
  switch (frequency) {
    case 'continuous':
      return 'surface';
    case 'frequent':
      return 'dock';
    case 'intermittent':
      return 'drawer';
    case 'on-demand':
      return 'command';
  }
}

/**
 * Organizes a list of software features into clean, uncluttered UI/UX planes.
 */
export function createFeatureDivision(features: FeatureDefinition[]): {
  matrix: FeatureDivisionMatrix;
  activePlane: Signal<FeaturePlane>;
  getFeaturesForPlane: (plane: FeaturePlane) => FeatureDefinition[];
} {
  const matrix: FeatureDivisionMatrix = {
    surfaceFeatures: [],
    dockFeatures: [],
    drawerFeatures: [],
    commandFeatures: [],
    ambientFeatures: []
  };

  for (const f of features) {
    switch (f.recommendedPlane) {
      case 'surface':
        matrix.surfaceFeatures.push(f);
        break;
      case 'dock':
        matrix.dockFeatures.push(f);
        break;
      case 'drawer':
        matrix.drawerFeatures.push(f);
        break;
      case 'command':
        matrix.commandFeatures.push(f);
        break;
      case 'ambient':
        matrix.ambientFeatures.push(f);
        break;
    }
  }

  const activePlane = signal<FeaturePlane>('surface');

  const getFeaturesForPlane = (plane: FeaturePlane): FeatureDefinition[] => {
    switch (plane) {
      case 'surface': return matrix.surfaceFeatures;
      case 'dock': return matrix.dockFeatures;
      case 'drawer': return matrix.drawerFeatures;
      case 'command': return matrix.commandFeatures;
      case 'ambient': return matrix.ambientFeatures;
    }
  };

  return {
    matrix,
    activePlane,
    getFeaturesForPlane
  };
}
