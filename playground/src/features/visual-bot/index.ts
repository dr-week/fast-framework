/**
 * @fileoverview Interactive Visual Bot Studio for the Zuari Playground.
 * Demonstrates live Set-of-Mark DOM indexing with sensitive-input blocking,
 * Layer 1 -> Layer 2 self-healing selector cascades, biometric Bezier paths,
 * and theme-invariant Sobel + 2D NCC visual matching.
 */

import { html, render } from '@zuari/dom';
import { signal } from '@zuari/signals';
import {
  computeSobelEdges,
  createVisualBot,
  generateBezierPath,
  matchEdgeTemplate,
  rgbaToGrayscale,
} from '@zuari/visual-bot';

function buildIconRgba(size: number, dark: boolean): Uint8ClampedArray {
  const data = new Uint8ClampedArray(size * size * 4);
  const bg = dark ? 18 : 242;
  const fg = dark ? 235 : 24;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = bg;
    data[i + 1] = bg;
    data[i + 2] = bg;
    data[i + 3] = 255;
  }
  for (let y = 3; y < size - 3; y++) {
    for (let x = 3; x < size - 3; x++) {
      const idx = (y * size + x) * 4;
      data[idx] = fg;
      data[idx + 1] = fg;
      data[idx + 2] = fg;
    }
  }
  return data;
}

export function createVisualBotStudio(onInteraction: () => void): HTMLElement {
  const host = document.createElement('div');
  host.className = 'showcase-panel visual-bot-studio';

  const statusText = signal('Ready — scan the target surface or trigger a broken selector.');
  const indexedCount = signal(0);
  const blockedCount = signal(0);
  const healedSelector = signal('.legacy-broken-btn');
  const bezierSummary = signal('0 points');
  const visionConfidence = signal('Not run');

  const bot = createVisualBot({
    initialSelectors: { approveBtn: '.legacy-broken-btn' },
  });

  const getSandbox = (): HTMLElement | null => host.querySelector('[data-vb-sandbox]');

  const onScan = (): void => {
    onInteraction();
    const sandbox = getSandbox();
    if (!sandbox) return;
    const marks = bot.scan(sandbox);
    indexedCount.value = marks.length;
    blockedCount.value = bot.blockedCount.value;
    statusText.value = `Indexed ${marks.length} safe controls (${bot.blockedCount.value} sensitive blocked).`;
  };

  const onHeal = (): void => {
    onInteraction();
    const sandbox = getSandbox();
    if (!sandbox) return;
    const res = bot.resolve('approveBtn', { query: 'Approve Action', root: sandbox });
    healedSelector.value = bot.selectorCache.value.approveBtn || '.legacy-broken-btn';
    statusText.value = res.found
      ? `Resolved via Layer ${res.layer} (${res.healed ? 'self-healed' : 'cache hit'}) in ${res.durationMs}ms.`
      : 'Target not found.';
  };

  const onToggleOverlay = (): void => {
    onInteraction();
    if (bot.overlayVisible.value) {
      bot.hideOverlay(document);
      statusText.value = 'Set-of-Mark debug overlay cleared.';
    } else {
      if (bot.marks.value.length === 0) onScan();
      const count = bot.showOverlay(1, document);
      statusText.value = `Overlay active with ${count} numbered marks.`;
    }
  };

  const onRunKinematics = (): void => {
    onInteraction();
    const path = generateBezierPath(12, 16, 260, 148, { steps: 18 });
    bezierSummary.value = `${path.length} Bezier pts (${path[0]?.x},${path[0]?.y} -> ${path[path.length - 1]?.x},${path[path.length - 1]?.y})`;

    const tmpl = computeSobelEdges(rgbaToGrayscale(buildIconRgba(16, true), 16, 16), 16, 16);
    const lightScene = computeSobelEdges(rgbaToGrayscale(buildIconRgba(16, false), 16, 16), 16, 16);
    const match = matchEdgeTemplate(lightScene, 16, 16, tmpl, 16, 16, 0.7);
    visionConfidence.value = `${(match.confidence * 100).toFixed(1)}% (dark-to-light invariant)`;
    statusText.value = 'Computed biometric Bezier curve and theme-invariant Sobel NCC match.';
  };

  const view = html`
    <div class="showcase-stack">
      <div class="showcase-card">
        <h3>Visual Bot Studio</h3>
        <p>${statusText}</p>
        <div class="showcase-actions">
          <button type="button" data-action="vb-scan" @click=${onScan}>Scan Set-of-Mark</button>
          <button type="button" data-action="vb-heal" @click=${onHeal}>Test Self-Heal Cascade</button>
          <button type="button" data-action="vb-overlay" @click=${onToggleOverlay}>Toggle Overlay</button>
          <button type="button" data-action="vb-vision" @click=${onRunKinematics}>Run Bezier + Sobel</button>
        </div>
        <dl class="showcase-metrics">
          <div><dt>Safe Marks</dt><dd data-vb-indexed>${indexedCount}</dd></div>
          <div><dt>Blocked Sensitive</dt><dd data-vb-blocked>${blockedCount}</dd></div>
          <div><dt>Cached Selector</dt><dd data-vb-selector>${healedSelector}</dd></div>
          <div><dt>Motion Path</dt><dd data-vb-bezier>${bezierSummary}</dd></div>
          <div><dt>Sobel Match</dt><dd data-vb-vision>${visionConfidence}</dd></div>
        </dl>
      </div>
      <div class="showcase-card" data-vb-sandbox>
        <h4>Target Surface Sandbox</h4>
        <div class="showcase-actions">
          <button type="button" aria-label="Approve Action">Approve Action</button>
          <button type="button" aria-label="Filter Queue">Filter Queue</button>
          <input type="password" aria-label="Account Password" placeholder="Blocked password field" />
          <button type="button" aria-label="Pay Now">Pay Now</button>
        </div>
      </div>
    </div>
  `;

  const { fragment } = render(view);
  host.appendChild(fragment);
  return host;
}
