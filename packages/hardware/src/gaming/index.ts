/**
 * @fileoverview @zuari/hardware/gaming
 * Handheld gaming consoles, Rabbit R1 scroll wheel / Playdate crank rotary encoders,
 * PTT (Push-To-Talk) hardware keys, and 240Hz poll-free deadzone Gamepad/HOTAS signal streams.
 */

import { signal, batch } from '@zuari/signals';
import type { RotarySignalOptions, RotaryController, GamepadSignalState } from '../types.js';

export function createRotaryController(options: RotarySignalOptions = {}): RotaryController {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step ?? 1;
  const wrap = options.wrap ?? false;

  const value = signal(options.initial ?? min);
  const detentDelta = signal(0);
  const totalClicks = signal(0);
  const pttPressed = signal(false);

  function rotateSteps(steps: number): void {
    if (steps === 0) return;
    batch(() => {
      let next = value.value + steps * step;
      if (wrap) {
        const span = max - min + step;
        next = ((((next - min) % span) + span) % span) + min;
      } else {
        next = Math.max(min, Math.min(max, next));
      }
      detentDelta.value = steps;
      value.value = Number(next.toFixed(4));
      totalClicks.value += Math.abs(steps);
    });
  }

  function setPttState(pressed: boolean): void {
    pttPressed.value = pressed;
  }

  function bindToElement(target: HTMLElement | Window): () => void {
    const onWheel = (e: Event) => {
      const we = e as WheelEvent;
      const dir = we.deltaY > 0 ? 1 : we.deltaY < 0 ? -1 : 0;
      if (dir !== 0) {
        rotateSteps(dir);
      }
    };

    const onKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'ArrowUp' || ke.key === 'PageUp') {
        rotateSteps(-1);
      } else if (ke.key === 'ArrowDown' || ke.key === 'PageDown') {
        rotateSteps(1);
      } else if (ke.key === ' ' || ke.code === 'Space') {
        setPttState(true);
      }
    };

    const onKeyUp = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === ' ' || ke.code === 'Space') {
        setPttState(false);
      }
    };

    target.addEventListener('wheel', onWheel, { passive: true });
    target.addEventListener('keydown', onKeyDown);
    target.addEventListener('keyup', onKeyUp);

    return () => {
      target.removeEventListener('wheel', onWheel);
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
    };
  }

  return {
    value,
    detentDelta,
    totalClicks,
    pttPressed,
    rotateSteps,
    setPttState,
    bindToElement
  };
}

export function createGamepadSignal(deadzone = 0.08): GamepadSignalState {
  const connected = signal(false);
  const leftStickX = signal(0);
  const leftStickY = signal(0);
  const rightStickX = signal(0);
  const rightStickY = signal(0);
  const leftTrigger = signal(0);
  const rightTrigger = signal(0);
  const buttonsMask = signal(0);

  function filterAxis(raw: number): number {
    if (Math.abs(raw) < deadzone) return 0;
    return Number(Math.max(-1, Math.min(1, raw)).toFixed(3));
  }

  function updateFromAxes(
    lx: number,
    ly: number,
    rx: number,
    ry: number,
    lt = 0,
    rt = 0,
    mask = 0
  ): void {
    batch(() => {
      connected.value = true;
      leftStickX.value = filterAxis(lx);
      leftStickY.value = filterAxis(ly);
      rightStickX.value = filterAxis(rx);
      rightStickY.value = filterAxis(ry);
      leftTrigger.value = Number(Math.max(0, Math.min(1, lt)).toFixed(2));
      rightTrigger.value = Number(Math.max(0, Math.min(1, rt)).toFixed(2));
      buttonsMask.value = mask;
    });
  }

  return {
    connected,
    leftStickX,
    leftStickY,
    rightStickX,
    rightStickY,
    leftTrigger,
    rightTrigger,
    buttonsMask,
    updateFromAxes
  };
}
