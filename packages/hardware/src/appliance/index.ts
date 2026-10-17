/**
 * @fileoverview @zuari/hardware/appliance
 * Smart fridge screens, kitchen appliances, automotive IVI, MQTT/Matter topic signal bridge,
 * and 30-day zero-leak OLED pixel-orbit burn-in prevention watchdog.
 */

import { signal, batch, type Signal } from '@zuari/signals';
import type { ApplianceBridge } from '../types.js';

const ORBIT_COORDS: Array<{ x: number; y: number }> = [
  { x: 0, y: 0 },
  { x: 2, y: 1 },
  { x: 2, y: -1 },
  { x: 0, y: -2 },
  { x: -2, y: -1 },
  { x: -2, y: 1 }
];

export function createApplianceBridge(): ApplianceBridge {
  const topics = new Map<string, Signal<string | number | boolean>>();
  const pixelShiftOffset = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  const isAmbientSleep = signal(false);
  const uptimeTicks = signal(0);

  let orbitIdx = 0;

  function subscribeTopic<T extends string | number | boolean>(
    topic: string,
    initialValue: T
  ): Signal<T> {
    const existing = topics.get(topic);
    if (existing) {
      return existing as Signal<T>;
    }
    const sig = signal<string | number | boolean>(initialValue);
    topics.set(topic, sig);
    return sig as Signal<T>;
  }

  function publishPacket(topic: string, payload: string | number | boolean): void {
    const existing = topics.get(topic);
    if (existing) {
      existing.value = payload;
    } else {
      topics.set(topic, signal(payload));
    }
  }

  function triggerPixelOrbitTick(): void {
    batch(() => {
      orbitIdx = (orbitIdx + 1) % ORBIT_COORDS.length;
      pixelShiftOffset.value = ORBIT_COORDS[orbitIdx] ?? { x: 0, y: 0 };
      uptimeTicks.value += 1;
    });
  }

  function disposeAll(): void {
    topics.clear();
    pixelShiftOffset.value = { x: 0, y: 0 };
    isAmbientSleep.value = false;
  }

  return {
    topics,
    pixelShiftOffset,
    isAmbientSleep,
    uptimeTicks,
    subscribeTopic,
    publishPacket,
    triggerPixelOrbitTick,
    disposeAll
  };
}
