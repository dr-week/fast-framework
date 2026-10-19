import { signal, effect } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import {
  createBallisticReticle,
  createIMUStream,
  createDroneTelemetry,
  encodeDroneBinaryFrame,
  createRotaryController,
  createDpadNav,
  createApplianceBridge,
  createDisplayMode,
  createPrinterTelemetry,
  type HardwareDisplayPreset
} from '@zuari/hardware';

type HardwareSubTab = 'tactical' | 'drone' | 'kaios' | 'rotary' | 'appliance' | 'printer';

export function createHardwareLabView(onInteraction: () => void): HTMLElement {
  const shell = document.createElement('div');
  shell.className = 'hw-lab-shell';

  const activeSubTab = signal<HardwareSubTab>('tactical');
  const displayCtrl = createDisplayMode('standard');
  displayCtrl.applyToElement(shell);

  // 1. Tactical Ballistic + IMU State
  const reticle = createBallisticReticle({ rangeMeters: 350, windMps: 5.5, magCapacity: 30 });
  const imu = createIMUStream({ roll: 4, pitch: -2, yaw: 185, gForce: 1.0 });

  // 2. Drone Binary Telemetry State
  const drone = createDroneTelemetry();

  // 3. KaiOS / Dumbphone D-Pad & T9 State
  const kaiosMenu = [
    '1. Local AI Voice Note',
    '2. Mesh Radio (LoRa)',
    '3. Offline Maps',
    '4. Battery: 94% (14d)',
    '5. Torch / Laser',
    '6. System Settings'
  ];
  const lastSelectedMenu = signal('None');
  const dpad = createDpadNav({
    itemCount: kaiosMenu.length,
    columns: 1,
    onSelect: (idx) => {
      lastSelectedMenu.value = kaiosMenu[idx] ?? 'Selected';
      onInteraction();
    }
  });

  // 4. Rotary Scroll-Wheel (Rabbit R1 / Playdate Crank) State
  const rotary = createRotaryController({ min: 0, max: 100, step: 5, initial: 45, wrap: true });

  // 5. Smart Fridge / Appliance MQTT & Burn-In Orbit State
  const appliance = createApplianceBridge();
  const freezerTemp = appliance.subscribeTopic('fridge/freezer/tempC', -19);
  const chillerTemp = appliance.subscribeTopic('fridge/chiller/tempC', 3);
  const doorState = appliance.subscribeTopic('fridge/door/status', 'SEALED');

  // 6. 3D Printer (Marlin / Moonraker) Telemetry State
  const printer = createPrinterTelemetry('PRINTING');
  printer.hotendTemp.value = 215;
  printer.hotendTarget.value = 215;
  printer.bedTemp.value = 60;
  printer.bedTarget.value = 60;
  printer.printProgressPct.value = 42;
  printer.timeElapsedSec.value = 2520;
  printer.timeRemainingSec.value = 3480;

  // Top Bar: Sub-module selector + Optical Waveguide / E-Ink Display Switcher
  const topBar = document.createElement('div');
  topBar.className = 'hw-lab-topbar';

  const subTabs: Array<{ id: HardwareSubTab; label: string }> = [
    { id: 'tactical', label: 'Tactical / Optics' },
    { id: 'drone', label: 'FPV Drone OSD' },
    { id: 'kaios', label: 'KaiOS / T9 D-Pad' },
    { id: 'rotary', label: 'Rotary / Handheld' },
    { id: 'appliance', label: 'Fridge / Kiosk IoT' },
    { id: 'printer', label: '3D Printer / G-code' }
  ];

  const tabGroup = document.createElement('div');
  tabGroup.className = 'repl-preset-tabs';

  subTabs.forEach((t) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'repl-preset-btn';
    btn.textContent = t.label;
    effect(() => {
      btn.setAttribute('data-active', String(activeSubTab.value === t.id));
    });
    btn.addEventListener('click', () => {
      activeSubTab.value = t.id;
      onInteraction();
    });
    tabGroup.appendChild(btn);
  });

  const displaySelect = document.createElement('select');
  displaySelect.className = 'hw-display-select';
  displaySelect.setAttribute('aria-label', 'Hardware Optical Display Mode');
  const presets: Array<{ id: HardwareDisplayPreset; label: string }> = [
    { id: 'standard', label: 'Display: Standard OLED' },
    { id: 'waveguide-green', label: 'Optic: 530nm Waveguide HUD' },
    { id: 'nvg-phosphor', label: 'Optic: Night-Vision (NVG)' },
    { id: 'thermal-flir', label: 'Optic: Thermal FLIR' },
    { id: 'laser-pin', label: 'Optic: Laser Palm Projection' },
    { id: 'eink-1bit', label: 'Panel: 1-Bit E-Ink (0ms)' }
  ];
  presets.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    displaySelect.appendChild(opt);
  });
  displaySelect.addEventListener('change', () => {
    displayCtrl.mode.value = displaySelect.value as HardwareDisplayPreset;
    onInteraction();
  });

  topBar.appendChild(tabGroup);
  topBar.appendChild(displaySelect);
  shell.appendChild(topBar);

  const stage = document.createElement('div');
  stage.className = 'hw-lab-stage';
  shell.appendChild(stage);

  function renderSubModule() {
    stage.innerHTML = '';
    const sub = activeSubTab.value;

    if (sub === 'tactical') {
      const view = html`
        <div class="hw-panel-grid">
          <div class="hw-visor-box">
            <svg viewBox="0 0 200 200" class="hw-reticle-svg">
              <circle cx="100" cy="100" r="88" stroke="currentColor" stroke-width="1" fill="none" stroke-dasharray="4 3" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" stroke-width="0.7" opacity="0.5" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" stroke-width="0.7" opacity="0.5" />
              <circle id="ballistic-pip" cx="100" cy="120" r="6" stroke="currentColor" stroke-width="2" fill="none" />
              <circle id="ballistic-dot" cx="100" cy="120" r="2" fill="currentColor" />
            </svg>
            <div class="hw-visor-telemetry">
              <span>RNG: <strong>${reticle.rangeMeters}m</strong></span>
              <span>DROP: <strong>${reticle.elevationMrad} MRAD</strong></span>
              <span>WIND: <strong>${reticle.windageMrad} MRAD</strong></span>
              <span>MAG: <strong>${reticle.ammoRemaining}/30</strong></span>
            </div>
          </div>

          <div class="hw-controls-col">
            <div class="repl-demo-header">
              <span class="badge-pill">@zuari/hardware/tactical</span>
              <span class="repl-muted">Peak Recoil: ${reticle.peakRecoilG}G</span>
            </div>
            <label class="repl-slider-row">
              <span>Target Range (${reticle.rangeMeters}m)</span>
              <input type="range" min="100" max="1000" step="25" value=${reticle.rangeMeters}
                @input=${(e: Event) => { reticle.rangeMeters.value = Number((e.target as HTMLInputElement).value); onInteraction(); }} />
            </label>
            <label class="repl-slider-row">
              <span>Crosswind (${reticle.windMps} m/s)</span>
              <input type="range" min="-15" max="15" step="0.5" value=${reticle.windMps}
                @input=${(e: Event) => { reticle.windMps.value = Number((e.target as HTMLInputElement).value); onInteraction(); }} />
            </label>
            <label class="repl-slider-row">
              <span>Optic Cant Roll (${imu.roll}°)</span>
              <input type="range" min="-30" max="30" step="1" value=${imu.roll}
                @input=${(e: Event) => {
                  const val = Number((e.target as HTMLInputElement).value);
                  imu.roll.value = val;
                  reticle.cantDeg.value = val;
                  onInteraction();
                }} />
            </label>
            <div class="repl-btn-row">
              <button class="repl-action-btn" @click=${() => { reticle.triggerShotImpulse(18.4); onInteraction(); }}>
                Fire Shot Impulse (-1)
              </button>
              <button class="repl-action-btn secondary" @click=${() => { reticle.reloadMagazine(); onInteraction(); }}>
                Reload Mag
              </button>
            </div>
          </div>
        </div>
      `;
      stage.appendChild(render(view).fragment);

      const pip = stage.querySelector('#ballistic-pip');
      const dot = stage.querySelector('#ballistic-dot');
      if (pip && dot) {
        effect(() => {
          pip.setAttribute('cx', String(reticle.aimX.value));
          pip.setAttribute('cy', String(reticle.aimY.value));
          dot.setAttribute('cx', String(reticle.aimX.value));
          dot.setAttribute('cy', String(reticle.aimY.value));
        });
      }
    } else if (sub === 'drone') {
      const view = html`
        <div class="hw-panel-grid">
          <div class="hw-osd-screen">
            <div class="hw-osd-row">
              <span>MODE: <strong>${drone.flightMode}</strong></span>
              <span>6S: <strong>${drone.batteryVoltage}V</strong> (${drone.cellVoltage}V/c)</span>
            </div>
            <div class="hw-osd-horizon" style=${imu.horizonTransform}>
              <div class="hw-horizon-bar"></div>
            </div>
            <div class="hw-osd-row">
              <span>ALT: <strong>${drone.altitudeMeters}m</strong></span>
              <span>SPD: <strong>${drone.groundSpeedKmh} km/h</strong></span>
              <span>LQ: <strong>${drone.linkQualityPct}% (${drone.rssiDbm}dBm)</strong></span>
            </div>
          </div>

          <div class="hw-controls-col">
            <div class="repl-demo-header">
              <span class="badge-pill">@zuari/hardware/drone</span>
              <span class="repl-muted">16-Byte Binary MAVLink/CRSF</span>
            </div>
            <p class="repl-muted">Zero-JSON binary telemetry decoding directly from WebSerial / UDP ` + '`DataView`' + ` frames.</p>
            <div class="repl-btn-row">
              <button class="repl-action-btn" @click=${() => {
                const frame = encodeDroneBinaryFrame({
                  voltage: Number((21.2 + Math.random() * 3.8).toFixed(2)),
                  altitude: Number((40 + Math.random() * 180).toFixed(1)),
                  speed: Number((55 + Math.random() * 85).toFixed(1)),
                  rssi: -Math.floor(48 + Math.random() * 35),
                  lq: Math.floor(92 + Math.random() * 8),
                  modeIndex: Math.floor(Math.random() * 4),
                  cells: 6
                });
                drone.decodeBinaryFrame(frame);
                imu.ingestPacket([(Math.random() - 0.5) * 35, (Math.random() - 0.5) * 20, 180, 1.8]);
                onInteraction();
              }}>
                Inject 16-Byte Binary Flight Frame
              </button>
            </div>
          </div>
        </div>
      `;
      stage.appendChild(render(view).fragment);
    } else if (sub === 'kaios') {
      const view = html`
        <div class="hw-panel-grid">
          <div class="hw-kaios-phone">
            <div class="hw-kaios-statusbar">
              <span>KaiOS 3.0 • 4G</span>
              <span>RAM: 1.8MB</span>
            </div>
            <div class="hw-kaios-list" id="kaios-menu-list"></div>
            <div class="hw-kaios-t9bar">T9 Input: <strong>${dpad.t9Buffer}</strong></div>
            <div class="hw-kaios-softkeys">
              <span>Options</span>
              <strong>SELECT</strong>
              <span>Clear</span>
            </div>
          </div>

          <div class="hw-controls-col">
            <div class="repl-demo-header">
              <span class="badge-pill">@zuari/hardware/dpad</span>
              <span class="repl-muted">Selected: ${lastSelectedMenu}</span>
            </div>
            <div class="hw-dpad-cluster">
              <button class="repl-action-btn secondary" @click=${() => { dpad.moveUp(); onInteraction(); }}>▲ Up</button>
              <button class="repl-action-btn" @click=${() => { dpad.selectCurrent(); }}>● OK / Select</button>
              <button class="repl-action-btn secondary" @click=${() => { dpad.moveDown(); onInteraction(); }}>▼ Down</button>
            </div>
            <div class="hw-t9-grid">
              ${['2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => {
                const b = document.createElement('button');
                b.className = 'repl-preset-btn';
                b.textContent = `Key ${digit}`;
                b.addEventListener('click', () => {
                  dpad.pressT9Digit(digit);
                  onInteraction();
                });
                return b;
              })}
            </div>
          </div>
        </div>
      `;
      stage.appendChild(render(view).fragment);

      const menuContainer = stage.querySelector('#kaios-menu-list');
      if (menuContainer) {
        kaiosMenu.forEach((itemText, idx) => {
          const row = document.createElement('div');
          row.className = 'hw-kaios-item';
          row.textContent = itemText;
          effect(() => {
            row.setAttribute('data-focused', String(dpad.focusedIndex.value === idx));
          });
          menuContainer.appendChild(row);
        });
      }
    } else if (sub === 'rotary') {
      const view = html`
        <div class="hw-panel-grid">
          <div class="hw-rotary-dial-box">
            <div class="hw-wheel-gauge">
              <strong class="repl-big-num">${rotary.value}%</strong>
              <small>Detent Clicks: ${rotary.totalClicks}</small>
            </div>
          </div>
          <div class="hw-controls-col">
            <div class="repl-demo-header">
              <span class="badge-pill">@zuari/hardware/gaming</span>
              <span class="repl-muted">Scroll Wheel / Crank / 240Hz Input</span>
            </div>
            <p class="repl-muted">Zero-VDOM hardware rotary encoder for Rabbit R1-style scroll wheels, Playdate cranks, & handhelds.</p>
            <div class="repl-btn-row">
              <button class="repl-action-btn secondary" @click=${() => { rotary.rotateSteps(-1); onInteraction(); }}>
                ↺ Detent -1
              </button>
              <button class="repl-action-btn" @click=${() => { rotary.rotateSteps(1); onInteraction(); }}>
                ↻ Detent +1
              </button>
            </div>
          </div>
        </div>
      `;
      stage.appendChild(render(view).fragment);
    } else if (sub === 'appliance') {
      const view = html`
        <div class="hw-panel-grid">
          <div class="hw-appliance-screen">
            <div class="repl-stat-grid">
              <div class="repl-stat-box">
                <small>Freezer MQTT</small>
                <strong class="repl-big-num">${freezerTemp}°C</strong>
              </div>
              <div class="repl-stat-box">
                <small>Chiller MQTT</small>
                <strong class="repl-big-num">${chillerTemp}°C</strong>
              </div>
              <div class="repl-stat-box">
                <small>Door Sensor</small>
                <strong class="repl-big-num">${doorState}</strong>
              </div>
            </div>
          </div>
          <div class="hw-controls-col">
            <div class="repl-demo-header">
              <span class="badge-pill">@zuari/hardware/appliance</span>
              <span class="repl-muted">Orbit Ticks: ${appliance.uptimeTicks}</span>
            </div>
            <div class="repl-btn-row">
              <button class="repl-action-btn" @click=${() => {
                appliance.publishPacket('fridge/freezer/tempC', freezerTemp.value - 1);
                appliance.triggerPixelOrbitTick();
                onInteraction();
              }}>
                Super-Freeze (-1°C) & Orbit Shift
              </button>
              <button class="repl-action-btn secondary" @click=${() => {
                appliance.publishPacket('fridge/door/status', doorState.value === 'SEALED' ? 'AJAR' : 'SEALED');
                onInteraction();
              }}>
                Toggle Door Sensor
              </button>
            </div>
          </div>
        </div>
      `;
      stage.appendChild(render(view).fragment);
    } else if (sub === 'printer') {
      const view = html`
        <div class="hw-panel-grid">
          <div class="hw-appliance-screen">
            <div class="repl-demo-header">
              <span class="badge-pill">@zuari/hardware/printer</span>
              <span class="repl-muted">Klipper / Marlin Telemetry</span>
            </div>
            <div class="repl-stat-grid">
              <div class="repl-stat-box">
                <small>Hotend Nozzle</small>
                <strong class="repl-big-num">${printer.hotendTemp}°C</strong>
                <span class="repl-muted" style="font-size:0.75rem;">Target: ${printer.hotendTarget}°C</span>
              </div>
              <div class="repl-stat-box">
                <small>Heated Bed</small>
                <strong class="repl-big-num">${printer.bedTemp}°C</strong>
                <span class="repl-muted" style="font-size:0.75rem;">Target: ${printer.bedTarget}°C</span>
              </div>
              <div class="repl-stat-box">
                <small>Progress</small>
                <strong class="repl-big-num">${printer.printProgressPct}%</strong>
                <span class="repl-muted" style="font-size:0.75rem;">${printer.formattedRemainingTime} left</span>
              </div>
              <div class="repl-stat-box">
                <small>State</small>
                <strong class="repl-big-num">${printer.state}</strong>
                <span class="repl-muted" style="font-size:0.75rem;">Axes: X:${() => printer.position.value.x} Y:${() => printer.position.value.y}</span>
              </div>
            </div>
          </div>
          <div class="hw-controls-col">
            <div class="repl-demo-header">
              <span class="badge-pill">Additive Manufacturing G-code</span>
              <span class="repl-muted">Direct G-code Stream</span>
            </div>
            <p class="repl-muted">Fine-grained reactive signals for extruders, stepper motors &amp; Moonraker JSON-RPC status.</p>
            <div class="repl-btn-row">
              <button class="repl-action-btn" @click=${() => {
                printer.ingestGcodeResponse('ok T:220.0 /220.0 B:65.0 /65.0');
                printer.printProgressPct.value = Math.min(100, printer.printProgressPct.value + 5);
                onInteraction();
              }}>
                Feed M105 Temp Response (+5%)
              </button>
              <button class="repl-action-btn secondary" @click=${() => {
                printer.homeAxes('ALL');
                printer.position.value = { x: 0, y: 0, z: 0, e: 0 };
                onInteraction();
              }}>
                Home Axes (G28)
              </button>
              <button class="repl-action-btn secondary" style="color:var(--nova-color-danger, #ff4444);" @click=${() => {
                printer.emergencyStop();
                onInteraction();
              }}>
                Emergency Stop (M112)
              </button>
            </div>
          </div>
        </div>
      `;
      stage.appendChild(render(view).fragment);
    }
  }

  effect(() => {
    activeSubTab.value;
    renderSubModule();
  });

  return shell;
}

