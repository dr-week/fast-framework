export interface ReplPreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  code: string;
}

export const REPL_PRESETS: ReplPreset[] = [
  {
    id: 'counter',
    title: 'Direct-to-DOM Signals',
    badge: '@zuari/signals + @zuari/dom',
    description: 'Zero Virtual DOM: signal mutations flow directly to exact W3C DOM Parts nodes.',
    code: `const count = signal(1);
const doubled = computed(() => count.value * 2);
const squared = computed(() => count.value ** 2);

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header">
      <span class="badge-pill">0ms Hydration</span><span class="repl-muted">Direct TextNode Binding</span>
    </div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box"><small>Signal</small><strong class="repl-big-num">\${count}</strong></div>
      <div class="repl-stat-box"><small>Computed (2x)</small><strong class="repl-big-num">\${doubled}</strong></div>
      <div class="repl-stat-box"><small>Squared (x²)</small><strong class="repl-big-num">\${squared}</strong></div>
    </div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => { count.value++; }}>+ Increment Signal</button>
      <button class="repl-action-btn secondary" @click=\${() => { count.value = 1; }}>Reset</button>
    </div>
  </div>
\`;
mount(view);`
  },
  {
    id: 'spatial-hud',
    title: '3D Spatial Anchor HUD',
    badge: '@zuari/spatial',
    description: 'Write Once, Run Spatial: 6DoF quaternion & matrix3d transforms at 120 FPS.',
    code: `const anchor = createSpatialAnchor({ id: 'quest-hud-panel', initialPosition: { x: 0, y: 0, z: 0 } });
const yaw = signal(12), pitch = signal(-8), depth = signal(0);

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-spatial-viewport">
      <div id="spatial-target" class="repl-spatial-hud">
        <div class="badge-pill">visionOS • 120 FPS</div><h4>Diegetic Telemetry Dock</h4><p class="repl-mono">Matrix3D Bound to Signal</p>
      </div>
    </div>
    <div class="repl-controls-stack">
      <label class="repl-slider-row"><span>Yaw X (\${yaw}°)</span><input type="range" min="-35" max="35" value="12" @input=\${(e) => { yaw.value = Number(e.target.value); }} /></label>
      <label class="repl-slider-row"><span>Pitch Y (\${pitch}°)</span><input type="range" min="-35" max="35" value="-8" @input=\${(e) => { pitch.value = Number(e.target.value); }} /></label>
    </div>
  </div>
\`;
mount(view);

const target = root.querySelector('#spatial-target');
if (target) {
  effect(() => {
    const radY = (yaw.value * Math.PI) / 180, radX = (pitch.value * Math.PI) / 180;
    anchor.updateTransform({ x: yaw.value * 0.8, y: pitch.value * 0.6, z: depth.value }, { x: Math.sin(radX / 2), y: Math.sin(radY / 2), z: 0, w: Math.cos(radY / 2) });
    target.style.transform = \`perspective(500px) rotateY(\${yaw.value}deg) rotateX(\${-pitch.value}deg)\`;
  });
}`
  },
  {
    id: 'wasm-ffi',
    title: 'Zero-Copy Wasm Memory FFI',
    badge: '@zuari/wasm',
    description: 'Synchronize Rust/Zig linear memory buffers directly with reactive signals.',
    code: `const buffer = new ArrayBuffer(64);
const physics = createWasmStruct({ memory: buffer, baseOffset: 0 }, {
  velocity: { offset: 0, type: 'f64', initial: 42.5 },
  mass: { offset: 8, type: 'f64', initial: 12.0 },
  energy: { offset: 16, type: 'f64', initial: 255.0 }
});
const hexDump = computed(() =>
  Array.from(new Uint8Array(buffer, 0, 12)).map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
);

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header"><span class="badge-pill">Zero Serialization</span><span class="repl-muted">24-Byte C-ABI Struct</span></div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box"><small>0x00 Velocity (f64)</small><strong class="repl-big-num">\${physics.velocity.signal}</strong></div>
      <div class="repl-stat-box"><small>0x08 Mass (f64)</small><strong class="repl-big-num">\${physics.mass.signal}</strong></div>
    </div>
    <div class="repl-hex-bar">\${hexDump}</div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => { physics.velocity.signal.value = Number((physics.velocity.signal.value + 7.25).toFixed(2)); }}>Mutate Signal -> Flush to 0x00</button>
      <button class="repl-action-btn secondary" @click=\${() => { new DataView(buffer).setFloat64(8, physics.mass.signal.value + 5, true); physics.mass.syncFromWasm(); }}>Simulate Rust Write @ 0x08</button>
    </div>
  </div>
\`;
mount(view);`
  },
  {
    id: 'hardware-hud',
    title: 'Hardware & Tactical HUD',
    badge: '@zuari/hardware',
    description: 'Real-time ballistic reticle & zero-copy drone telemetry decoding.',
    code: `const reticle = createBallisticReticle({ rangeMeters: 380, windMps: 4.8, magCapacity: 30 });
const drone = createDroneTelemetry();

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header"><span class="badge-pill">@zuari/hardware</span><span class="repl-muted">Tactical Optic &amp; Drone OSD</span></div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box"><small>Target Range</small><strong class="repl-big-num">\${reticle.rangeMeters}m</strong></div>
      <div class="repl-stat-box"><small>Elevation Drop</small><strong class="repl-big-num">\${reticle.elevationMrad} MRAD</strong></div>
      <div class="repl-stat-box"><small>Ammo Left</small><strong class="repl-big-num">\${reticle.ammoRemaining} / 30</strong></div>
      <div class="repl-stat-box"><small>Battery 6S</small><strong class="repl-big-num">\${drone.batteryVoltage}V</strong></div>
    </div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => { reticle.triggerShotImpulse(18.5); }}>Fire Recoil Impulse (-1)</button>
      <button class="repl-action-btn secondary" @click=\${() => { reticle.reloadMagazine(); }}>Reload Mag</button>
      <button class="repl-action-btn secondary" @click=\${() => { reticle.rangeMeters.value = reticle.rangeMeters.value === 380 ? 550 : 380; }}>Toggle Range (550m)</button>
    </div>
  </div>
\`;
mount(view);`
  },
  {
    id: 'quantum-state',
    title: 'Quantum Statevector Node',
    badge: '@zuari/quantum',
    description: '3D Bloch sphere kinematics, unitary gate rotations & coherence modeling.',
    code: `const qNode = createQuantumNodeState({ id: 'q0-primary', initialTheta: 0, initialPhi: 0, t2Micros: 120 });

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header"><span class="badge-pill">@zuari/quantum</span><span class="repl-muted">Bloch Sphere Statevector</span></div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box"><small>|0⟩ Probability</small><strong class="repl-big-num">\${qNode.probZero}</strong></div>
      <div class="repl-stat-box"><small>|1⟩ Probability</small><strong class="repl-big-num">\${qNode.probOne}</strong></div>
      <div class="repl-stat-box"><small>T2 Coherence</small><strong class="repl-big-num">\${qNode.coherence}</strong></div>
    </div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => { qNode.applyGate('H'); }}>Hadamard (H Gate)</button>
      <button class="repl-action-btn" @click=\${() => { qNode.applyGate('X'); }}>Pauli-X (NOT Gate)</button>
      <button class="repl-action-btn secondary" @click=\${() => { console.log('Qubit:', qNode.measure()); }}>Measure</button>
      <button class="repl-action-btn secondary" @click=\${() => { qNode.reset(); }}>Reset</button>
    </div>
  </div>
\`;
mount(view);`
  },
  {
    id: 'smooth-drawer',
    title: 'Smooth Sliding Drawer',
    badge: '@zuari/ui & @zuari/headless',
    description: 'Hardware-accelerated sliding side/bottom drawer with touch gestures and spring easing.',
    code: `const placement = signal('right'), isOpen = signal(false);
const drawer = createUiDrawer({ title: 'Hardware & Systems Drawer', description: 'Buttery-smooth 120 FPS sliding transform with backdrop blur', isOpen, placement: 'right' });

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header"><span class="badge-pill">@zuari/ui/drawer</span><span class="repl-muted">Touch-Swipe &amp; Spring Physics</span></div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box"><small>Drawer State</small><strong class="repl-big-num">\${() => isOpen.value ? 'OPEN' : 'CLOSED'}</strong></div>
      <div class="repl-stat-box"><small>Placement</small><strong class="repl-big-num">\${placement}</strong></div>
      <div class="repl-stat-box"><small>Animation Easing</small><strong class="repl-big-num">Spring 280ms</strong></div>
    </div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => { drawer.toggle(); }}>Toggle Sliding Drawer</button>
      <button class="repl-action-btn secondary" @click=\${() => {
        const next = placement.value === 'right' ? 'left' : placement.value === 'left' ? 'bottom' : 'right';
        placement.value = next; drawer.placement.value = next;
      }}>Switch Placement (\${placement})</button>
    </div>
  </div>
\`;
mount(view);`
  },
  {
    id: 'liquid-glass',
    title: 'Apple Liquid Glass',
    badge: '@zuari/ui/card + @zuari/tokens',
    description: 'Optical backdrop blur, 1px specular rim highlight & Contrasting Boxiness across themes.',
    code: `const theme = signal('noir'), tint = signal('sky'), blurPx = signal(26);
const tints = ['sky', 'violet', 'rose', 'mint'];
const host = document.createElement('div');
host.className = 'zuari-app-canvas';
host.style.cssText = 'width:100%;padding:14px;border-radius:18px;border:1px solid var(--nova-color-border);';

const card = createCard({ title: 'Optical Glass Telemetry', subtitle: '1px top specular rim + Contrasting Boxiness', surface: 'liquid', class: 'zuari-surface-liquid' });
card.style.padding = '16px'; card.style.color = 'var(--nova-color-glyph-active)';

render(html\`
  <div class="repl-demo-header">
    <span class="zuari-tag-pill" style="display:inline-flex;align-items:center;gap:6px;">\${LayersGlyph({ size: 14 })} Liquid Optics</span>
    <span class="repl-muted" style="color:var(--nova-color-glyph)">blur(\${blurPx}px)</span>
  </div>
  <div class="repl-stat-grid">
    <div class="repl-stat-box" style="background:var(--nova-color-surface);border-color:var(--nova-color-border)"><small style="color:var(--nova-color-glyph)">Theme</small><strong class="repl-big-num" style="color:var(--nova-color-accent)">\${theme}</strong></div>
    <div class="repl-stat-box" style="background:var(--nova-color-surface);border-color:var(--nova-color-border)"><small style="color:var(--nova-color-glyph)">Blur</small><strong class="repl-big-num" style="color:var(--nova-color-accent)">\${blurPx}px</strong></div>
    <div class="repl-stat-box" style="background:var(--nova-color-surface);border-color:var(--nova-color-border)"><small style="color:var(--nova-color-glyph)">Tint</small><strong class="repl-big-num" style="color:var(--nova-color-accent)">\${tint}</strong></div>
  </div>
  <label class="repl-slider-row" style="color:var(--nova-color-glyph)"><span>Optical Blur (\${blurPx}px)</span><input type="range" min="10" max="36" value="26" @input=\${(e) => { blurPx.value = Number(e.target.value); }} /></label>
  <div class="repl-btn-row">
    <button class="repl-action-btn" style="background:var(--nova-color-accent);color:var(--nova-color-on-accent)" @click=\${() => { theme.value = theme.value === 'noir' ? 'studio' : 'noir'; }}>Theme: \${theme}</button>
    <button class="repl-action-btn secondary" style="background:var(--nova-color-surface);color:var(--nova-color-glyph-active);border-color:var(--nova-color-border)" @click=\${() => { tint.value = tints[(tints.indexOf(tint.value) + 1) % tints.length]; }}>Tint: \${tint}</button>
  </div>
\`, card);
host.appendChild(card); mount(host);

effect(() => {
  applyThemePreset(theme.value, host);
  host.style.setProperty('--zuari-glass-blur', blurPx.value + 'px');
  card.setAttribute('data-zuari-tint', tint.value);
});`
  }
];
