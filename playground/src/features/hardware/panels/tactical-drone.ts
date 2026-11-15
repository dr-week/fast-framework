import { effect } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import {
  encodeDroneBinaryFrame,
  type BallisticReticle,
  type DroneTelemetry,
  type IMUStream
} from '@zuari/hardware';

export function renderTacticalPanel(
  stage: HTMLElement,
  reticle: BallisticReticle,
  imu: IMUStream,
  onInteraction: () => void
): () => void {
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
          <span>DROP: <strong>${() => reticle.elevationMrad.value} MRAD</strong></span>
          <span>WIND: <strong>${() => reticle.windageMrad.value} MRAD</strong></span>
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
            @input=${(e?: Event) => {
              if (!e) return;
              reticle.rangeMeters.value = Number((e.target as HTMLInputElement).value);
              onInteraction();
            }} />
        </label>
        <label class="repl-slider-row">
          <span>Crosswind (${reticle.windMps} m/s)</span>
          <input type="range" min="-15" max="15" step="0.5" value=${reticle.windMps}
            @input=${(e?: Event) => {
              if (!e) return;
              reticle.windMps.value = Number((e.target as HTMLInputElement).value);
              onInteraction();
            }} />
        </label>
        <label class="repl-slider-row">
          <span>Optic Cant Roll (${imu.roll}°)</span>
          <input type="range" min="-30" max="30" step="1" value=${imu.roll}
            @input=${(e?: Event) => {
              if (!e) return;
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

  const instance = render(view, stage);
  const pip = stage.querySelector('#ballistic-pip');
  const dot = stage.querySelector('#ballistic-dot');
  const disposePip = pip && dot
    ? effect(() => {
        pip.setAttribute('cx', String(reticle.aimX.value));
        pip.setAttribute('cy', String(reticle.aimY.value));
        dot.setAttribute('cx', String(reticle.aimX.value));
        dot.setAttribute('cy', String(reticle.aimY.value));
      })
    : undefined;

  return () => {
    disposePip?.();
    instance.destroy();
  };
}

export function renderDronePanel(
  stage: HTMLElement,
  drone: DroneTelemetry,
  imu: IMUStream,
  onInteraction: () => void
): () => void {
  const view = html`
    <div class="hw-panel-grid">
      <div class="hw-osd-screen">
        <div class="hw-osd-row">
          <span>MODE: <strong>${drone.flightMode}</strong></span>
          <span>6S: <strong>${drone.batteryVoltage}V</strong> (${() => drone.cellVoltage.value}V/c)</span>
        </div>
        <div class="hw-osd-horizon" style=${() => imu.horizonTransform.value}>
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
        <p class="repl-muted">Zero-JSON binary telemetry decoding directly from WebSerial / UDP <code>DataView</code> frames.</p>
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

  return render(view, stage).destroy;
}
