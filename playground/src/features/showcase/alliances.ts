import { html, render } from '@zuari/dom';

export function createAlliancesShowcase(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'feature-card';
  const view = html`
    <div class="spatial-card-content" style="text-align: center;">
      <div class="badge-pill">Danger.Labs Ecosystem</div>
      <h3 style="margin-top: 8px; font-weight: 500;">Strategic Technology Alliances</h3>
      <p style="font-size: 0.825rem; color: var(--muted); margin-top: 4px;">
        Seamless interoperability with Meta Reality Labs, Tauri, WebAssembly, and Cloudflare.
      </p>
      <div class="alliances-grid">
        <div class="alliance-item">
          <strong>Rust / Tauri</strong>
          <span>Desktop target</span>
        </div>
        <div class="alliance-item">
          <strong>Meta Quest</strong>
          <span>Spatial target</span>
        </div>
        <div class="alliance-item">
          <strong>Apple Vision</strong>
          <span>Spatial target</span>
        </div>
        <div class="alliance-item">
          <strong>Cloudflare</strong>
          <span>Edge deployment</span>
        </div>
      </div>
    </div>
  `;
  card.appendChild(render(view).fragment);
  return card;
}
