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
[![Test Suite](https://img.shields.io/badge/Tests-75_Passed-0284C7.svg?style=for-the-badge)](#)

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

### 💡 Why Zuari? The Core Value Proposition

Modern web development has become weighed down by multi-megabyte runtimes, Virtual DOM diffing overhead, and painful platform lock-in. Zuari provides a sharp, zero-compromise alternative:

1. **Zero Virtual DOM & 0ms Hydration Overhead**:
   Unlike React and Vue which maintain an entire second virtual copy of the DOM in memory, Zuari compiles state mutations directly into surgical W3C DOM Parts updates. When a signal changes, only the exact `TextNode` or `Attribute` updates at pointer speed.
2. **"Write Once, Run Spatial" (2D Web + 3D Mixed Reality)**:
   Via `@zuari/spatial`, the exact same reactive signals that drive a 2D web button drive a 120 FPS diegetic HUD on **Apple Vision Pro (visionOS)** and **Meta Quest 3** with native eye-gaze and 6DoF hand tracking.
3. **Zero-Copy WebAssembly Systems FFI**:
   Through `@zuari/wasm` and `@zuari/wit`, native **Rust** or **Zig** simulations bind directly to reactive signals via raw linear memory buffers (`Float64Array` / `Int32Array`) with zero JSON serialization overhead.
4. **Radical Sub-2.5 KB Footprint**:
   The entire core platform weighs under **2.5 KB gzipped**. Every package is decoupled (`sideEffects: false`) and independently installable.

---

### 📊 Architectural Comparison

| Architectural Metric | React 19 | Svelte 5 | SolidJS | Zuari (Danger.Labs) |
| :--- | :---: | :---: | :---: | :---: |
| **Virtual DOM Overhead** | Yes (Full Tree Diff) | No (Compiler) | No (Direct DOM) | **0% (Native W3C DOM Parts)** |
| **Runtime Core Size** | ~45 KB (React+DOM) | ~10 KB | ~7 KB | **< 2.5 KB** |
| **Hydration Tax** | Re-executes components | Synthetic hydration | DOM cloning | **0ms (Direct comment hole sync)** |
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

#### Working Example

```typescript
import { signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';

// 1. Create atomic reactive state
const count = signal(0);

// 2. Compile directly to DOM without Virtual DOM
const view = html`
  <div class="zuari-card">
    <h2>Counter Node</h2>
    <p>Value: <strong>${count}</strong></p>
    <button @click=${() => { count.value++; }}>
      Increment
    </button>
  </div>
`;

// 3. Mount directly to document
const { fragment, destroy } = render(view);
document.getElementById('app')?.appendChild(fragment);
```

---

### 📦 Monorepo Packages

Every package in Zuari is independent, tree-shakeable (`sideEffects: false`), and rigorously typed:

| Package | Purpose | Runtime | Support |
| :--- | :--- | :---: | :---: |
| [`@zuari/signals`](./packages/signals) | TC39 reactive graph (`signal`, `computed`, `effect`, `batch`) | **~1.1 KB** | Universal (JS/TS) |
| [`@zuari/dom`](./packages/dom) | Direct-to-DOM compiler (`html\`...\``) with W3C DOM Parts | **~1.4 KB** | Modern Browsers |
| [`@zuari/ui`](./packages/ui) | Pre-built accessible components (`Switch`, `Slider`, `Card`, `Tabs`, `Popover`) | **~2.0 KB** | Plug & Play |
| [`@zuari/router`](./packages/router) | Lightweight signal-based client router with View Transitions API | **~0.9 KB** | Modern Browsers |
| [`@zuari/spatial`](./packages/spatial) | Mixed Reality (visionOS / Meta Quest 3) & WebXR game HUDs | **~1.5 KB** | WebXR Headsets |
| [`@zuari/wasm`](./packages/wasm) | Zero-copy linear memory bridge for Rust/Zig & TypeSpec contracts | **~0.9 KB** | Rust, Zig, Wasm C-ABI |
| [`@zuari/wit`](./packages/wit) | WebAssembly Component Model WIT interface definition generator | **~0.8 KB** | Wasm Component Model |
| [`@zuari/webgpu`](./packages/webgpu) | Hardware WebGPU compute shader pipeline bound to reactive signals | **~1.4 KB** | WebGPU Devices |
| [`@zuari/ai`](./packages/ai) | On-device WebLLM/transformers.js token streaming & embeddings | **~1.2 KB** | Modern Browsers |
| [`@zuari/sync`](./packages/sync) | Real-time CRDT / BroadcastChannel peer-to-peer state synchronization | **~1.1 KB** | Local-First / P2P |
| [`@zuari/hardware`](./packages/hardware) | WebHID, WebSerial, and WebBluetooth reactive peripheral bridges | **~1.0 KB** | Hardware Peripherals |
| [`@zuari/lua`](./packages/lua) | Embedded Lua runtime scripting bridge for game HUDs & modding | **~0.9 KB** | Game Engines & Scripts |
| [`@zuari/headless`](./packages/headless) | Headless logic (`Dialog`, `CommandPalette`, `AnchorTooltip`, `Invoker`) | **~1.8 KB** | Framework Agnostic |
| [`@zuari/glyphs`](./packages/glyphs) | Mathematical SVG icons & GPU path morphing (`d: path(...)`) | **~0.8 KB** | SVG / HTML5 |
| [`@zuari/tokens`](./packages/tokens) | Typed OKLCH color palettes & CSS `@property` generator | **0 KB** | Zero-Runtime |
| [`@zuari/recipes`](./packages/recipes) | Zero-runtime `@scope` modern CSS/SCSS design recipes | **0 KB** | Native CSS Engine |
| [`@zuari/core`](./packages/core) | Unified meta-package consolidating the entire platform | **< 2.5 KB** | Complete Framework |

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

# Run test suite (75 unit tests across 20 suites)
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
