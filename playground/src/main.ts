import { signal, effect } from '@zuari/signals';
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
  Flame, 
  Zap, 
  Box 
} from 'https://esm.sh/lucide@0.469.0';

const app = document.getElementById('app')!;

// 1. Reactive State Graph
type ActiveMode = 'pulse' | 'terminal' | 'layers' | 'sliders' | 'compass';
const mode = signal<ActiveMode>('pulse');
const interactions = signal(0);
const fps = signal(60);

// Simple SVG icon renderer helper from online Lucide SVG definitions
function renderIcon(iconDef: unknown, size = 20): SVGElement {
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

// 2. Centerpiece: The Kinetic GPU Morphing Glyph Stage
const stageContainer = document.createElement('div');
stageContainer.className = 'spatial-stage';
stageContainer.setAttribute('role', 'button');
stageContainer.setAttribute('aria-label', 'Interactive Morphing Core');

const glow = document.createElement('div');
glow.className = 'stage-glow';
stageContainer.appendChild(glow);

const morphEngine = createMorphGlyph({ size: 56, durationMs: 280 });
stageContainer.appendChild(morphEngine.svgElement);

const morphStates: Array<'sparkle' | 'loadingRing' | 'checkmark' | 'cross'> = [
  'sparkle',
  'loadingRing',
  'checkmark',
  'cross'
];
let currentMorphIndex = 0;

stageContainer.addEventListener('click', () => {
  currentMorphIndex = (currentMorphIndex + 1) % morphStates.length;
  const nextState = morphStates[currentMorphIndex]!;
  morphEngine.setState(nextState);
  interactions.value++;
});

app.appendChild(stageContainer);

// 3. Floating Spatial Icon Ribbon (Navigation Dock)
const dock = document.createElement('nav');
dock.className = 'spatial-dock';
dock.setAttribute('role', 'toolbar');
dock.setAttribute('aria-label', 'Spatial Navigation');

const navItems = [
  { id: 'pulse', icon: Sparkles, tip: 'Kinetic Core' },
  { id: 'terminal', icon: Terminal, tip: 'Command Flow' },
  { id: 'layers', icon: Layers, tip: 'Modular Graph' },
  { id: 'sliders', icon: Sliders, tip: 'Token Physics' },
  { id: 'compass', icon: Compass, tip: 'Spatial Plane' },
] as const;

navItems.forEach((item) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dock-btn';
  btn.setAttribute('aria-label', item.tip);

  const anchor = generateAnchorName('nav');
  setElementAnchor(btn, anchor);

  const svg = renderIcon(item.icon, 20);
  btn.appendChild(svg);

  // Active state binding
  effect(() => {
    const isActive = mode.value === item.id;
    btn.setAttribute('data-active', String(isActive));
  });

  btn.addEventListener('click', () => {
    mode.value = item.id;
    interactions.value++;

    if (item.id === 'pulse') morphEngine.setState('sparkle');
    else if (item.id === 'terminal') morphEngine.setState('loadingRing');
    else if (item.id === 'layers') morphEngine.setState('checkmark');
    else morphEngine.setState('cross');
  });

  // Native Anchor-tethered micro-tooltip
  const tip = document.createElement('div');
  tip.className = 'spatial-tip';
  tip.textContent = item.tip;
  tetherToAnchor(tip, anchor);

  dock.appendChild(btn);
  dock.appendChild(tip);
});

// External GitHub Icon link
const ghLink = document.createElement('a');
ghLink.href = 'https://github.com/dr-week/fast-framework';
ghLink.target = '_blank';
ghLink.rel = 'noreferrer';
ghLink.className = 'dock-btn';
ghLink.setAttribute('aria-label', 'GitHub Source');

const ghAnchor = generateAnchorName('gh');
setElementAnchor(ghLink, ghAnchor);
ghLink.appendChild(renderIcon(Github, 20));

const ghTip = document.createElement('div');
ghTip.className = 'spatial-tip';
ghTip.textContent = 'Source Code';
tetherToAnchor(ghTip, ghAnchor);

dock.appendChild(ghLink);
dock.appendChild(ghTip);

app.appendChild(dock);

// 4. Ambient Telemetry Indicator (Zero Virtual DOM Direct Binding)
const telemetryView = html`
  <div class="spatial-metrics">
    <div class="metric-item">
      <div class="pulse-dot"></div>
      <span><strong id="live-fps">60</strong> FPS</span>
    </div>
    <div class="metric-item">
      <span>Zuari Core <strong>&lt; 2.5 KB</strong></span>
    </div>
    <div class="metric-item">
      <span>Clicks: <strong>${interactions}</strong></span>
    </div>
  </div>
`;

app.appendChild(render(telemetryView).fragment);

// Ambient frame-rate counter loop
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
