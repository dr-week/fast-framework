/**
 * @fileoverview @zuari/hardware/tactical
 * Smart-optic ballistic holdover calculation, 9-axis IMU horizon stream,
 * and high-G recoil impulse ammo counter for smart scopes, airsoft/paintball HUDs, and tactical visors.
 */

import { signal, computed, batch } from '@zuari/signals';
import type { BallisticConfig, BallisticReticle, IMUStream } from '../types.js';

const GRAVITY_MPS2 = 9.80665;

export function createBallisticReticle(config: BallisticConfig = {}): BallisticReticle {
  const rangeMeters = signal(config.rangeMeters ?? 300);
  const windMps = signal(config.windMps ?? 4.5);
  const muzzleVelocityMps = signal(config.muzzleVelocityMps ?? 820);
  const cantDeg = signal(config.cantDeg ?? 0);
  const maxMag = config.magCapacity ?? 30;
  const ammoRemaining = signal(maxMag);
  const shotCount = signal(0);
  const peakRecoilG = signal(0);

  // Compute bullet flight time and vertical drop in MRAD (milliradians)
  const elevationMrad = computed(() => {
    const dist = Math.max(10, rangeMeters.value);
    const vel = Math.max(100, muzzleVelocityMps.value);
    const flightTime = dist / (vel * 0.88); // Drag-adjusted time of flight
    const dropMeters = 0.5 * GRAVITY_MPS2 * flightTime * flightTime;
    const mrad = (dropMeters / dist) * 1000;
    return Number(mrad.toFixed(2));
  });

  // Compute horizontal wind drift + cant offset in MRAD
  const windageMrad = computed(() => {
    const dist = Math.max(10, rangeMeters.value);
    const vel = Math.max(100, muzzleVelocityMps.value);
    const flightTime = dist / (vel * 0.88);
    const lagTime = flightTime - dist / vel;
    const driftMeters = windMps.value * lagTime;
    const cantRad = (cantDeg.value * Math.PI) / 180;
    const cantShift = Math.sin(cantRad) * elevationMrad.value;
    const totalMrad = (driftMeters / dist) * 1000 + cantShift;
    return Number(totalMrad.toFixed(2));
  });

  // SVG 200x200 viewport coordinates (100, 100 is center bore crosshair)
  const aimX = computed(() => {
    const raw = 100 + windageMrad.value * 8;
    return Number(Math.max(20, Math.min(180, raw)).toFixed(1));
  });

  const aimY = computed(() => {
    const raw = 100 + elevationMrad.value * 6;
    return Number(Math.max(20, Math.min(185, raw)).toFixed(1));
  });

  function triggerShotImpulse(gForce = 14.5): boolean {
    if (ammoRemaining.value <= 0) {
      return false;
    }
    batch(() => {
      ammoRemaining.value = Math.max(0, ammoRemaining.value - 1);
      shotCount.value = shotCount.value + 1;
      peakRecoilG.value = Number(Math.max(peakRecoilG.value, gForce).toFixed(1));
    });
    return true;
  }

  function reloadMagazine(): void {
    batch(() => {
      ammoRemaining.value = maxMag;
      peakRecoilG.value = 0;
    });
  }

  return {
    rangeMeters,
    windMps,
    muzzleVelocityMps,
    cantDeg,
    ammoRemaining,
    shotCount,
    peakRecoilG,
    elevationMrad,
    windageMrad,
    aimX,
    aimY,
    triggerShotImpulse,
    reloadMagazine
  };
}

export function createIMUStream(initial = { roll: 0, pitch: 0, yaw: 0, gForce: 1.0 }): IMUStream {
  const roll = signal(initial.roll);
  const pitch = signal(initial.pitch);
  const yaw = signal(initial.yaw);
  const gForce = signal(initial.gForce);

  const horizonTransform = computed(() => {
    const r = (-roll.value).toFixed(2);
    const p = (pitch.value * 1.8).toFixed(2);
    return `translate3d(0px, ${p}px, 0px) rotate(${r}deg)`;
  });

  function ingestPacket(packet: Float32Array | number[]): void {
    batch(() => {
      if (packet[0] !== undefined) roll.value = Number(packet[0].toFixed(2));
      if (packet[1] !== undefined) pitch.value = Number(packet[1].toFixed(2));
      if (packet[2] !== undefined) yaw.value = Number(((packet[2] % 360 + 360) % 360).toFixed(1));
      if (packet[3] !== undefined) gForce.value = Number(packet[3].toFixed(2));
    });
  }

  return {
    roll,
    pitch,
    yaw,
    gForce,
    horizonTransform,
    ingestPacket
  };
}
