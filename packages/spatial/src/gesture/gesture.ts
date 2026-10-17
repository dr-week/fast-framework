/**
 * @fileoverview Unified Eye-Gaze & Hand Tracking Gestures.
 * Normalizes Apple Vision Pro gaze+pinch and Meta Quest 6DoF hand tracking into reactive signals.
 */

import { signal, computed, type Signal, type Computed } from '@zuari/signals';
import type { PinchGestureState, Handedness, Vec3 } from '../types.js';

export interface SpatialGestureTracker {
  readonly state: Signal<PinchGestureState>;
  readonly isPinched: Computed<boolean>;
  readonly strength: Computed<number>;
  /** Update pinch gesture from XRInputSource / Hand joint positions */
  updateGesture(strength: number, pos?: Vec3, handedness?: Handedness): void;
  /** Reset gesture state */
  reset(): void;
}

export function createPinchTracker(handedness: Handedness = 'right'): SpatialGestureTracker {
  const state = signal<PinchGestureState>({
    active: false,
    strength: 0,
    handedness,
    position: { x: 0, y: 0, z: 0 }
  });

  const isPinched = computed(() => state.value.strength >= 0.85);
  const strength = computed(() => state.value.strength);

  function updateGesture(pinchStrength: number, pos?: Vec3, hand?: Handedness): void {
    const clampedStrength = Math.max(0, Math.min(1, pinchStrength));
    state.value = {
      active: clampedStrength > 0.1,
      strength: clampedStrength,
      handedness: hand ?? state.value.handedness,
      position: pos ? { ...pos } : state.value.position
    };
  }

  function reset(): void {
    state.value = {
      active: false,
      strength: 0,
      handedness,
      position: { x: 0, y: 0, z: 0 }
    };
  }

  return {
    state,
    isPinched,
    strength,
    updateGesture,
    reset
  };
}
