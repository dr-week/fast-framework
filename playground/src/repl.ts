import { signal, computed, effect, batch } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { createMorphGlyph } from '@zuari/glyphs';
import { createSpatialAnchor, bindAnchorToElement } from '@zuari/spatial';
import { createWasmSignal, createWasmStruct } from '@zuari/wasm';
import { generateAnchorName, setElementAnchor, tetherToAnchor } from '@zuari/headless';
import { createBallisticReticle, createDroneTelemetry } from '@zuari/hardware';
import { createQuantumNodeState } from '@zuari/quantum';

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
    code: `// 1. Atomic TC39 Reactive Signals
const count = signal(1);
const doubled = computed(() => count.value * 2);
const squared = computed(() => count.value ** 2);

// 2. Direct-to-DOM Template (No VDOM Diffing)
const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header">
      <span class="badge-pill">0ms Hydration</span>
      <span class="repl-muted">Direct TextNode Binding</span>
    </div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box">
        <small>Signal</small>
        <strong class="repl-big-num">\${count}</strong>
      </div>
      <div class="repl-stat-box">
        <small>Computed (2x)</small>
        <strong class="repl-big-num">\${doubled}</strong>
      </div>
      <div class="repl-stat-box">
        <small>Squared (x²)</small>
        <strong class="repl-big-num">\${squared}</strong>
      </div>
    </div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => { count.value++; }}>
        + Increment Signal
      </button>
      <button class="repl-action-btn secondary" @click=\${() => { count.value = 1; }}>
        Reset
      </button>
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
    code: `// Create a 3D Volumetric Spatial Anchor (visionOS / Meta Quest)
const anchor = createSpatialAnchor({
  id: 'quest-hud-panel',
  initialPosition: { x: 0, y: 0, z: 0 }
});

const yaw = signal(12);
const pitch = signal(-8);
const depth = signal(0);

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-spatial-viewport">
      <div id="spatial-target" class="repl-spatial-hud">
        <div class="badge-pill">visionOS • 120 FPS</div>
        <h4>Diegetic Telemetry Dock</h4>
        <p class="repl-mono">Matrix3D Bound to Signal</p>
      </div>
    </div>
    <div class="repl-controls-stack">
      <label class="repl-slider-row">
        <span>Yaw X (\${yaw}°)</span>
        <input type="range" min="-35" max="35" value="12"
          @input=\${(e) => { yaw.value = Number(e.target.value); }} />
      </label>
      <label class="repl-slider-row">
        <span>Pitch Y (\${pitch}°)</span>
        <input type="range" min="-35" max="35" value="-8"
          @input=\${(e) => { pitch.value = Number(e.target.value); }} />
      </label>
    </div>
  </div>
\`;

mount(view);

const target = root.querySelector('#spatial-target');
if (target) {
  effect(() => {
    const radY = (yaw.value * Math.PI) / 180;
    const radX = (pitch.value * Math.PI) / 180;
    anchor.updateTransform(
      { x: yaw.value * 0.8, y: pitch.value * 0.6, z: depth.value },
      { x: Math.sin(radX / 2), y: Math.sin(radY / 2), z: 0, w: Math.cos(radY / 2) }
    );
    target.style.transform = \`perspective(500px) rotateY(\${yaw.value}deg) rotateX(\${-pitch.value}deg)\`;
  });
}`
  },
  {
    id: 'wasm-ffi',
    title: 'Zero-Copy Wasm Memory FFI',
    badge: '@zuari/wasm',
    description: 'Synchronize Rust/Zig linear memory buffers directly with reactive signals.',
    code: `// Allocate raw 64-byte WebAssembly / Shared Linear Memory Buffer
const buffer = new ArrayBuffer(64);

// Map a C-ABI / Rust struct directly to reactive signals
const physics = createWasmStruct({ memory: buffer, baseOffset: 0 }, {
  velocity: { offset: 0, type: 'f64', initial: 42.5 },
  mass:     { offset: 8, type: 'f64', initial: 12.0 },
  energy:   { offset: 16, type: 'f64', initial: 255.0 }
});

const hexDump = computed(() => {
  const bytes = new Uint8Array(buffer, 0, 24);
  return Array.from(bytes.slice(0, 12))
    .map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
});

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header">
      <span class="badge-pill">Zero Serialization</span>
      <span class="repl-muted">24-Byte C-ABI Struct</span>
    </div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box">
        <small>0x00 Velocity (f64)</small>
        <strong class="repl-big-num">\${physics.velocity.signal}</strong>
      </div>
      <div class="repl-stat-box">
        <small>0x08 Mass (f64)</small>
        <strong class="repl-big-num">\${physics.mass.signal}</strong>
      </div>
    </div>
    <div class="repl-hex-bar">\${hexDump}</div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => {
        physics.velocity.signal.value = Number((physics.velocity.signal.value + 7.25).toFixed(2));
      }}>
        Mutate Signal → Flush to 0x00
      </button>
      <button class="repl-action-btn secondary" @click=\${() => {
        new DataView(buffer).setFloat64(8, physics.mass.signal.value + 5, true);
        physics.mass.syncFromWasm();
      }}>
        Simulate Rust Write @ 0x08
      </button>
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
    code: `// 1. Initialize Tactical Ballistic Reticle & Drone Telemetry
const reticle = createBallisticReticle({
  rangeMeters: 380,
  windMps: 4.8,
  magCapacity: 30
});
const drone = createDroneTelemetry();

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header">
      <span class="badge-pill">@zuari/hardware</span>
      <span class="repl-muted">Tactical Optic &amp; Drone OSD</span>
    </div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box">
        <small>Target Range</small>
        <strong class="repl-big-num">\${reticle.rangeMeters}m</strong>
      </div>
      <div class="repl-stat-box">
        <small>Elevation Drop</small>
        <strong class="repl-big-num">\${reticle.elevationMrad} MRAD</strong>
      </div>
      <div class="repl-stat-box">
        <small>Ammo Left</small>
        <strong class="repl-big-num">\${reticle.ammoRemaining} / 30</strong>
      </div>
      <div class="repl-stat-box">
        <small>Battery 6S</small>
        <strong class="repl-big-num">\${drone.batteryVoltage}V</strong>
      </div>
    </div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => {
        reticle.triggerShotImpulse(18.5);
      }}>
        Fire Recoil Impulse (-1)
      </button>
      <button class="repl-action-btn secondary" @click=\${() => {
        reticle.reloadMagazine();
      }}>
        Reload Mag
      </button>
      <button class="repl-action-btn secondary" @click=\${() => {
        reticle.rangeMeters.value = reticle.rangeMeters.value === 380 ? 550 : 380;
      }}>
        Toggle Range (550m)
      </button>
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
    code: `// 1. Initialize Quantum Node State (32-byte C-ABI Linear Memory)
const qNode = createQuantumNodeState({
  id: 'q0-primary',
  initialTheta: 0,
  initialPhi: 0,
  t2Micros: 120
});

const view = html\`
  <div class="repl-demo-card">
    <div class="repl-demo-header">
      <span class="badge-pill">@zuari/quantum</span>
      <span class="repl-muted">Bloch Sphere Statevector</span>
    </div>
    <div class="repl-stat-grid">
      <div class="repl-stat-box">
        <small>|0⟩ Probability</small>
        <strong class="repl-big-num">\${qNode.probZero}</strong>
      </div>
      <div class="repl-stat-box">
        <small>|1⟩ Probability</small>
        <strong class="repl-big-num">\${qNode.probOne}</strong>
      </div>
      <div class="repl-stat-box">
        <small>T2 Coherence</small>
        <strong class="repl-big-num">\${qNode.coherence}</strong>
      </div>
    </div>
    <div class="repl-btn-row">
      <button class="repl-action-btn" @click=\${() => {
        qNode.applyGate('H');
      }}>
        Hadamard (H Gate)
      </button>
      <button class="repl-action-btn" @click=\${() => {
        qNode.applyGate('X');
      }}>
        Pauli-X (NOT Gate)
      </button>
      <button class="repl-action-btn secondary" @click=\${() => {
        const result = qNode.measure();
        console.log('Qubit measured:', result);
      }}>
        Measure Qubit
      </button>
      <button class="repl-action-btn secondary" @click=\${() => {
        qNode.reset();
      }}>
        Reset State
      </button>
    </div>
  </div>
\`;

mount(view);`
  }
];

function stripImports(source: string): string {
  return source
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+/gm, '');
}

export function createReplView(onInteraction: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'repl-shell';

  const activePresetId = signal<string>(REPL_PRESETS[0]!.id);
  const execTimeMs = signal<string>('0.18');
  const errorMsg = signal<string | null>(null);

  // Preset selector bar
  const topBar = document.createElement('div');
  topBar.className = 'repl-topbar';

  const presetTabs = document.createElement('div');
  presetTabs.className = 'repl-preset-tabs';

  const editorArea = document.createElement('textarea');
  editorArea.className = 'repl-editor';
  editorArea.spellcheck = false;
  editorArea.setAttribute('aria-label', 'Zuari Live Code Editor');
  editorArea.value = REPL_PRESETS[0]!.code;

  const previewStage = document.createElement('div');
  previewStage.className = 'repl-preview-stage';

  const statusFooter = document.createElement('div');
  statusFooter.className = 'repl-status-footer';

  let currentCleanups: Array<() => void> = [];

  function runUserCode(rawCode: string) {
    // Cleanup previous mount & effects
    for (const fn of currentCleanups) {
      try {
        fn();
      } catch {
        // ignore cleanup errors
      }
    }
    currentCleanups = [];
    previewStage.innerHTML = '';
    errorMsg.value = null;

    const t0 = performance.now();

    const mount = (tplOrNode: unknown) => {
      if (
        tplOrNode &&
        typeof tplOrNode === 'object' &&
        'strings' in tplOrNode &&
        'values' in tplOrNode
      ) {
        const instance = render(tplOrNode as Parameters<typeof render>[0]);
        currentCleanups.push(instance.destroy);
        previewStage.appendChild(instance.fragment);
      } else if (tplOrNode instanceof Node) {
        previewStage.appendChild(tplOrNode);
      }
    };

    const trackedEffect = (fn: () => void | (() => void)) => {
      const dispose = effect(fn);
      currentCleanups.push(dispose);
      return dispose;
    };

    try {
      const executableBody = stripImports(rawCode);
      const runner = new Function(
        'signal',
        'computed',
        'effect',
        'batch',
        'html',
        'render',
        'mount',
        'root',
        'createMorphGlyph',
        'createSpatialAnchor',
        'bindAnchorToElement',
        'createWasmSignal',
        'createWasmStruct',
        'generateAnchorName',
        'setElementAnchor',
        'tetherToAnchor',
        'createBallisticReticle',
        'createDroneTelemetry',
        'createQuantumNodeState',
        executableBody
      );

      runner(
        signal,
        computed,
        trackedEffect,
        batch,
        html,
        render,
        mount,
        previewStage,
        createMorphGlyph,
        createSpatialAnchor,
        bindAnchorToElement,
        createWasmSignal,
        createWasmStruct,
        generateAnchorName,
        setElementAnchor,
        tetherToAnchor,
        createBallisticReticle,
        createDroneTelemetry,
        createQuantumNodeState
      );

      const dt = Math.max(0.05, performance.now() - t0);
      execTimeMs.value = dt.toFixed(2);
    } catch (err) {
      errorMsg.value = err instanceof Error ? err.message : String(err);
    }

    updateFooter();
  }

  function updateFooter() {
    if (errorMsg.value) {
      statusFooter.innerHTML = `<span class="repl-status-err">Syntax / Runtime Error: ${errorMsg.value}</span>`;
    } else {
      statusFooter.innerHTML = `
        <span class="repl-status-ok">● Live Direct-to-DOM Execution</span>
        <span class="repl-status-time">Compiled & mounted in <strong>${execTimeMs.value} ms</strong> (0 Virtual DOM nodes)</span>
      `;
    }
  }

  REPL_PRESETS.forEach((preset) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'repl-preset-btn';
    btn.textContent = preset.title;

    effect(() => {
      btn.setAttribute('data-active', String(activePresetId.value === preset.id));
    });

    btn.addEventListener('click', () => {
      activePresetId.value = preset.id;
      editorArea.value = preset.code;
      runUserCode(preset.code);
      onInteraction();
    });

    presetTabs.appendChild(btn);
  });

  topBar.appendChild(presetTabs);

  // Split workbench: Code Editor + Live Output
  const workbench = document.createElement('div');
  workbench.className = 'repl-workbench';

  const editorPane = document.createElement('div');
  editorPane.className = 'repl-editor-pane';

  const editorHeader = document.createElement('div');
  editorHeader.className = 'repl-pane-header';
  editorHeader.innerHTML = `<span>LIVE SIGNAL EDITOR (EDITABLE)</span><span class="repl-kbd-hint">Auto-runs on edit</span>`;

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  editorArea.addEventListener('input', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runUserCode(editorArea.value);
      onInteraction();
    }, 180);
  });

  editorPane.appendChild(editorHeader);
  editorPane.appendChild(editorArea);

  const outputPane = document.createElement('div');
  outputPane.className = 'repl-output-pane';

  const outputHeader = document.createElement('div');
  outputHeader.className = 'repl-pane-header';
  outputHeader.innerHTML = `<span>LIVE DOM OUTPUT</span><span class="repl-kbd-hint">W3C DOM Parts</span>`;

  outputPane.appendChild(outputHeader);
  outputPane.appendChild(previewStage);

  workbench.appendChild(editorPane);
  workbench.appendChild(outputPane);

  container.appendChild(topBar);
  container.appendChild(workbench);
  container.appendChild(statusFooter);

  // Initial execution
  runUserCode(REPL_PRESETS[0]!.code);

  return container;
}
