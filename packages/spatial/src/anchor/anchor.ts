/**
 * @fileoverview 3D Volumetric Anchor Primitives.
 * Extends the CSS Anchor Positioning concept into 3D world-space coordinates,
 * tethering UI HUD elements directly to hand joints or physical room planes.
 */

import { signal, effect, type Signal } from '@zuari/signals';
import type { Vec3, Quat, SpatialAnchorConfig, SpatialAnchor } from '../types.js';

export function createSpatialAnchor(config: SpatialAnchorConfig): SpatialAnchor {
  const position = signal<Vec3>(config.initialPosition ?? { x: 0, y: 0, z: -1 });
  const orientation = signal<Quat>(config.initialOrientation ?? { x: 0, y: 0, z: 0, w: 1 });
  const visible = signal<boolean>(true);

  function updateTransform(pos: Vec3, rot?: Quat): void {
    position.value = { ...pos };
    if (rot) {
      orientation.value = { ...rot };
    }
  }

  function toMatrixString(): string {
    const p = position.value;
    const q = orientation.value;

    // Convert quaternion + translation to 4x4 transform matrix
    const x2 = q.x + q.x;
    const y2 = q.y + q.y;
    const z2 = q.z + q.z;
    const xx = q.x * x2;
    const xy = q.x * y2;
    const xz = q.x * z2;
    const yy = q.y * y2;
    const yz = q.y * z2;
    const zz = q.z * z2;
    const wx = q.w * x2;
    const wy = q.w * y2;
    const wz = q.w * z2;

    const m00 = 1 - (yy + zz);
    const m01 = xy + wz;
    const m02 = xz - wy;

    const m10 = xy - wz;
    const m11 = 1 - (xx + zz);
    const m12 = yz + wx;

    const m20 = xz + wy;
    const m21 = yz - wx;
    const m22 = 1 - (xx + yy);

    return `matrix3d(${m00.toFixed(4)}, ${m10.toFixed(4)}, ${m20.toFixed(4)}, 0, ${m01.toFixed(4)}, ${m11.toFixed(4)}, ${m21.toFixed(4)}, 0, ${m02.toFixed(4)}, ${m12.toFixed(4)}, ${m22.toFixed(4)}, 0, ${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)}, 1)`;
  }

  return {
    id: config.id,
    position,
    orientation,
    visible,
    updateTransform,
    toMatrixString
  };
}

/**
 * Binds an HTML element's CSS 3D transform directly to a reactive SpatialAnchor.
 */
export function bindAnchorToElement(anchor: SpatialAnchor, element: HTMLElement): () => void {
  element.style.position = 'absolute';
  element.style.transformOrigin = 'center center';
  element.style.transformStyle = 'preserve-3d';
  element.style.willChange = 'transform, opacity';

  return effect(() => {
    if (!anchor.visible.value) {
      element.style.display = 'none';
      return;
    }
    element.style.display = '';
    element.style.transform = anchor.toMatrixString();
  });
}
