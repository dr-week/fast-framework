/**
 * @fileoverview Modular types for @zuari/hardware.
 * Covers tactical ballistics, drone/FPV telemetry, handheld gaming/rotary inputs,
 * KaiOS/dumbphone D-Pad navigation, smart appliance MQTT/kiosk watchdogs, and waveguide/E-Ink displays.
 */

import type { Signal, Computed } from '@zuari/signals';

// 1. Tactical, Ballistic & 9-Axis IMU Types
export interface BallisticConfig {
  /** Initial target distance in meters */
  rangeMeters?: number;
  /** Crosswind speed in m/s (positive = right-to-left) */
  windMps?: number;
  /** Muzzle velocity in m/s (default 820 m/s) */
  muzzleVelocityMps?: number;
  /** Rifle cant/roll angle in degrees */
  cantDeg?: number;
  /** Magazine capacity for recoil shot counter */
  magCapacity?: number;
}

export interface BallisticReticle {
  rangeMeters: Signal<number>;
  windMps: Signal<number>;
  muzzleVelocityMps: Signal<number>;
  cantDeg: Signal<number>;
  ammoRemaining: Signal<number>;
  shotCount: Signal<number>;
  peakRecoilG: Signal<number>;
  /** Computed vertical holdover drop in milliradians (MRAD) */
  elevationMrad: Computed<number>;
  /** Computed horizontal wind drift in milliradians (MRAD) */
  windageMrad: Computed<number>;
  /** Computed SVG reticle aimpoint X coordinate (centered at 100) */
  aimX: Computed<number>;
  /** Computed SVG reticle aimpoint Y coordinate (centered at 100) */
  aimY: Computed<number>;
  /** Simulates or records a high-G accelerometer recoil impulse */
  triggerShotImpulse: (gForce?: number) => boolean;
  reloadMagazine: () => void;
}

export interface IMUStream {
  roll: Signal<number>;
  pitch: Signal<number>;
  yaw: Signal<number>;
  gForce: Signal<number>;
  /** Computed CSS transform string for artificial horizon ladder */
  horizonTransform: Computed<string>;
  /** Feed raw 6-DOF or 9-DOF float packet [roll, pitch, yaw, gForce] */
  ingestPacket: (packet: Float32Array | number[]) => void;
}

// 2. Drone, FPV OSD & MAVLink/CRSF Binary Telemetry Types
export type FlightMode = 'ACRO' | 'STAB' | 'RTH' | 'LOITER' | 'ARMED' | 'DISARMED';

export interface DroneTelemetry {
  batteryVoltage: Signal<number>;
  cellCount: Signal<number>;
  cellVoltage: Computed<number>;
  rssiDbm: Signal<number>;
  linkQualityPct: Signal<number>;
  altitudeMeters: Signal<number>;
  groundSpeedKmh: Signal<number>;
  homeDistanceMeters: Signal<number>;
  homeBearingDeg: Signal<number>;
  flightMode: Signal<FlightMode>;
  isLowBatteryWarning: Computed<boolean>;
  /** Zero-copy binary packet decoder (16-byte compact telemetry frame) */
  decodeBinaryFrame: (buffer: ArrayBuffer | Uint8Array) => void;
}

// 3. Handheld Gaming, Rotary Scroll-Wheel (Rabbit R1 / Playdate Crank) & Gamepad Types
export interface RotarySignalOptions {
  min?: number;
  max?: number;
  step?: number;
  initial?: number;
  wrap?: boolean;
}

export interface RotaryController {
  value: Signal<number>;
  detentDelta: Signal<number>;
  totalClicks: Signal<number>;
  pttPressed: Signal<boolean>;
  rotateSteps: (steps: number) => void;
  setPttState: (pressed: boolean) => void;
  bindToElement: (el: HTMLElement | Window) => () => void;
}

export interface GamepadSignalState {
  connected: Signal<boolean>;
  leftStickX: Signal<number>;
  leftStickY: Signal<number>;
  rightStickX: Signal<number>;
  rightStickY: Signal<number>;
  leftTrigger: Signal<number>;
  rightTrigger: Signal<number>;
  buttonsMask: Signal<number>;
  updateFromAxes: (lx: number, ly: number, rx: number, ry: number, lt?: number, rt?: number, mask?: number) => void;
}

// 4. KaiOS, Dumbphone & Feature Phone D-Pad / T9 / SoftKey Types
export interface SoftKeyLabels {
  left: string;
  center: string;
  right: string;
}

export interface DpadNavOptions {
  itemCount: number;
  columns?: number;
  wrap?: boolean;
  initialIndex?: number;
  defaultSoftKeys?: SoftKeyLabels;
  onSelect?: (index: number) => void;
  onSoftLeft?: (index: number) => void;
  onSoftRight?: (index: number) => void;
}

export interface DpadNavigator {
  focusedIndex: Signal<number>;
  softKeys: Signal<SoftKeyLabels>;
  t9Buffer: Signal<string>;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  selectCurrent: () => void;
  pressT9Digit: (digit: string) => void;
  clearT9: () => void;
  handleKeyEvent: (key: string) => boolean;
}

// 5. Smart Fridge, Kitchen Appliance, MQTT & Always-On Kiosk Types
export interface ApplianceBridge {
  topics: Map<string, Signal<string | number | boolean>>;
  pixelShiftOffset: Signal<{ x: number; y: number }>;
  isAmbientSleep: Signal<boolean>;
  uptimeTicks: Signal<number>;
  subscribeTopic: <T extends string | number | boolean>(topic: string, initialValue: T) => Signal<T>;
  publishPacket: (topic: string, payload: string | number | boolean) => void;
  triggerPixelOrbitTick: () => void;
  disposeAll: () => void;
}

// 6. Futuristic Optical Waveguide, NVG, Thermal & E-Ink Display Modes
export type HardwareDisplayPreset =
  | 'standard'
  | 'waveguide-green' // Even Realities G1 / HUD 530nm Monochrome
  | 'nvg-phosphor'    // Tactical White/Green Night Vision
  | 'thermal-flir'    // Amber/Ironbow Thermal Optic
  | 'laser-pin'       // High-contrast Cyan Laser Palm Projection
  | 'eink-1bit';      // Mudita / Light Phone / Kindle Bistable 1-bit E-Ink

export interface DisplayModeController {
  mode: Signal<HardwareDisplayPreset>;
  contrastBoost: Signal<number>;
  isMonochromeOptic: Computed<boolean>;
  isBistableEink: Computed<boolean>;
  cssVariables: Computed<Record<string, string>>;
  applyToElement: (target: HTMLElement) => () => void;
}

// 7. Additive Manufacturing / 3D Printer (Klipper / Marlin / Moonraker / RepRap) Types
export type PrinterState = 'STANDBY' | 'HEATING' | 'PRINTING' | 'PAUSED' | 'ERROR' | 'COMPLETE';

export interface PrinterTelemetry {
  state: Signal<PrinterState>;
  hotendTemp: Signal<number>;
  hotendTarget: Signal<number>;
  bedTemp: Signal<number>;
  bedTarget: Signal<number>;
  chamberTemp: Signal<number>;
  printProgressPct: Signal<number>;
  layerCurrent: Signal<number>;
  layerTotal: Signal<number>;
  fanSpeedPct: Signal<number>;
  feedRatePct: Signal<number>;
  flowRatePct: Signal<number>;
  timeElapsedSec: Signal<number>;
  timeRemainingSec: Signal<number>;
  position: Signal<{ x: number; y: number; z: number; e: number }>;
  isHotendTargetReached: Computed<boolean>;
  isBedTargetReached: Computed<boolean>;
  isActivelyPrinting: Computed<boolean>;
  formattedRemainingTime: Computed<string>;
  
  // Commands & Ingestion
  ingestGcodeResponse: (response: string) => void;
  ingestMoonrakerStatus: (status: Partial<{
    print_stats: { state: string; print_duration: number; filename: string };
    extruder: { temperature: number; target: number };
    heater_bed: { temperature: number; target: number };
    display_status: { progress: number };
    toolhead: { position: [number, number, number, number] };
  }>) => void;
  generateGcodeCommand: (cmd: string) => string;
  setHotendTargetTemp: (celsius: number) => string;
  setBedTargetTemp: (celsius: number) => string;
  homeAxes: (axes?: 'ALL' | 'X' | 'Y' | 'Z') => string;
  emergencyStop: () => string;
}

