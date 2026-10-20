/**
 * @fileoverview Headless 3D Build Volume & Platter Physics Controller for @zuari/spatial.
 * Extracted and generalized from ANY3D 3D slicer engineering.
 * Provides fine-grained reactive signals for:
 * - 3D Volume Bounds validation (e.g. 220x220x250mm Kobra 2 build plate)
 * - Object placement, auto-centering, and ground-plane alignment
 * - Rotation, uniform scaling, and lay-flat transformations
 * - Reactive `isOutsideBounds` signal with sub-millisecond recalculation
 */

import { signal, computed, type Signal, type Computed } from '@zuari/signals';
import type { Vec3 } from '../types.js';

export interface BoundingBox3D {
  min: Vec3;
  max: Vec3;
}

export interface VolumeBoundsConfig {
  readonly width: number;
  readonly depth: number;
  readonly height: number;
  readonly origin?: 'center' | 'front_left';
}

export interface SpatialVolumeController {
  readonly config: VolumeBoundsConfig;
  readonly modelBounds: Signal<BoundingBox3D | null>;
  readonly modelPosition: Signal<Vec3>;
  readonly modelRotationDeg: Signal<Vec3>;
  readonly modelScale: Signal<number>;
  readonly isOutsideBounds: Signal<boolean>;
  readonly modelDimensions: Computed<Vec3>;
  readonly boundsUtilizationPct: Computed<number>;
  
  setModelBounds(bounds: BoundingBox3D): void;
  translate(delta: Partial<Vec3>): void;
  rotate(axis: 'x' | 'y' | 'z', degrees: number): void;
  scale(factor: number): void;
  autoCenterAndDrop(): void;
  layFlat(): void;
  validateBounds(): boolean;
}

export function createSpatialVolumeController(
  config: VolumeBoundsConfig = { width: 220, depth: 220, height: 250, origin: 'center' }
): SpatialVolumeController {
  const origin = config.origin ?? 'center';
  const modelBounds = signal<BoundingBox3D | null>(null);
  const modelPosition = signal<Vec3>({ x: 0, y: 0, z: 0 });
  const modelRotationDeg = signal<Vec3>({ x: 0, y: 0, z: 0 });
  const modelScale = signal<number>(1.0);
  const isOutsideBounds = signal<boolean>(false);

  const modelDimensions = computed<Vec3>(() => {
    const b = modelBounds.value;
    if (!b) return { x: 0, y: 0, z: 0 };
    const s = modelScale.value;
    return {
      x: (b.max.x - b.min.x) * s,
      y: (b.max.y - b.min.y) * s,
      z: (b.max.z - b.min.z) * s
    };
  });

  const boundsUtilizationPct = computed<number>(() => {
    const dims = modelDimensions.value;
    const modelVol = dims.x * dims.y * dims.z;
    const bedVol = config.width * config.depth * config.height;
    if (bedVol <= 0 || modelVol <= 0) return 0;
    return Math.min(100, Number(((modelVol / bedVol) * 100).toFixed(2)));
  });

  function validateBounds(): boolean {
    const b = modelBounds.value;
    if (!b) {
      isOutsideBounds.value = false;
      return true;
    }

    const pos = modelPosition.value;
    const s = modelScale.value;

    const currentMinX = pos.x + b.min.x * s;
    const currentMaxX = pos.x + b.max.x * s;
    const currentMinY = pos.y + b.min.y * s;
    const currentMaxY = pos.y + b.max.y * s;
    const currentMinZ = pos.z + b.min.z * s;
    const currentMaxZ = pos.z + b.max.z * s;

    let out = false;

    if (origin === 'center') {
      const halfX = config.width / 2;
      const halfZ = config.depth / 2;
      const maxY = config.height;

      out = (
        currentMinX < -halfX || currentMaxX > halfX ||
        currentMinZ < -halfZ || currentMaxZ > halfZ ||
        currentMaxY > maxY || currentMinY < -0.1
      );
    } else {
      // front_left origin (0, 0, 0)
      out = (
        currentMinX < 0 || currentMaxX > config.width ||
        currentMinZ < 0 || currentMaxZ > config.depth ||
        currentMaxY > config.height || currentMinY < -0.1
      );
    }

    isOutsideBounds.value = out;
    return !out;
  }

  function setModelBounds(bounds: BoundingBox3D): void {
    modelBounds.value = {
      min: { ...bounds.min },
      max: { ...bounds.max }
    };
    autoCenterAndDrop();
  }

  function translate(delta: Partial<Vec3>): void {
    const cur = modelPosition.value;
    modelPosition.value = {
      x: cur.x + (delta.x ?? 0),
      y: Math.max(0, cur.y + (delta.y ?? 0)),
      z: cur.z + (delta.z ?? 0)
    };
    validateBounds();
  }

  function rotate(axis: 'x' | 'y' | 'z', degrees: number): void {
    const cur = modelRotationDeg.value;
    modelRotationDeg.value = {
      ...cur,
      [axis]: (cur[axis] + degrees) % 360
    };
    validateBounds();
  }

  function scale(factor: number): void {
    if (factor <= 0) return;
    modelScale.value = Number((modelScale.value * factor).toFixed(4));
    validateBounds();
  }

  function autoCenterAndDrop(): void {
    const b = modelBounds.value;
    if (!b) return;

    const s = modelScale.value;
    const centerX = (b.min.x + b.max.x) / 2 * s;
    const centerZ = (b.min.z + b.max.z) / 2 * s;
    const bottomY = b.min.y * s;

    if (origin === 'center') {
      modelPosition.value = {
        x: -centerX,
        y: -bottomY,
        z: -centerZ
      };
    } else {
      modelPosition.value = {
        x: config.width / 2 - centerX,
        y: -bottomY,
        z: config.depth / 2 - centerZ
      };
    }

    validateBounds();
  }

  function layFlat(): void {
    modelRotationDeg.value = { x: 0, y: 0, z: 0 };
    autoCenterAndDrop();
  }

  return {
    config,
    modelBounds,
    modelPosition,
    modelRotationDeg,
    modelScale,
    isOutsideBounds,
    modelDimensions,
    boundsUtilizationPct,
    setModelBounds,
    translate,
    rotate,
    scale,
    autoCenterAndDrop,
    layFlat,
    validateBounds
  };
}
