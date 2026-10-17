/**
 * @fileoverview Type definitions for the Zuari Spatial Computing & WebXR runtime.
 * Targets Apple Vision Pro (visionOS), Meta Quest (Horizon OS), and WebXR headsets.
 */

import type { Signal } from '@zuari/signals';

export type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';
export type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';

/** 3D Vector coordinates in meters */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** 3D Quaternion orientation */
export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

/** 3D Rigid Transform */
export interface SpatialTransform {
  position: Vec3;
  orientation: Quat;
}

/** Configuration for creating a 3D volumetric anchor */
export interface SpatialAnchorConfig {
  readonly id: string;
  readonly initialPosition?: Vec3 | undefined;
  readonly initialOrientation?: Quat | undefined;
  /** Whether the anchor billboards (rotates to face the player's headset) */
  readonly billboard?: boolean | undefined;
  /** Max distance in meters before scaling or fading */
  readonly maxDistance?: number | undefined;
}

/** Reactive Spatial Anchor handle */
export interface SpatialAnchor {
  readonly id: string;
  readonly position: Signal<Vec3>;
  readonly orientation: Signal<Quat>;
  readonly visible: Signal<boolean>;
  /** Update the position directly from an XRFrame or game physics tick */
  updateTransform(pos: Vec3, rot?: Quat): void;
  /** Compute the 4x4 transform matrix string for CSS 3D transforms or WebGL uniform */
  toMatrixString(): string;
}

/** Hand tracking pinch gesture descriptor */
export type Handedness = 'left' | 'right' | 'none';

export interface PinchGestureState {
  readonly active: boolean;
  /** Normalized pinch strength between 0.0 (open) and 1.0 (touching) */
  readonly strength: number;
  readonly handedness: Handedness;
  readonly position: Vec3;
}

/** Spatial Audio & Haptic configuration */
export interface SpatialHapticConfig {
  readonly durationMs?: number | undefined;
  readonly intensity?: number | undefined;
}
