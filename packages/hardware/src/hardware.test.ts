import { describe, it, expect, vi } from 'vitest';
import {
  createBallisticReticle,
  createIMUStream,
  createDroneTelemetry,
  encodeDroneBinaryFrame,
  createRotaryController,
  createGamepadSignal,
  createDpadNav,
  createApplianceBridge,
  createDisplayMode
} from './index.js';

describe('@zuari/hardware Modular IoT & Futuristic Hardware Suite', () => {
  it('computes tactical ballistic holdover (MRAD) and tracks high-G recoil impulses', () => {
    const reticle = createBallisticReticle({
      rangeMeters: 400,
      windMps: 6.0,
      muzzleVelocityMps: 800,
      magCapacity: 10
    });

    expect(reticle.elevationMrad.value).toBeGreaterThan(2.0);
    expect(reticle.windageMrad.value).toBeGreaterThan(0);
    expect(reticle.aimY.value).toBeGreaterThan(100);

    // Fire 2 shots
    expect(reticle.triggerShotImpulse(16.2)).toBe(true);
    expect(reticle.triggerShotImpulse(19.8)).toBe(true);
    expect(reticle.ammoRemaining.value).toBe(8);
    expect(reticle.shotCount.value).toBe(2);
    expect(reticle.peakRecoilG.value).toBe(19.8);

    reticle.reloadMagazine();
    expect(reticle.ammoRemaining.value).toBe(10);
  });

  it('streams 9-axis IMU roll/pitch/yaw packets into CSS horizon transforms', () => {
    const imu = createIMUStream();
    imu.ingestPacket([15.5, -10.0, 275.0, 2.4]);

    expect(imu.roll.value).toBe(15.5);
    expect(imu.pitch.value).toBe(-10);
    expect(imu.yaw.value).toBe(275);
    expect(imu.horizonTransform.value).toContain('rotate(-15.50deg)');
  });

  it('decodes zero-copy 16-byte binary drone MAVLink/CRSF frames without JSON', () => {
    const drone = createDroneTelemetry();
    const packet = encodeDroneBinaryFrame({
      voltage: 20.4, // 6S low voltage (3.4V/cell)
      altitude: 142.8,
      speed: 98.6,
      rssi: -64,
      lq: 97,
      modeIndex: 2, // RTH
      cells: 6
    });

    drone.decodeBinaryFrame(packet);
    expect(drone.batteryVoltage.value).toBeCloseTo(20.4, 1);
    expect(drone.cellVoltage.value).toBeCloseTo(3.4, 2);
    expect(drone.isLowBatteryWarning.value).toBe(true);
    expect(drone.altitudeMeters.value).toBeCloseTo(142.8, 1);
    expect(drone.flightMode.value).toBe('RTH');
  });

  it('drives Rabbit R1 / Playdate rotary scroll wheels and 240Hz deadzone gamepads', () => {
    const wheel = createRotaryController({ min: 0, max: 5, initial: 0, wrap: true });
    wheel.rotateSteps(2);
    expect(wheel.value.value).toBe(2);
    wheel.rotateSteps(-3);
    expect(wheel.value.value).toBe(5); // Wrapped around

    const pad = createGamepadSignal(0.1);
    pad.updateFromAxes(0.04, -0.85, 0.5, 0.02, 0.75, 1.0, 0b0101);
    expect(pad.leftStickX.value).toBe(0); // Filtered by deadzone
    expect(pad.leftStickY.value).toBe(-0.85);
    expect(pad.rightTrigger.value).toBe(1);
  });

  it('manages KaiOS / dumbphone D-Pad spatial focus, SoftKeys, and T9 multi-tap input', () => {
    const onSelect = vi.fn();
    const dpad = createDpadNav({ itemCount: 6, columns: 2, onSelect });

    dpad.handleKeyEvent('ArrowDown');
    expect(dpad.focusedIndex.value).toBe(2);
    dpad.handleKeyEvent('ArrowRight');
    expect(dpad.focusedIndex.value).toBe(3);
    dpad.handleKeyEvent('Enter');
    expect(onSelect).toHaveBeenCalledWith(3);

    // Multi-tap T9 on key '2' ('a' -> 'b')
    dpad.pressT9Digit('2');
    expect(dpad.t9Buffer.value).toBe('a');
    dpad.pressT9Digit('2');
    expect(dpad.t9Buffer.value).toBe('b');
  });

  it('routes smart fridge MQTT topics, pixel-orbit burn-in shifts, and waveguide/E-Ink display modes', () => {
    const fridge = createApplianceBridge();
    const freezerTemp = fridge.subscribeTopic('fridge/freezer/tempC', -18);
    expect(freezerTemp.value).toBe(-18);

    fridge.publishPacket('fridge/freezer/tempC', -21);
    expect(freezerTemp.value).toBe(-21);

    fridge.triggerPixelOrbitTick();
    expect(fridge.uptimeTicks.value).toBe(1);
    expect(fridge.pixelShiftOffset.value).toEqual({ x: 2, y: 1 });

    const disp = createDisplayMode('waveguide-green');
    expect(disp.isMonochromeOptic.value).toBe(true);
    expect(disp.cssVariables.value['--hw-fg']).toBe('#00ff66');

    disp.mode.value = 'eink-1bit';
    expect(disp.isBistableEink.value).toBe(true);
  });
});
