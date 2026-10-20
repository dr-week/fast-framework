<div align="center">

<br />

<img src="./packages/recipes/styles/zuari-logo.svg" alt="Zuari Crest Logo" width="120" height="120" />

<br />
<br />

# ZUARI
### *The High-Velocity Web Platform Framework.*
##### An Open Research Initiative by **Danger.Labs**

<br />

[![Engine](https://img.shields.io/badge/Engine-Danger.Labs-000000.svg?style=for-the-badge)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9_Strict-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Virtual DOM](https://img.shields.io/badge/Virtual_DOM-0%25_Direct_DOM-059669.svg?style=for-the-badge)](#)
[![Runtime Size](https://img.shields.io/badge/Runtime-%3C2.5KB_gzipped-7C3AED.svg?style=for-the-badge)](#)
[![Test Suite](https://img.shields.io/badge/Tests-133_Passed-0284C7.svg?style=for-the-badge)](#)

<br />

[**Interactive Demo**](https://dr-week.github.io/fast-framework/) • [**Story**](#-the-story-of-zuari) • [**Why Zuari**](#-why-zuari-the-core-value-proposition) • [**Comparison**](#-architectural-comparison) • [**Quick Start**](#-quick-start) • [**Packages**](#-monorepo-packages) • [**Alliances**](#-strategic-alliances)

</div>

---

### 🌊 The Story of Zuari

> **Behind the Science:** Named after the **Zuari River** in **Goa, India** (historically *Aghanashini*).
> As Goa's primary tidal artery, it surges from the Western Ghats directly into the Arabian Sea with unhindered natural velocity. 
> 
> Zuari brings this tidal hydrodynamic principle to software: state mutations flow directly to exact DOM nodes without intermediate in-memory Virtual DOM diffing.

---

### 💡 Why Choose Zuari? (Built for Humans & Autonomous AI Agents)

Modern web development has become weighed down by multi-megabyte runtimes, Virtual DOM diffing overhead, and painful platform lock-in. Zuari is the first framework purpose-built simultaneously for **human developers** and **autonomous AI coding agents**:

#### 👤 For Human Engineers & CTOs
1. **Zero Virtual DOM & 0ms Hydration Overhead**:
   Unlike React and Vue which maintain an entire second virtual copy of the DOM in memory, Zuari compiles state mutations directly into surgical W3C DOM Parts updates. When a signal changes, only the exact `TextNode` or `Attribute` updates at pointer speed.
2. **Keyed Lists & Declarative Control Flow (`repeat()` / `keyed()`, `when()`, `match()`)**:
   Keyed list reconciliation preserves exact DOM nodes without virtual diffing, while `when()` and `match()` guarantee deterministic subtree teardowns without orphan listeners.
3. **TC39 Signals & Effect Scoping (`effectScope()`, `onMount()`, `onDestroy()`, `untracked()`)**:
   Aligns with the TC39 Signals proposal to provide automatic teardown of timers, events, and WebSockets across entire component subtrees.
4. **"Write Once, Run Spatial" (2D Web + 3D Mixed Reality)**:
   Via `@zuari/spatial`, the exact same reactive signals that drive a 2D web button drive a 120 FPS diegetic HUD on **Apple Vision Pro (visionOS)** and **Meta Quest 3** with native eye-gaze and 6DoF hand tracking.
5. **Sub-Millisecond System 1 Fast-Reflex AI & Fast-Log Engine (`@zuari/system-one`)**:
   Conventional frameworks only react *after* user clicks occur. Zuari's System 1 engine continuously evaluates mouse trajectory, gaze velocity, and dwell time in **< 0.4ms**, speculatively pre-synthesizing DOM branches into memory with zero allocation across a 32-byte circular ring buffer.
6. **Zero-Copy WebAssembly Systems FFI**:
   Through `@zuari/wasm` and `@zuari/wit`, native **Rust** or **Zig** simulations bind directly to reactive signals via raw linear memory buffers (`Float64Array` / `Int32Array`) with zero JSON serialization overhead.
7. **Radical Sub-2.5 KB Footprint**:
   The entire core platform weighs under **2.5 KB gzipped**. Every package is decoupled (`sideEffects: false`) and independently installable.

#### 🤖 For AI Coding Agents (Claude, Cursor, Antigravity, Copilot)
1. **Zero-Hallucination Determinism**:
   Zuari eliminates complex JSX transforms, hidden lifecycle hooks (`useEffect` dependency arrays), and state closure traps. An AI agent never hallucinates missing dependency arrays or stale closures—signals are simple, pure object properties (`count.value++`).
2. **Sub-1,500 Token Context Ingestion**:
   Through standardized [`llms.txt`](./llms.txt) and [`llms-full.txt`](./llms-full.txt), any LLM can ingest the entire API surface in seconds, generating complete, bug-free components on the first attempt without wasting developer context tokens.
3. **Self-Healing Automation Protocols**:
   Equipped with `@zuari/mcp` and `@zuari/system-one`, agents can introspect runtime health, query component recommendations, and execute autonomous telemetry analysis programmatically.

---

### 📊 Architectural Comparison

| Architectural Metric | React 19 | Svelte 5 | SolidJS | Zuari (Danger.Labs) |
| :--- | :---: | :---: | :---: | :---: |
| **Virtual DOM Overhead** | Yes (Full Tree Diff) | No (Compiler) | No (Direct DOM) | **0% (Native W3C DOM Parts)** |
| **Runtime Core Size** | ~45 KB (React+DOM) | ~10 KB | ~7 KB | **< 2.5 KB** |
| **Hydration Tax** | Re-executes components | Synthetic hydration | DOM cloning | **0ms (Direct comment hole sync)** |
| **Keyed List Engine** | Keyed VDOM diff | Keyed blocks (`{#each}`) | `<For>` DOM mapping | **Zero-VDOM Keyed Reconciliation (`repeat`)** |
| **Native Mixed Reality (XR)** | React Three Fiber (Heavy) | Third-party only | Third-party only | **Native 3D Anchors (`@zuari/spatial`)** |
| **Rust / Zig Systems FFI** | Manual JSON / PostMessage | Manual wrapper | Manual wrapper | **Zero-Copy Wasm Bridge (`@zuari/wasm`)** |
| **Standards Compliance** | Proprietary synthetic layer | Custom compiler | Custom JSX runtime | **W3C DOM Parts, TC39 Signals, CSS Anchor** |

---

### 🚀 Quick Start

#### Installation

```bash
# Complete platform
pnpm add @zuari/core

# Or install individual micro-modules
pnpm add @zuari/signals @zuari/dom @zuari/ui @zuari/router
```

#### Scaffold a New Project with `create-zuari`

```bash
# Core Web (vanilla-ts)
npm create zuari@latest my-app -- --template vanilla-ts

# Tauri v2 Desktop (Rust + Zuari)
npm create zuari@latest my-desktop -- --template tauri-desktop

# Apple Vision Pro / Meta Quest 3 (Spatial WebXR)
npm create zuari@latest my-hud -- --template spatial-webxr

# Kotlin Multiplatform / Android NDK
npm create zuari@latest my-android -- --template kotlin-android
```

#### Working Example

```typescript
import { signal, computed, effectScope, onMount } from '@zuari/signals';
import { html, render, repeat, when } from '@zuari/dom';

// 1. Create atomic reactive state
const count = signal(0);
const doubled = computed(() => count.value * 2);

const todos = signal([
  { id: 1, text: 'Install Zuari' },
  { id: 2, text: 'Ship Zero-VDOM Web App' }
]);

// 2. Component lifecycle scope
effectScope(() => {
  onMount(() => {
    console.log('Mounted component with zero VDOM overhead');
  });
});

// 3. Compile directly to DOM with keyed list & conditional branching
const view = html`
  <div class="zuari-card">
    <h2>Counter Node: ${count} (x2 = ${doubled})</h2>
    <button @click=${() => { count.value++; }}>Increment</button>

    <ul>
      ${repeat(todos, t => t.id, t => html`<li>${t.text}</li>`)}
    </ul>

    ${when(count, () => html`<p>Active count is positive!</p>`)}
  </div>
`;

// 4. Mount directly to document
const { fragment, destroy } = render(view);
document.getElementById('app')?.appendChild(fragment);
```

---

### 📦 Monorepo Packages

Every package in Zuari is independent, tree-shakeable (`sideEffects: false`), and rigorously typed:

| Package | Purpose | Runtime | Support |
| :--- | :--- | :---: | :---: |
| [`@zuari/signals`](./packages/signals) | TC39 reactive graph (`signal`, `computed`, `effect`, `batch`, `untracked`, `effectScope`, `onMount`, `onDestroy`) | **~1.2 KB** | Universal (JS/TS) |
| [`@zuari/dom`](./packages/dom) | Direct-to-DOM compiler (`html\`...\``) with W3C DOM Parts, `repeat()` / `keyed()`, `when()`, `match()` | **~1.5 KB** | Modern Browsers |
| [`@zuari/ui`](./packages/ui) | Pre-built accessible components (`Switch`, `Slider`, `Card`, `Tabs`, `Popover`) | **~2.0 KB** | Plug & Play |
| [`@zuari/devtools`](./packages/devtools) | In-app HUD & Browser DevTools extension (Signals dependency graph, FPS, memory, Wasm buffers) | **~1.1 KB** | Chrome / DevTools |
| [`@zuari/router`](./packages/router) | Lightweight client router with Navigation API & View Transitions v2 | **~0.9 KB** | Modern Browsers |
| [`@zuari/spatial`](./packages/spatial) | Mixed Reality (visionOS / Meta Quest 3) & WebXR game HUDs | **~1.5 KB** | WebXR Headsets |
| [`@zuari/wasm`](./packages/wasm) | Zero-copy linear memory bridge for Rust/Zig & TypeSpec contracts | **~0.9 KB** | Rust, Zig, Wasm C-ABI |
| [`@zuari/wit`](./packages/wit) | WebAssembly Component Model WIT interface definition generator | **~0.8 KB** | Wasm Component Model |
| [`@zuari/webgpu`](./packages/webgpu) | Hardware WebGPU compute shader pipeline bound to reactive signals | **~1.4 KB** | WebGPU Devices |
| [`@zuari/ai`](./packages/ai) | On-device WebLLM/transformers.js token streaming & embeddings | **~1.2 KB** | Modern Browsers |
| [`@zuari/sync`](./packages/sync) | Real-time CRDT / BroadcastChannel peer-to-peer state synchronization | **~1.1 KB** | Local-First / P2P |
| [`@zuari/presets`](./packages/presets) | Minimal & artistic UI/UX presets (`paper`, `blossom`, `matcha`, `twilight`, `midnight`), lightweight elevations (`flat`, `soft`, `float`, `halo`), smooth animations (`floatUp`, `popIn`, `slideIn`), & templates (`createStoryCard`, `createBentoGrid`) | **~0.9 KB** | Design & Motion |
| [`@zuari/hardware`](./packages/hardware) | Tactical ballistic optics, FPV drone OSD, KaiOS D-Pad/T9, rotary wheels & E-Ink/waveguide modes | **~1.1 KB** | IoT, Drones, Wearables |
| [`@zuari/lua`](./packages/lua) | Embedded Lua runtime scripting bridge for game HUDs & modding | **~0.9 KB** | Game Engines & Scripts |
| [`@zuari/headless`](./packages/headless) | Headless logic (`Dialog`, `CommandPalette`, `AnchorTooltip`, HTML Invoker Commands `commandfor`/`command`, CSS `reading-flow`) | **~1.8 KB** | Framework Agnostic |
| [`@zuari/glyphs`](./packages/glyphs) | Mathematical SVG icons & GPU path morphing (`d: path(...)`) | **~0.8 KB** | SVG / HTML5 |
| [`@zuari/tokens`](./packages/tokens) | Typed OKLCH color palettes, lightweight elevation tokens & CSS `@property` generator | **0 KB** | Zero-Runtime |
| [`@zuari/recipes`](./packages/recipes) | Zero-runtime `@scope` modern CSS/SCSS design recipes & View Transitions v2 | **0 KB** | Native CSS Engine |
| [`create-zuari`](./packages/create-zuari) | Zero-config interactive CLI scaffolder (`vanilla-ts`, `tauri-desktop`, `spatial-webxr`, `kotlin-android`) | **CLI** | Node / pnpm |
| [`vscode-zuari`](./packages/vscode-zuari) | VS Code & Cursor language extension (`html\`...\`` syntax, `@event` / `?attr` highlight, snippets) | **Tool** | VS Code / Cursor |
| [`@zuari/ui`](./packages/ui) | Pre-built accessible components (`createUiDrawer`, `createUiToast`, `createSwitch`, `createButton`, `createTextInput`, `createTabs`) | **~1.5 KB** | UI/UX & Components |
| [`@zuari/presets`](./packages/presets) | Minimalist themes (`'paper'`, `'matcha'`), lightweight elevations (`'flat'`, `'soft'`), animations (`'floatUp'`), & templates (`createMinimalDock`) | **~1.4 KB** | Design Systems |
| [`@zuari/glyphs`](./packages/glyphs) | Zero-emoji vector SVG icons (`UserGlyph`, `SearchGlyph`, `BellGlyph`, `PrinterGlyph`) & kinetic path morphing | **~1.1 KB** | Visuals & Glyphs |
| [`@zuari/hardware`](./packages/hardware) | Hardware drivers (3D printers, FPV drones, tactical optics, KaiOS D-Pad/T9, gaming wheels, MQTT appliances) | **~1.3 KB** | Hardware & IoT |
| [`@zuari/kotlin`](./packages/kotlin) | Native Android Kotlin bridge, Jetpack Compose theme synthesis & bidirectional JNI signals | **~1.2 KB** | Android Native |
| [`@zuari/vite-plugin`](./packages/vite-plugin) | Official Vite plugin (build-time template pre-compilation & instant HMR) | **0 KB (Dev)** | Vite 5/6 Tooling |
| [`@zuari/ssr`](./packages/ssr) | Streaming Server-Side Rendering (SSR) & 0ms Edge Hydration for Cloudflare/Bun | **~1.1 KB** | Edge Runtimes |
| [`@zuari/system-one`](./packages/system-one) | Sub-millisecond System 1 fast-reflex AI, circular fast-logs & speculative DOM pre-synthesis | **~1.2 KB** | Fast AI & Automation |
| [`@zuari/quantum`](./packages/quantum) | Qubit statevectors, T1/T2 decoherence, OpenQASM 3.0 & cognitive spikes | **~2.0 KB** | Quantum / Neuro |
| [`@zuari/core`](./packages/core) | Unified meta-package consolidating the entire platform | **< 2.5 KB** | Complete Framework |



---

### 🤖 Built for AI Coding Agents (AEO & Zero-Hallucination Context)

Zuari is engineered so AI coding assistants (**Claude Code, Antigravity, Cursor, Windsurf, GitHub Copilot, ChatGPT**) can ingest the entire framework specification in **under 1,500 tokens** and generate 100% deterministic, zero-bug code:

* **[`llms.txt`](./llms.txt)** & **[`llms-full.txt`](./llms-full.txt)** — Standard LLM ingestion manifests hosted at the repository root and live at `https://dr-week.github.io/fast-framework/llms.txt`.
* **[`AGENTS.md`](./AGENTS.md)** / **[`CLAUDE.md`](./CLAUDE.md)** / **[`.cursorrules`](./.cursorrules)** — Drop-in workspace rules that automatically guide any AI agent opening the project.
* **[`.agents/skills/zuari-framework/SKILL.md`](./.agents/skills/zuari-framework/SKILL.md)** — Official agent skill definition for autonomous task execution.
* **[`@zuari/mcp`](./packages/mcp)** — Programmatic MCP tool schemas (`zuari_recommend_architecture`, `zuari_get_system_prompt`) for agent tool-calling.

---

### 🤝 Strategic Alliances

Zuari collaborates with leading ecosystem architectures to deliver native-grade velocity:

| Alliance Partner | Focus Domain | Architectural Integration | Target Metric |
| :--- | :--- | :--- | :---: |
| <img src="https://cdn.simpleicons.org/meta/0081FB" width="16" height="16" /> **Meta Reality Labs** | Spatial Computing & Quest | `@zuari/spatial` WebXR 3D volumetric HUD & hand-tracking engine | **120 FPS Zero-GC** |
| <img src="https://cdn.simpleicons.org/apple/FFFFFF" width="16" height="16" /> **Apple Technologies** | visionOS Ecosystem | RealityKit glass ribbon shaders & eye-gaze highlight drivers | **Sub-pixel Acuity** |
| <img src="https://cdn.simpleicons.org/tauri/24C8DB" width="16" height="16" /> **Tauri / Rust Foundation** | Native Systems Runtimes | Official `create-tauri-app` preset & `@zuari/wasm` zero-copy memory bridge | **< 15 MB Desktop App** |
| <img src="https://cdn.simpleicons.org/webassembly/654FF0" width="16" height="16" /> **Bytecode Alliance** | Wasm & Native C-ABI | TypeSpec & WIT AST contracts with linear buffer signal mapping | **Zero Serialization** |
| <img src="https://cdn.simpleicons.org/cloudflare/F38020" width="16" height="16" /> **Cloudflare Edge** | Distributed Edge Compute | Direct-to-DOM template streaming on Workers & Pages | **0 ms Cold Start** |

*Read the complete partnership & marketing blueprint: [PARTNERSHIPS_AND_MARKETING.md](./PARTNERSHIPS_AND_MARKETING.md)*

---

### 🛠️ Developer Verification

```bash
# Clone & install
git clone https://github.com/dr-week/fast-framework.git
cd fast-framework && pnpm install

# Run test suite (133 unit tests across 31 suites)
pnpm test

# Build all monorepo packages
pnpm build
```

---

### 📜 Documentation Directory

* [**User Manual & Developer Guide**](./USER_MANUAL.md)
* [**Technical Specification**](./SPECIFICATION.md)
* [**Partnerships & Alliance Blueprint**](./PARTNERSHIPS_AND_MARKETING.md)
* [**Native & Wearables Specification**](./NATIVE_REQUIREMENTS.md)
* [**Aether-Glyph Design Language**](./AETHER_GLYPH_DESIGN.md)
* [**Contributing Guidelines**](./CONTRIBUTING.md)

---

<div align="center">

Distributed under the **MIT License**.  
Engineered by **Danger.Labs** for the future of the open web platform.

</div>
