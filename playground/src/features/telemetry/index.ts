import { html, render } from '@zuari/dom';
import type { Signal } from '@zuari/signals';

export function createTelemetryBar(interactions: Signal<number>): DocumentFragment {
  const view = html`
    <div class="spatial-metrics">
      <div class="metric-item">
        <div class="pulse-dot"></div>
        <span><strong>Playground</strong> live</span>
      </div>
      <div class="metric-item">
        <span>State: <strong>Reactive</strong></span>
      </div>
      <div class="metric-item">
        <span>VDOM: <strong>0 Nodes</strong></span>
      </div>
      <div class="metric-item">
        <span>Pulse: <strong>${interactions}</strong></span>
      </div>
    </div>
  `;
  return render(view).fragment;
}
