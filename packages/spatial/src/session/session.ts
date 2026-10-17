/**
 * @fileoverview WebXR Session & Lifecycle Manager.
 * Orchestrates immersive-ar and immersive-vr sessions on Apple Vision Pro and Meta Quest.
 */

import { signal, type Signal } from '@zuari/signals';
import type { XRSessionMode, XRReferenceSpaceType } from '../types.js';

export interface SpatialSessionController {
  readonly isSupported: Signal<boolean>;
  readonly active: Signal<boolean>;
  readonly mode: Signal<XRSessionMode | null>;
  /** Check if the current device/browser supports the requested WebXR session mode */
  checkSupport(mode?: XRSessionMode): Promise<boolean>;
  /** Request entering spatial immersive mode */
  startSession(mode?: XRSessionMode, referenceSpaceType?: XRReferenceSpaceType): Promise<void>;
  /** Safely exit the immersive session */
  endSession(): Promise<void>;
}

export function createSpatialSession(): SpatialSessionController {
  const isSupported = signal<boolean>(false);
  const active = signal<boolean>(false);
  const mode = signal<XRSessionMode | null>(null);

  let currentXRSession: any = null;

  async function checkSupport(testMode: XRSessionMode = 'immersive-ar'): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      try {
        const supported = await (navigator as any).xr.isSessionSupported(testMode);
        isSupported.value = supported;
        return supported;
      } catch {
        isSupported.value = false;
        return false;
      }
    }
    isSupported.value = false;
    return false;
  }

  async function startSession(
    requestedMode: XRSessionMode = 'immersive-ar',
    _refType: XRReferenceSpaceType = 'local-floor'
  ): Promise<void> {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.requestSession) {
      try {
        const session = await (navigator as any).xr.requestSession(requestedMode, {
          requiredFeatures: ['local-floor'],
          optionalFeatures: ['hand-tracking', 'hit-test', 'anchors']
        });
        currentXRSession = session;
        active.value = true;
        mode.value = requestedMode;

        session.addEventListener('end', () => {
          active.value = false;
          mode.value = null;
          currentXRSession = null;
        });
        return;
      } catch (err) {
        console.warn('[Zuari Spatial] Failed to initialize WebXR session:', err);
      }
    }
    // Simulation / headless mode
    active.value = true;
    mode.value = requestedMode;
  }

  async function endSession(): Promise<void> {
    if (currentXRSession) {
      await currentXRSession.end();
      currentXRSession = null;
    }
    active.value = false;
    mode.value = null;
  }

  return {
    isSupported,
    active,
    mode,
    checkSupport,
    startSession,
    endSession
  };
}
