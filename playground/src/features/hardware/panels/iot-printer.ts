import type { Signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import type { ApplianceBridge, PrinterTelemetry } from '@zuari/hardware';

export function renderAppliancePanel(
  stage: HTMLElement,
  appliance: ApplianceBridge,
  freezerTemp: Signal<number>,
  chillerTemp: Signal<number>,
  doorState: Signal<string>,
  onInteraction: () => void
): () => void {
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
            Super-Freeze (-1°C) &amp; Orbit Shift
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

  return render(view, stage).destroy;
}

export function renderPrinterPanel(
  stage: HTMLElement,
  printer: PrinterTelemetry,
  onInteraction: () => void
): () => void {
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
            <span class="repl-muted" style="font-size:0.75rem;">${() => printer.formattedRemainingTime.value} left</span>
          </div>
          <div class="repl-stat-box">
            <small>State</small>
            <strong class="repl-big-num">${printer.state}</strong>
            <span class="repl-muted" style="font-size:0.75rem;">
              Axes: X:${() => printer.position.value.x} Y:${() => printer.position.value.y}
            </span>
          </div>
        </div>
      </div>
      <div class="hw-controls-col">
        <div class="repl-demo-header">
          <span class="badge-pill">Additive Manufacturing G-code</span>
          <span class="repl-muted">Direct G-code Stream</span>
        </div>
        <p class="repl-muted">
          Fine-grained reactive signals for extruders, stepper motors &amp; Moonraker JSON-RPC status.
        </p>
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

  return render(view, stage).destroy;
}
