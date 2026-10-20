/**
 * @fileoverview Network Telemetry, Wi-Fi RSSI Radar & Stream Monitor for @zuari/hardware.
 * Extracted and generalized from CamScan surveillance & telemetry engineering.
 * Provides fine-grained reactive signals for:
 * - Real-time Wi-Fi RSSI dBm signal tracking & signal quality percent
 * - Radar hot/cold color mapping & distance estimation
 * - Network latency (ping ms), jitter, and packet loss
 * - WebRTC / RTSP camera stream FPS, bitrate, and frame health
 */

import { signal, computed, type Signal, type Computed } from '@zuari/signals';

export interface WifiRssiState {
  readonly rssiDbm: Signal<number>;
  readonly frequencyGhz: Signal<2.4 | 5.0 | 6.0>;
  readonly signalQualityPct: Computed<number>;
  readonly estimatedDistanceMeters: Computed<number>;
  readonly radarColor: Computed<string>;
  
  ingestDbm(dbm: number): void;
  setFrequency(freq: 2.4 | 5.0 | 6.0): void;
}

export function createWifiRssiSignal(initialDbm = -55, freq: 2.4 | 5.0 | 6.0 = 5.0): WifiRssiState {
  const rssiDbm = signal<number>(initialDbm);
  const frequencyGhz = signal<2.4 | 5.0 | 6.0>(freq);

  // Convert dBm (-100 to -30) to normalized 0-100% quality
  const signalQualityPct = computed<number>(() => {
    const dbm = rssiDbm.value;
    if (dbm <= -100) return 0;
    if (dbm >= -30) return 100;
    // Standard logarithmic-to-linear conversion curve
    return Math.round(2 * (dbm + 100));
  });

  // Free-space path loss formula for distance estimation
  // d = 10 ^ ((27.55 - (20 * log10(f_mhz)) + abs(rssi)) / 20)
  const estimatedDistanceMeters = computed<number>(() => {
    const fMhz = frequencyGhz.value === 2.4 ? 2412 : (frequencyGhz.value === 5.0 ? 5200 : 6000);
    const dbm = rssiDbm.value;
    const exp = (27.55 - (20 * Math.log10(fMhz)) + Math.abs(dbm)) / 20.0;
    const dist = Math.pow(10, exp);
    return Number(Math.max(0.1, dist).toFixed(1));
  });

  // Radar color palette mapping (from cold blue to neon green to danger red)
  const radarColor = computed<string>(() => {
    const pct = signalQualityPct.value;
    if (pct >= 75) return '#00ff88'; // Strong / Near: Neon Emerald
    if (pct >= 50) return '#00d2ff'; // Medium / Healthy: Cyan Blue
    if (pct >= 30) return '#ffaa00'; // Weak: Amber Warning
    return '#ff3344';                 // Poor / Fringe: Danger Crimson
  });

  function ingestDbm(dbm: number): void {
    rssiDbm.value = Math.max(-120, Math.min(0, dbm));
  }

  function setFrequency(f: 2.4 | 5.0 | 6.0): void {
    frequencyGhz.value = f;
  }

  return {
    rssiDbm,
    frequencyGhz,
    signalQualityPct,
    estimatedDistanceMeters,
    radarColor,
    ingestDbm,
    setFrequency
  };
}

export interface StreamTelemetry {
  readonly fps: Signal<number>;
  readonly bitrateKbps: Signal<number>;
  readonly latencyMs: Signal<number>;
  readonly droppedFrames: Signal<number>;
  readonly isHealthy: Computed<boolean>;
  
  ingestStats(stats: { fps?: number; bitrateKbps?: number; latencyMs?: number; droppedFrames?: number }): void;
}

export function createStreamTelemetry(): StreamTelemetry {
  const fps = signal<number>(30);
  const bitrateKbps = signal<number>(2500);
  const latencyMs = signal<number>(45);
  const droppedFrames = signal<number>(0);

  const isHealthy = computed<boolean>(() => {
    return fps.value >= 15 && latencyMs.value < 250;
  });

  function ingestStats(stats: { fps?: number; bitrateKbps?: number; latencyMs?: number; droppedFrames?: number }): void {
    if (typeof stats.fps === 'number') fps.value = stats.fps;
    if (typeof stats.bitrateKbps === 'number') bitrateKbps.value = stats.bitrateKbps;
    if (typeof stats.latencyMs === 'number') latencyMs.value = stats.latencyMs;
    if (typeof stats.droppedFrames === 'number') droppedFrames.value = stats.droppedFrames;
  }

  return {
    fps,
    bitrateKbps,
    latencyMs,
    droppedFrames,
    isHealthy,
    ingestStats
  };
}
