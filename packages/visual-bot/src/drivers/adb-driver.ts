/**
 * @fileoverview Platform-Agnostic Android ADB Driver.
 * Accepts an injectable command executor so it remains 100% browser-bundle-safe
 * and unit-testable while supporting real `adb` CLI execution in Node/Tauri/Electron.
 */

import type { BotDriver } from './interface.js';

export type ShellExecutor = (command: string) => Promise<{ stdout: string; stderr?: string }>;

export interface AndroidAppSpec {
  package: string;
  activity: string;
  name: string;
}

export interface AdbDeviceInfo {
  id: string;
  state: string;
  isEmulator: boolean;
}

export interface AdbDriverOptions {
  exec: ShellExecutor;
  deviceId?: string;
  adbPath?: string;
  appRegistry?: Record<string, AndroidAppSpec>;
}

export interface AdbBotDriver extends BotDriver {
  listDevices: () => Promise<AdbDeviceInfo[]>;
  isDeviceReady: () => Promise<boolean>;
  launchApp: (appKey: string) => Promise<{ success: boolean; command?: string; error?: string }>;
  swipe: (x1: number, y1: number, x2: number, y2: number, durationMs?: number) => Promise<void>;
}

function escapeAdbText(text: string): string {
  return text.replace(/([&|;<>()$`\\"'*?[\]#~=%])/g, '\\$1').replace(/ /g, '%s');
}

export function createAdbDriver(options: AdbDriverOptions): AdbBotDriver {
  const adb = options.adbPath || 'adb';
  const prefix = options.deviceId ? `"${adb}" -s ${options.deviceId}` : `"${adb}"`;
  const apps = options.appRegistry ?? {};

  async function listDevices(): Promise<AdbDeviceInfo[]> {
    const { stdout } = await options.exec(`"${adb}" devices`);
    const lines = stdout
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const devices: AdbDeviceInfo[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const parts = line.split(/\s+/);
      const id = parts[0];
      const state = parts[1];
      if (id && state) {
        devices.push({ id, state, isEmulator: id.startsWith('emulator-') });
      }
    }
    return devices;
  }

  async function isDeviceReady(): Promise<boolean> {
    const devices = await listDevices();
    return devices.some((d) => d.state === 'device');
  }

  async function launchApp(
    appKey: string
  ): Promise<{ success: boolean; command?: string; error?: string }> {
    const spec = apps[appKey];
    if (!spec) return { success: false, error: `Unknown Android app key: ${appKey}` };
    const command = `${prefix} shell monkey -p ${spec.package} -c android.intent.category.LAUNCHER 1`;
    await options.exec(command);
    return { success: true, command };
  }

  async function swipe(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    durationMs = 280
  ): Promise<void> {
    await options.exec(
      `${prefix} shell input swipe ${Math.round(x1)} ${Math.round(y1)} ${Math.round(x2)} ${Math.round(y2)} ${Math.round(durationMs)}`
    );
  }

  return {
    name: 'android-adb',
    listDevices,
    isDeviceReady,
    launchApp,
    swipe,

    async move(): Promise<void> {
      // Touch screens do not require hover moves before tap
    },

    async click(x: number, y: number): Promise<void> {
      await options.exec(`${prefix} shell input tap ${Math.round(x)} ${Math.round(y)}`);
    },

    async type(text: string): Promise<void> {
      await options.exec(`${prefix} shell input text "${escapeAdbText(text)}"`);
    },

    async scroll(deltaY: number): Promise<void> {
      const startY = deltaY >= 0 ? 1200 : 400;
      const endY = Math.max(100, Math.min(1800, startY - Math.round(deltaY)));
      await swipe(540, startY, 540, endY, 260);
    },
  };
}
