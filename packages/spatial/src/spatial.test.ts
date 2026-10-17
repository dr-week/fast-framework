import { describe, it, expect, vi } from 'vitest';
import { createSpatialAnchor, bindAnchorToElement } from './anchor/anchor.js';
import { createPinchTracker } from './gesture/gesture.js';
import { createSpatialSession } from './session/session.js';
import { triggerSpatialHaptic } from './haptics/haptics.js';

describe('@zuari/spatial', () => {
  describe('Spatial Anchor 3D Matrix Math & DOM Binding', () => {
    it('initializes position, orientation, and computes valid 4x4 matrix3d string', () => {
      const anchor = createSpatialAnchor({
        id: 'hud-radar',
        initialPosition: { x: 0.5, y: 1.2, z: -2.0 }
      });

      expect(anchor.id).toBe('hud-radar');
      expect(anchor.position.value).toEqual({ x: 0.5, y: 1.2, z: -2.0 });

      const matrixStr = anchor.toMatrixString();
      expect(matrixStr).toContain('matrix3d(');
      expect(matrixStr).toContain('0.5000');
      expect(matrixStr).toContain('1.2000');
      expect(matrixStr).toContain('-2.0000');
    });

    it('updates transform dynamically and reacts in bound DOM element', () => {
      const anchor = createSpatialAnchor({ id: 'target' });
      const el = document.createElement('div');
      const dispose = bindAnchorToElement(anchor, el);

      expect(el.style.transform).toContain('matrix3d(');
      expect(el.style.position).toBe('absolute');

      // Update position
      anchor.updateTransform({ x: 10, y: 20, z: -5 });
      expect(el.style.transform).toContain('10.0000');
      expect(el.style.transform).toContain('20.0000');

      // Hide anchor
      anchor.visible.value = false;
      expect(el.style.display).toBe('none');

      dispose();
    });
  });

  describe('Hand Tracking & Pinch Gesture State', () => {
    it('computes isPinched when strength crosses threshold (>= 0.85)', () => {
      const tracker = createPinchTracker('right');

      expect(tracker.isPinched.value).toBe(false);
      expect(tracker.strength.value).toBe(0);

      // Light touch
      tracker.updateGesture(0.4);
      expect(tracker.isPinched.value).toBe(false);
      expect(tracker.strength.value).toBe(0.4);
      expect(tracker.state.value.active).toBe(true);

      // Full pinch
      tracker.updateGesture(0.95);
      expect(tracker.isPinched.value).toBe(true);
      expect(tracker.strength.value).toBe(0.95);

      // Reset
      tracker.reset();
      expect(tracker.isPinched.value).toBe(false);
      expect(tracker.strength.value).toBe(0);
    });
  });

  describe('WebXR Session Controller', () => {
    it('initializes in idle state and manages active mode transitions', async () => {
      const session = createSpatialSession();
      expect(session.active.value).toBe(false);
      expect(session.mode.value).toBeNull();

      // Test session start in headless/simulated environment
      await session.startSession('immersive-ar');
      expect(session.active.value).toBe(true);
      expect(session.mode.value).toBe('immersive-ar');

      await session.endSession();
      expect(session.active.value).toBe(false);
      expect(session.mode.value).toBeNull();
    });
  });

  describe('Spatial Haptics', () => {
    it('triggers pulse on standard WebXR haptic actuator', async () => {
      const pulseSpy = vi.fn().mockResolvedValue(undefined);
      const mockGamepad = {
        hapticActuators: [{ pulse: pulseSpy }]
      };

      const result = await triggerSpatialHaptic(mockGamepad, { durationMs: 50, intensity: 0.8 });
      expect(result).toBe(true);
      expect(pulseSpy).toHaveBeenCalledWith(0.8, 50);
    });
  });
});
