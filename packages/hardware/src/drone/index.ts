/**
 * @fileoverview @zuari/hardware/drone
 * Zero-copy binary MAVLink/CRSF-style drone telemetry stream and FPV OSD (On-Screen Display) state.
 */

import { signal, computed, batch } from '@zuari/signals';
import type { DroneTelemetry, FlightMode } from '../types.js';

const FLIGHT_MODES: FlightMode[] = ['ACRO', 'STAB', 'RTH', 'LOITER', 'ARMED', 'DISARMED'];

export function createDroneTelemetry(): DroneTelemetry {
  const batteryVoltage = signal(24.4); // 6S LiPo pack default
  const cellCount = signal(6);
  const rssiDbm = signal(-58);
  const linkQualityPct = signal(99);
  const altitudeMeters = signal(84.5);
  const groundSpeedKmh = signal(72.4);
  const homeDistanceMeters = signal(420);
  const homeBearingDeg = signal(145);
  const flightMode = signal<FlightMode>('ACRO');

  const cellVoltage = computed(() => {
    const cells = Math.max(1, cellCount.value);
    return Number((batteryVoltage.value / cells).toFixed(2));
  });

  const isLowBatteryWarning = computed(() => cellVoltage.value < 3.55);

  /**
   * Decodes a compact 16-byte binary drone telemetry packet directly without JSON serialization:
   * - Offset 0 (f32): batteryVoltage
   * - Offset 4 (f32): altitudeMeters
   * - Offset 8 (f32): groundSpeedKmh
   * - Offset 12 (i8): rssiDbm
   * - Offset 13 (u8): linkQualityPct
   * - Offset 14 (u8): flightMode enum index
   * - Offset 15 (u8): cellCount
   */
  function decodeBinaryFrame(buffer: ArrayBuffer | Uint8Array): void {
    const rawBuf = buffer instanceof Uint8Array ? buffer.buffer : buffer;
    const byteOffset = buffer instanceof Uint8Array ? buffer.byteOffset : 0;
    if (rawBuf.byteLength - byteOffset < 16) {
      return;
    }

    const view = new DataView(rawBuf, byteOffset, 16);
    batch(() => {
      batteryVoltage.value = Number(view.getFloat32(0, true).toFixed(2));
      altitudeMeters.value = Number(view.getFloat32(4, true).toFixed(1));
      groundSpeedKmh.value = Number(view.getFloat32(8, true).toFixed(1));
      rssiDbm.value = view.getInt8(12);
      linkQualityPct.value = Math.min(100, Math.max(0, view.getUint8(13)));
      const modeIdx = view.getUint8(14) % FLIGHT_MODES.length;
      flightMode.value = FLIGHT_MODES[modeIdx] ?? 'ACRO';
      const cells = view.getUint8(15);
      if (cells >= 1 && cells <= 12) {
        cellCount.value = cells;
      }
    });
  }

  return {
    batteryVoltage,
    cellCount,
    cellVoltage,
    rssiDbm,
    linkQualityPct,
    altitudeMeters,
    groundSpeedKmh,
    homeDistanceMeters,
    homeBearingDeg,
    flightMode,
    isLowBatteryWarning,
    decodeBinaryFrame
  };
}

/**
 * Helper to encode a 16-byte binary telemetry frame for testing or WebSerial/UDP bridges.
 */
export function encodeDroneBinaryFrame(data: {
  voltage: number;
  altitude: number;
  speed: number;
  rssi: number;
  lq: number;
  modeIndex?: number;
  cells?: number;
}): ArrayBuffer {
  const buf = new ArrayBuffer(16);
  const view = new DataView(buf);
  view.setFloat32(0, data.voltage, true);
  view.setFloat32(4, data.altitude, true);
  view.setFloat32(8, data.speed, true);
  view.setInt8(12, data.rssi);
  view.setUint8(13, data.lq);
  view.setUint8(14, data.modeIndex ?? 0);
  view.setUint8(15, data.cells ?? 6);
  return buf;
}
