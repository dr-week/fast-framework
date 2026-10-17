import { signal, effect, computed } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { createMorphGlyph } from '@zuari/glyphs';
import { generateAnchorName, setElementAnchor, tetherToAnchor } from '@zuari/headless';

// Load online Lucide icons dynamically via ESM CDN (esm.sh)
import { 
  Sparkles, 
  Terminal, 
  Layers, 
  Sliders, 
  Compass, 
  Github, 
  Boxes, 
  Cpu, 
  Glasses, 
  Check, 
  Radio, 
  ExternalLink 
} from 'https://esm.sh/lucide@0.469.0';

const app = document.getElementById('app')!;

// 1. Reactive State Graph
type ActiveTab = 'core' | 'spatial' | 'wasm' | 'tokens' | 'alliances';
const currentTab = signal<ActiveTab>('core');
const interactions = signal(0);
const fps = signal(60);
const sliderVal = signal(65);
const toggleActive = signal(true);
const pulseSpeed = signal(1.2);

// Icon Renderer Helper
function renderIcon(iconDef: unknown, size = 18): SVGElement {
  const [tag, attrs, children] = iconDef as [string, Record<string, string>, [string, Record<string, string>][]];
  const svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
  
  Object.entries(attrs || {}).forEach(([k, v]) => {
    svg.setAttribute(k, v);
  });
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.75');
  svg.setAttribute('fill', 'none');

  (children || []).forEach(([cTag, cAttrs]) => {
    const child = document.createElementNS('http://www.w3.org/2000/svg', cTag);
    Object.entries(cAttrs || {}).forEach(([ck, cv]) => {
      child.setAttribute(ck, cv);
    });
    svg.appendChild(child);
  });

  return svg;
}

// 2. Header Section with Radiant Zuari Crest Logo
const header = document.createElement('header');
header.className = 'spatial-header';

const logoContainer = document.createElement('div');
logoContainer.className = 'logo-glow-wrapper';
const logoImg = document.createElement('img');
logoImg.src = './zuari-logo.svg';
logoImg.alt = 'Zuari Crest Logo';
logoImg.width = 64;
logoImg.height = 64;
logoContainer.appendChild(logoImg);
header.appendChild(logoContainer);

const title = document.createElement('h1');
title.className = 'brand-title';
title.textContent = 'ZUARI';
header.appendChild(title);

const subtitle = document.createElement('p');
subtitle.className = 'brand-subtitle';
subtitle.textContent = 'The High-Velocity Web Platform Framework • Danger.Labs';
header.appendChild(subtitle);

app.appendChild(header);

// 3. Floating Spatial Navigation Dock
const dock = document.createElement('nav');
dock.className = 'spatial-dock';
dock.setAttribute('role', 'toolbar');
dock.setAttribute('aria-label', 'Feature Navigation');

const navItems: Array<{ id: ActiveTab; icon: unknown; label: string }> = [
  { id: 'core', icon: Sparkles, label: 'Kinetic Core' },
  { id: 'spatial', icon: Glasses, label: 'Spatial / XR' },
  { id: 'wasm', icon: Cpu, label: 'Systems Wasm' },
  { id: 'tokens', icon: Sliders, label: 'Token Physics' },
  { id: 'alliances', icon: Boxes, label: 'Alliances' }
];

navItems.forEach((item) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dock-btn';
  btn.setAttribute('aria-label', item.label);

  const anchor = generateAnchorName('tab');
  setElementAnchor(btn, anchor);
  btn.appendChild(renderIcon(item.icon, 20));

  effect(() => {
    const isActive = currentTab.value === item.id;
    btn.setAttribute('data-active', String(isActive));
  });

  btn.addEventListener('click', () => {
    currentTab.value = item.id;
    interactions.value++;
  });

  const tip = document.createElement('div');
  tip.className = 'spatial-tip';
  tip.textContent = item.label;
  tetherToAnchor(tip, anchor);

  dock.appendChild(btn);
  dock.appendChild(tip);
});

// GitHub external icon button
const ghBtn = document.createElement('a');
ghBtn.href = 'https://github.com/dr-week/fast-framework';
ghBtn.target = '_blank';
ghBtn.rel = 'noreferrer';
ghBtn.className = 'dock-btn';
ghBtn.setAttribute('aria-label', 'GitHub Repository');

const ghAnchor = generateAnchorName('gh');
setElementAnchor(ghBtn, ghAnchor);
ghBtn.appendChild(renderIcon(Github, 20));

const ghTip = document.createElement('div');
ghTip.className = 'spatial-tip';
ghTip.textContent = 'GitHub Repo';
tetherToAnchor(ghTip, ghAnchor);

dock.appendChild(ghBtn);
dock.appendChild(ghTip);

app.appendChild(dock);

// 4. Interactive Showcase Stage (Dynamic Viewport)
const showcaseStage = document.createElement('section');
showcaseStage.className = 'showcase-stage';

// Kinetic Morph Engine
const morphEngine = createMorphGlyph({ size: 64, durationMs: 280 });
const morphStates: Array<'sparkle' | 'loadingRing' | 'checkmark' | 'cross'> = [
  'sparkle',
  'loadingRing',
  'checkmark',
  'cross'
];
let morphIdx = 0;

function renderTabContent() {
  showcaseStage.innerHTML = '';

  const active = currentTab.value;

  if (active === 'core') {
    // Core Kinetic Demo
    const card = document.createElement('div');
    card.className = 'feature-card';

    const stageBox = document.createElement('div');
    stageBox.className = 'kinetic-stage-box';
    stageBox.appendChild(morphEngine.svgElement);
    stageBox.addEventListener('click', () => {
      morphIdx = (morphIdx + 1) % morphStates.length;
      morphEngine.setState(morphStates[morphIdx]!);
      interactions.value++;
    });

    const label = document.createElement('div');
    label.className = 'card-desc';
    label.innerHTML = '<strong>Direct-to-DOM Hardware Vector Morph</strong><br/>Click glyph to trigger GPU path interpolation';

    card.appendChild(stageBox);
    card.appendChild(label);
    showcaseStage.appendChild(card);
  } else if (active === 'spatial') {
    // Mixed Reality / Spatial Stage
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
    showcaseStage.appendChild(card);
  } else if (active === 'wasm') {
    // Systems & Future Languages
    const card = document.createElement('div');
    card.className = 'feature-card';

    const view = html`
      <div class="spatial-card-content">
        <div class="badge-pill">Rust • Zig • TypeSpec</div>
        <h3 style="margin-top: 8px; font-weight: 500;">Zero-Copy Linear Memory FFI</h3>
        <p style="font-size: 0.85rem; color: var(--muted); margin-top: 4px;">
          Synchronizing Wasm Float64Array memory buffers directly with TC39 reactive signals.
        </p>
        <div class="memory-buffer-bar">
          <div class="memory-slot filled">0x00</div>
          <div class="memory-slot filled">0x04</div>
          <div class="memory-slot filled">0x08</div>
          <div class="memory-slot">0x0C</div>
        </div>
      </div>
    `;
    card.appendChild(render(view).fragment);
    showcaseStage.appendChild(card);
  } else if (active === 'tokens') {
    // OKLCH Token Physics & Slider
    const card = document.createElement('div');
    card.className = 'feature-card';

    const sliderContainer = document.createElement('div');
    sliderContainer.style.width = '100%';
    sliderContainer.style.display = 'flex';
    sliderContainer.style.flexDirection = 'column';
    sliderContainer.style.gap = '16px';

    const labelRow = document.createElement('div');
    labelRow.style.display = 'flex';
    labelRow.style.justifyContent = 'space-between';
    labelRow.innerHTML = `<span>OKLCH Chroma Level</span><strong id="slider-readout">${sliderVal.value}%</strong>`;

    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.value = String(sliderVal.value);
    range.className = 'zuari-slider';

    range.addEventListener('input', (e) => {
      const val = Number((e.target as HTMLInputElement).value);
      sliderVal.value = val;
      const readout = document.getElementById('slider-readout');
      if (readout) readout.textContent = `${val}%`;
      interactions.value++;
    });

    sliderContainer.appendChild(labelRow);
    sliderContainer.appendChild(range);
    card.appendChild(sliderContainer);
    showcaseStage.appendChild(card);
  } else if (active === 'alliances') {
    // Technology Alliances & Partnerships
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
            <span>&lt; 15MB Desktop</span>
          </div>
          <div class="alliance-item">
            <strong>Meta Quest</strong>
            <span>120 FPS WebXR</span>
          </div>
          <div class="alliance-item">
            <strong>Apple Vision</strong>
            <span>RealityKit Glass</span>
          </div>
          <div class="alliance-item">
            <strong>Cloudflare</strong>
            <span>0ms Edge Hydration</span>
          </div>
        </div>
      </div>
    `;
    card.appendChild(render(view).fragment);
    showcaseStage.appendChild(card);
  }
}

effect(() => {
  currentTab.value;
  renderTabContent();
});

app.appendChild(showcaseStage);

// 5. Telemetry Bar
const telemetryView = html`
  <div class="spatial-metrics">
    <div class="metric-item">
      <div class="pulse-dot"></div>
      <span><strong id="live-fps">60</strong> FPS</span>
    </div>
    <div class="metric-item">
      <span>Core: <strong>&lt; 2.5 KB</strong></span>
    </div>
    <div class="metric-item">
      <span>Suites: <strong>11 Passed</strong></span>
    </div>
    <div class="metric-item">
      <span>Pulse: <strong>${interactions}</strong></span>
    </div>
  </div>
`;

app.appendChild(render(telemetryView).fragment);

// FPS Counter
let lastTime = performance.now();
let frames = 0;
function measureFPS(now: number) {
  frames++;
  if (now - lastTime >= 1000) {
    fps.value = frames;
    frames = 0;
    lastTime = now;
    const el = document.getElementById('live-fps');
    if (el) el.textContent = String(fps.value);
  }
  requestAnimationFrame(measureFPS);
}
requestAnimationFrame(measureFPS);
