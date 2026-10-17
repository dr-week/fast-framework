/**
 * @fileoverview Spatial Haptics & Audio Trigger Primitives.
 * Provides micro-haptic pulses for Meta Quest touch controllers and WebXR gamepads.
 */

import type { SpatialHapticConfig } from '../types.js';

export function triggerSpatialHaptic(
  gamepad: any,
  config: SpatialHapticConfig = {}
): Promise<boolean> {
  const duration = config.durationMs ?? 40;
  const intensity = config.intensity ?? 0.6;

  // WebXR Haptic Actuator API
  if (gamepad?.hapticActuators && gamepad.hapticActuators.length > 0) {
    const actuator = gamepad.hapticActuators[0];
    if (actuator && typeof actuator.pulse === 'function') {
      return actuator.pulse(intensity, duration).then(() => true).catch(() => false);
    }
  }

  // Standard Gamepad Vibration API
  if (gamepad?.vibrationActuator && typeof gamepad.vibrationActuator.playEffect === 'function') {
    return gamepad.vibrationActuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration,
      weakMagnitude: intensity,
      strongMagnitude: intensity
    }).then(() => true).catch(() => false);
  }

  // Navigator fallback
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }

  return Promise.resolve(false);
}
