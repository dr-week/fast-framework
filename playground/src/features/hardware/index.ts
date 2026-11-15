import { signal, effect } from '@zuari/signals';
import {
  createBallisticReticle,
  createIMUStream,
  createDroneTelemetry,
  createRotaryController,
  createDpadNav,
  createApplianceBridge,
  createDisplayMode,
  createPrinterTelemetry,
  type HardwareDisplayPreset
} from '@zuari/hardware';
import { renderTacticalPanel, renderDronePanel } from './panels/tactical-drone.js';
import { renderKaiosPanel, renderRotaryPanel } from './panels/embedded-controls.js';
import { renderAppliancePanel, renderPrinterPanel } from './panels/iot-printer.js';

type HardwareSubTab = 'tactical' | 'drone' | 'kaios' | 'rotary' | 'appliance' | 'printer';

const SUB_TABS: Array<{ id: HardwareSubTab; label: string }> = [
  { id: 'tactical', label: 'Tactical / Optics' },
  { id: 'drone', label: 'FPV Drone OSD' },
  { id: 'kaios', label: 'KaiOS / T9 D-Pad' },
  { id: 'rotary', label: 'Rotary / Handheld' },
  { id: 'appliance', label: 'Fridge / Kiosk IoT' },
  { id: 'printer', label: '3D Printer / G-code' }
];

const DISPLAY_PRESETS: Array<{ id: HardwareDisplayPreset; label: string }> = [
  { id: 'standard', label: 'Display: Standard OLED' },
  { id: 'waveguide-green', label: 'Optic: 530nm Waveguide HUD' },
  { id: 'nvg-phosphor', label: 'Optic: Night-Vision (NVG)' },
  { id: 'thermal-flir', label: 'Optic: Thermal FLIR' },
  { id: 'laser-pin', label: 'Optic: Laser Palm Projection' },
  { id: 'eink-1bit', label: 'Panel: 1-Bit E-Ink (0ms)' }
];

const KAIOS_MENU = [
  '1. Local AI Voice Note',
  '2. Mesh Radio (LoRa)',
  '3. Offline Maps',
  '4. Battery: 94% (14d)',
  '5. Torch / Laser',
  '6. System Settings'
];

export function createHardwareLabView(onInteraction: () => void): HTMLElement {
  const shell = document.createElement('div');
  shell.className = 'hw-lab-shell';

  const activeSubTab = signal<HardwareSubTab>('tactical');
  const displayCtrl = createDisplayMode('standard');
  displayCtrl.applyToElement(shell);

  const reticle = createBallisticReticle({ rangeMeters: 350, windMps: 5.5, magCapacity: 30 });
  const imu = createIMUStream({ roll: 4, pitch: -2, yaw: 185, gForce: 1.0 });
  const drone = createDroneTelemetry();

  const lastSelectedMenu = signal('None');
  const dpad = createDpadNav({
    itemCount: KAIOS_MENU.length,
    columns: 1,
    onSelect: (idx) => {
      lastSelectedMenu.value = KAIOS_MENU[idx] ?? 'Selected';
      onInteraction();
    }
  });

  const rotary = createRotaryController({ min: 0, max: 100, step: 5, initial: 45, wrap: true });

  const appliance = createApplianceBridge();
  const freezerTemp = appliance.subscribeTopic('fridge/freezer/tempC', -19);
  const chillerTemp = appliance.subscribeTopic('fridge/chiller/tempC', 3);
  const doorState = appliance.subscribeTopic('fridge/door/status', 'SEALED');

  const printer = createPrinterTelemetry('PRINTING');
  printer.hotendTemp.value = 215;
  printer.hotendTarget.value = 215;
  printer.bedTemp.value = 60;
  printer.bedTarget.value = 60;
  printer.printProgressPct.value = 42;
  printer.timeElapsedSec.value = 2520;
  printer.timeRemainingSec.value = 3480;

  const topBar = document.createElement('div');
  topBar.className = 'hw-lab-topbar';

  const tabGroup = document.createElement('div');
  tabGroup.className = 'repl-preset-tabs';

  SUB_TABS.forEach((tab) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'repl-preset-btn';
    btn.textContent = tab.label;
    effect(() => {
      btn.setAttribute('data-active', String(activeSubTab.value === tab.id));
    });
    btn.addEventListener('click', () => {
      activeSubTab.value = tab.id;
      onInteraction();
    });
    tabGroup.appendChild(btn);
  });

  const displaySelect = document.createElement('select');
  displaySelect.className = 'hw-display-select';
  displaySelect.setAttribute('aria-label', 'Hardware Optical Display Mode');
  DISPLAY_PRESETS.forEach((preset) => {
    const opt = document.createElement('option');
    opt.value = preset.id;
    opt.textContent = preset.label;
    displaySelect.appendChild(opt);
  });
  displaySelect.addEventListener('change', () => {
    displayCtrl.mode.value = displaySelect.value as HardwareDisplayPreset;
    onInteraction();
  });

  topBar.append(tabGroup, displaySelect);
  shell.appendChild(topBar);

  const stage = document.createElement('div');
  stage.className = 'hw-lab-stage';
  shell.appendChild(stage);

  let activeCleanup: (() => void) | null = null;
  const panelRenderers: Record<HardwareSubTab, () => () => void> = {
    tactical: () => renderTacticalPanel(stage, reticle, imu, onInteraction),
    drone: () => renderDronePanel(stage, drone, imu, onInteraction),
    kaios: () => renderKaiosPanel(stage, dpad, KAIOS_MENU, lastSelectedMenu, onInteraction),
    rotary: () => renderRotaryPanel(stage, rotary, onInteraction),
    appliance: () => renderAppliancePanel(stage, appliance, freezerTemp, chillerTemp, doorState, onInteraction),
    printer: () => renderPrinterPanel(stage, printer, onInteraction)
  };

  effect(() => {
    const sub = activeSubTab.value;
    activeCleanup?.();
    activeCleanup = null;
    stage.innerHTML = '';
    activeCleanup = panelRenderers[sub]();
  });

  return shell;
}
