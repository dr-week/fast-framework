/**
 * @fileoverview @zuari/hardware/printer
 * 3D Printer telemetry, G-code stream parser, and Klipper/Marlin/Moonraker controller.
 * Fine-grained reactive signals for extruders, heated beds, chamber thermals, progress, and axes.
 */

import { signal, computed, batch } from '@zuari/signals';
import type { PrinterState, PrinterTelemetry } from '../types.js';

export function createPrinterTelemetry(initialState: PrinterState = 'STANDBY'): PrinterTelemetry {
  const state = signal<PrinterState>(initialState);
  const hotendTemp = signal<number>(0);
  const hotendTarget = signal<number>(0);
  const bedTemp = signal<number>(0);
  const bedTarget = signal<number>(0);
  const chamberTemp = signal<number>(0);
  const printProgressPct = signal<number>(0);
  const layerCurrent = signal<number>(0);
  const layerTotal = signal<number>(0);
  const fanSpeedPct = signal<number>(0);
  const feedRatePct = signal<number>(100);
  const flowRatePct = signal<number>(100);
  const timeElapsedSec = signal<number>(0);
  const timeRemainingSec = signal<number>(0);
  const position = signal<{ x: number; y: number; z: number; e: number }>({ x: 0, y: 0, z: 0, e: 0 });

  const isHotendTargetReached = computed(() => {
    if (hotendTarget.value <= 0) return true;
    return Math.abs(hotendTemp.value - hotendTarget.value) <= 1.5;
  });

  const isBedTargetReached = computed(() => {
    if (bedTarget.value <= 0) return true;
    return Math.abs(bedTemp.value - bedTarget.value) <= 1.0;
  });

  const isActivelyPrinting = computed(() => {
    return state.value === 'PRINTING' || state.value === 'HEATING';
  });

  const formattedRemainingTime = computed(() => {
    const totalSec = Math.max(0, Math.floor(timeRemainingSec.value));
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  });

  /**
   * Parses standard Marlin/RepRap G-code responses (e.g. M105 temperature responses):
   * "ok T:215.4 /215.0 B:60.2 /60.0 C:35.0 @:64 B@:0"
   */
  function ingestGcodeResponse(response: string): void {
    batch(() => {
      // Parse Extruder: T:215.4 /215.0
      const tMatch = response.match(/T:([0-9\.]+)\s*(?:\/([0-9\.]+))?/);
      if (tMatch) {
        if (tMatch[1] !== undefined) hotendTemp.value = parseFloat(tMatch[1]);
        if (tMatch[2] !== undefined) hotendTarget.value = parseFloat(tMatch[2]);
      }

      // Parse Bed: B:60.2 /60.0
      const bMatch = response.match(/B:([0-9\.]+)\s*(?:\/([0-9\.]+))?/);
      if (bMatch) {
        if (bMatch[1] !== undefined) bedTemp.value = parseFloat(bMatch[1]);
        if (bMatch[2] !== undefined) bedTarget.value = parseFloat(bMatch[2]);
      }

      // Parse Chamber: C:35.0
      const cMatch = response.match(/C:([0-9\.]+)/);
      if (cMatch && cMatch[1] !== undefined) {
        chamberTemp.value = parseFloat(cMatch[1]);
      }

      // Parse Coordinates: X:120.00 Y:45.50 Z:12.30 E:5.20
      const posMatch = response.match(/X:([0-9\.\-]+)\s+Y:([0-9\.\-]+)\s+Z:([0-9\.\-]+)(?:\s+E:([0-9\.\-]+))?/);
      if (posMatch) {
        position.value = {
          x: parseFloat(posMatch[1] ?? '0'),
          y: parseFloat(posMatch[2] ?? '0'),
          z: parseFloat(posMatch[3] ?? '0'),
          e: parseFloat(posMatch[4] ?? '0')
        };
      }
    });
  }

  /**
   * Ingests Moonraker / Klipper JSON-RPC object notifications directly
   */
  function ingestMoonrakerStatus(status: Parameters<PrinterTelemetry['ingestMoonrakerStatus']>[0]): void {
    batch(() => {
      if (status.print_stats) {
        const rawState = status.print_stats.state?.toUpperCase();
        if (rawState === 'PRINTING') state.value = 'PRINTING';
        else if (rawState === 'PAUSED') state.value = 'PAUSED';
        else if (rawState === 'COMPLETE') state.value = 'COMPLETE';
        else if (rawState === 'STANDBY') state.value = 'STANDBY';
        else if (rawState === 'ERROR') state.value = 'ERROR';

        if (typeof status.print_stats.print_duration === 'number') {
          timeElapsedSec.value = status.print_stats.print_duration;
        }
      }

      if (status.extruder) {
        if (typeof status.extruder.temperature === 'number') hotendTemp.value = status.extruder.temperature;
        if (typeof status.extruder.target === 'number') hotendTarget.value = status.extruder.target;
      }

      if (status.heater_bed) {
        if (typeof status.heater_bed.temperature === 'number') bedTemp.value = status.heater_bed.temperature;
        if (typeof status.heater_bed.target === 'number') bedTarget.value = status.heater_bed.target;
      }

      if (status.display_status && typeof status.display_status.progress === 'number') {
        const pct = Math.round(status.display_status.progress * 100);
        printProgressPct.value = pct;
        if (pct > 0 && timeElapsedSec.value > 0) {
          const totalEstimated = (timeElapsedSec.value / pct) * 100;
          timeRemainingSec.value = Math.max(0, totalEstimated - timeElapsedSec.value);
        }
      }

      if (status.toolhead && Array.isArray(status.toolhead.position)) {
        const [x, y, z, e] = status.toolhead.position;
        position.value = { x: x ?? 0, y: y ?? 0, z: z ?? 0, e: e ?? 0 };
      }
    });
  }

  function generateGcodeCommand(cmd: string): string {
    return `${cmd.trim()}\n`;
  }

  function setHotendTargetTemp(celsius: number): string {
    hotendTarget.value = celsius;
    return `M104 S${Math.round(celsius)}\n`;
  }

  function setBedTargetTemp(celsius: number): string {
    bedTarget.value = celsius;
    return `M140 S${Math.round(celsius)}\n`;
  }

  function homeAxes(axes: 'ALL' | 'X' | 'Y' | 'Z' = 'ALL'): string {
    if (axes === 'ALL') return 'G28\n';
    return `G28 ${axes}\n`;
  }

  function emergencyStop(): string {
    state.value = 'ERROR';
    return 'M112\n';
  }

  return {
    state,
    hotendTemp,
    hotendTarget,
    bedTemp,
    bedTarget,
    chamberTemp,
    printProgressPct,
    layerCurrent,
    layerTotal,
    fanSpeedPct,
    feedRatePct,
    flowRatePct,
    timeElapsedSec,
    timeRemainingSec,
    position,
    isHotendTargetReached,
    isBedTargetReached,
    isActivelyPrinting,
    formattedRemainingTime,
    ingestGcodeResponse,
    ingestMoonrakerStatus,
    generateGcodeCommand,
    setHotendTargetTemp,
    setBedTargetTemp,
    homeAxes,
    emergencyStop
  };
}
