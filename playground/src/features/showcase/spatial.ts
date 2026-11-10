import { html, render } from '@zuari/dom';

export function createSpatialShowcase(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'feature-card';
  const view = html`
    <div class="spatial-card-content">
      <div class="badge-pill">visionOS • Meta Quest 3</div>
      <h3 style="margin-top: 8px; font-weight: 500;">Volumetric Spatial Anchors</h3>
      <p style="font-size: 0.85rem; color: var(--muted); margin-top: 4px;">
        Tethering 3D HUD matrix transforms with eye-gaze and 6DoF hand tracking.
      </p>
      <div class="spatial-radar-preview">
        <div class="radar-sweep"></div>
        <div class="radar-dot" style="top: 30%; left: 65%;"></div>
        <div class="radar-dot" style="top: 70%; left: 35%;"></div>
      </div>
    </div>
  `;
  card.appendChild(render(view).fragment);
  return card;
}
