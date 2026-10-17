import { signal, computed, effect } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import {
  createPolyglotKernelBridge,
  instantiateEmbeddedWasmKernel,
  emitTypeSpec,
  parseWitRecord,
  witRecordToTypeSpec,
  type SystemsLanguageTarget
} from '@zuari/wasm';
import { createLuaEnvironment } from '@zuari/lua';
import { createGPUBufferSignal, createComputeShader } from '@zuari/webgpu';
import {
  createQuantumNodeState,
  createQuantumRegister,
  createCognitiveUnit
} from '@zuari/quantum';

export function createPolyglotWorkbenchView(onInteraction: () => void): HTMLElement {
  const shell = document.createElement('div');
  shell.className = 'hw-lab-shell';

  // 1. Live QuantumNodeState (32-byte zero-copy C-ABI memory buffer) + 2-Qubit Register
  const qNode = createQuantumNodeState({
    id: 'qubit-alpha-0',
    initialTheta: Math.PI / 4,
    initialPhi: 0,
    t2Micros: 95
  });
  const qRegister = createQuantumRegister(2);
  qRegister.entangleBellPair(0, 1);

  // 2. Neuromorphic CognitiveUnit coupled directly to QuantumNodeState
  const cogUnit = createCognitiveUnit({
    id: 'lif-cortex-01',
    firingThreshold: 1.0,
    coupledQuantumNode: qNode
  });

  // 3. Shared 64-byte WebAssembly / Native C-ABI Linear Memory Buffer
  const sharedMemory = new ArrayBuffer(64);
  const kernelBridge = createPolyglotKernelBridge(
    { memory: sharedMemory },
    {
      name: 'QuantumNodeState',
      purpose: 'Zero-copy Quantum Qubit & Neuromorphic Cognitive Unit across Rust, Zig, C++23, Go, Python, WGSL & OpenQASM 3.0',
      fields: [
        { name: 'thetaRad', type: 'f64', initial: 0.7854 },
        { name: 'coherence', type: 'f64', initial: 1.0 },
        { name: 'salience', type: 'f32', initial: 0.65 },
        { name: 'spikeCount', type: 'u32', initial: 0 }
      ]
    }
  );

  // Synchronize QuantumNodeState & CognitiveUnit into the shared C-ABI polyglot struct
  effect(() => {
    kernelBridge.signals.thetaRad!.signal.value = Number(qNode.theta.value.toFixed(4));
    kernelBridge.signals.coherence!.signal.value = qNode.coherence.value;
    kernelBridge.signals.salience!.signal.value = cogUnit.salienceScore.value;
    kernelBridge.signals.spikeCount!.signal.value = cogUnit.spikeCount.value;
  });

  // 4. Live WebAssembly Binary Kernel (compiled directly from raw Wasm bytecode)
  const wasmVm = instantiateEmbeddedWasmKernel();

  // 5. Embedded Lua Scripting VM bound to the exact same reactive signals
  const luaVm = createLuaEnvironment();
  luaVm.bindSignal('spikeCount', cogUnit.spikeCount);
  luaVm.bindSignal('coherence', qNode.coherence);

  // 6. WebGPU Compute Shader Pipeline bound to a reactive GPUBuffer
  const gpuParticles = createGPUBufferSignal({
    initialData: new Float32Array([1.0, 0.0, 0.0, 1.0]),
    format: 'f32',
    label: 'wgsl-quantum-amplitudes'
  });
  const wgslShader = createComputeShader({
    code: `@group(0) @binding(0) var<storage, read_write> statevec: array<f32>;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  statevec[id.x] = statevec[id.x] * 0.92 + 0.08;
}`,
    bindings: [gpuParticles],
    cpuFallback: (views) => {
      const arr = views[0] as Float32Array;
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Number((arr[i]! * 0.92 + 0.08).toFixed(3));
      }
    }
  });

  // 7. WASI 0.2 WIT & TypeSpec Contract
  const witSource = `record quantum-node-state {
  theta-rad: f64,
  coherence: f64,
  salience: f32,
  spike-count: u32
}`;
  const witRecord = parseWitRecord(witSource);
  const tspSource = emitTypeSpec(witRecordToTypeSpec(witRecord, 'Zuari.Quantum'));

  type PolyglotTab = SystemsLanguageTarget | 'qasm' | 'lua' | 'wit';
  const activeLang = signal<PolyglotTab>('qasm');
  const generatedCode = signal<string>(qRegister.toOpenQASM3());

  const blochSummary = computed(() => {
    const b = qNode.blochVector.value;
    return `Bloch (x:${b.x.toFixed(2)}, y:${b.y.toFixed(2)}, z:${b.z.toFixed(2)}) | Bell |00⟩:${(qRegister.probabilities.value[0]! * 100).toFixed(0)}% |11⟩:${(qRegister.probabilities.value[3]! * 100).toFixed(0)}% (C=${qRegister.entanglementConcurrence.value})`;
  });

  const langTabs: Array<{ id: PolyglotTab; label: string }> = [
    { id: 'qasm', label: 'OpenQASM 3.0 (QPU)' },
    { id: 'rust', label: 'Rust (#[repr(C)])' },
    { id: 'zig', label: 'Zig (extern struct)' },
    { id: 'cpp', label: 'C++23 (alignas)' },
    { id: 'wgsl', label: 'WGSL (WebGPU)' },
    { id: 'python', label: 'Python / Qiskit' },
    { id: 'lua', label: 'Lua (Hot-Script)' },
    { id: 'wit', label: 'WIT + TypeSpec' }
  ];

  function updateCodePreview(tab: PolyglotTab) {
    if (tab === 'qasm') {
      generatedCode.value = `// [OpenQASM 3.0 Quantum Circuit & Cognitive Telemetry]\n${qRegister.toOpenQASM3()}`;
    } else if (tab === 'lua') {
      generatedCode.value = `-- [Lua Embedded Cognitive & Quantum Rules]\n-- Bound directly to @zuari/quantum signals\ncoherence = coherence * 0.95\nspikeCount = spikeCount + 1`;
    } else if (tab === 'wit') {
      generatedCode.value = `// [WASI 0.2 .wit + Microsoft TypeSpec Contract]\n${witSource}\n\n${tspSource}`;
    } else {
      generatedCode.value = kernelBridge.emitSource(tab);
    }
  }

  const topBar = document.createElement('div');
  topBar.className = 'hw-lab-topbar';

  const tabGroup = document.createElement('div');
  tabGroup.className = 'repl-preset-tabs';

  langTabs.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'repl-preset-btn';
    btn.textContent = item.label;
    effect(() => {
      btn.setAttribute('data-active', String(activeLang.value === item.id));
    });
    btn.addEventListener('click', () => {
      activeLang.value = item.id;
      updateCodePreview(item.id);
      onInteraction();
    });
    tabGroup.appendChild(btn);
  });

  topBar.appendChild(tabGroup);
  shell.appendChild(topBar);

  const view = html`
    <div class="hw-panel-grid" style="margin-top: 12px;">
      <div class="hw-controls-col">
        <div class="repl-demo-header">
          <span class="badge-pill">@zuari/quantum • QuantumNodeState + CognitiveUnit</span>
          <span class="repl-muted">${kernelBridge.layout.byteSize}B Zero-Copy C-ABI</span>
        </div>

        <div class="repl-stat-grid">
          <div class="repl-stat-box">
            <small>P(|0⟩) / P(|1⟩)</small>
            <strong class="repl-big-num">${qNode.probZero} / ${qNode.probOne}</strong>
          </div>
          <div class="repl-stat-box">
            <small>Coherence (T₂)</small>
            <strong class="repl-big-num">${qNode.coherence}</strong>
          </div>
          <div class="repl-stat-box">
            <small>Cognitive Salience (Spikes: ${cogUnit.spikeCount})</small>
            <strong class="repl-big-num">${cogUnit.salienceScore}</strong>
          </div>
        </div>

        <div class="repl-hex-bar">${blochSummary}</div>

        <div class="repl-btn-row">
          <button class="repl-action-btn" @click=${() => {
            qNode.applyGate('H');
            qRegister.applySingleGate('H', 0);
            qRegister.applyCNOT(0, 1);
            if (activeLang.value === 'qasm') updateCodePreview('qasm');
            onInteraction();
          }}>
            Hadamard (H) + Bell CNOT
          </button>

          <button class="repl-action-btn secondary" @click=${() => {
            const nextTheta = wasmVm.stepHarmonic(qNode.theta.value, 0.35, 1.0);
            qNode.theta.value = Number((nextTheta % Math.PI).toFixed(4));
            qRegister.applySingleGate('RY', 0, qNode.theta.value);
            if (activeLang.value === 'qasm') updateCodePreview('qasm');
            onInteraction();
          }}>
            Wasm RY(θ) Pulse
          </button>

          <button class="repl-action-btn secondary" @click=${() => {
            cogUnit.integrateStimulus(0.85);
            cogUnit.applySTDP(12);
            if (activeLang.value === 'qasm') updateCodePreview('qasm');
            onInteraction();
          }}>
            Fire LIF Cognitive Spike
          </button>

          <button class="repl-action-btn secondary" @click=${() => {
            qNode.reset();
            qRegister.entangleBellPair(0, 1);
            cogUnit.reset();
            if (activeLang.value === 'qasm') updateCodePreview('qasm');
            onInteraction();
          }}>
            Reset |00⟩
          </button>
        </div>
      </div>

      <div class="repl-editor-pane" style="border-radius: 12px; overflow: hidden;">
        <div class="repl-pane-header">
          <span>QUANTUM & POLYGLOT CODEGEN</span>
          <span class="repl-kbd-hint">OpenQASM 3.0 • Rust • Zig • C++23 • WGSL</span>
        </div>
        <pre id="polyglot-code-box" style="margin: 0; padding: 14px; font-size: 0.78rem; line-height: 1.45; color: #a5f3fc; overflow-x: auto; font-family: ui-monospace, monospace;"></pre>
      </div>
    </div>
  `;

  shell.appendChild(render(view).fragment);

  const codeBox = shell.querySelector('#polyglot-code-box');
  if (codeBox) {
    effect(() => {
      codeBox.textContent = generatedCode.value;
    });
  }

  return shell;
}
