<div align="center">

<br />

<img src="./packages/recipes/styles/zuari-logo.svg" alt="Zuari Crest Logo" width="128" height="128" />

<br />
<br />

# ZUARI
### *The High-Velocity Web Platform Framework.*
##### An Open Research Initiative by **Danger.Labs**

<br />

[![Engine](https://img.shields.io/badge/Architecture-Danger.Labs-000000.svg?style=for-the-badge)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9_Strict-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Virtual DOM](https://img.shields.io/badge/Virtual_DOM-0%25_Direct_DOM-059669.svg?style=for-the-badge)](#)
[![Runtime Size](https://img.shields.io/badge/Runtime-%3C2.5KB_gzipped-7C3AED.svg?style=for-the-badge)](#)
[![W3C Standards](https://img.shields.io/badge/W3C-DOM_Parts_%26_Anchor_CSS-0891B2.svg?style=for-the-badge)](#)
[![Origin](https://img.shields.io/badge/Origin-Goa%2C_India-EA580C.svg?style=for-the-badge)](#)

<br />

[**Interactive Demo**](https://dr-week.github.io/fast-framework/) • [**Nomenclature**](#-nomenclature) • [**Architecture**](#-architecture) • [**Ecosystem**](#-ecosystem) • [**Alliances**](#-strategic-alliances--technology-partnerships) • [**Installation**](#-quick-start)

</div>

---

### 🌊 Nomenclature

> **Behind the Science:** Named after the **Zuari River** in **Goa, India** (historically *Aghanashini*).
> As Goa's primary tidal artery, it surges from the Western Ghats directly into the Arabian Sea with unhindered natural velocity. 
> 
> Zuari brings this tidal hydrodynamic principle to software: state mutations flow directly to exact DOM nodes without intermediate in-memory Virtual DOM diffing.

---

### ⚡ Pillars

```
       [ TC39 Signals ]                 [ W3C DOM Parts ]
       Atomic dependency graph          Cached <template> clones
       Zero component re-renders        Zero Virtual DOM overhead
                │                                │
                └──────────────┬─────────────────┘
                               ▼
                        ZUARI RUNTIME
                               ▲
                ┌──────────────┴─────────────────┐
                │                                │
      [ CSS Anchor Positioning ]       [ GPU Path Interpolation ]
      Browser-native tethering         Hardware vector morphing
      Zero JS coordinate math          Zero RAF animation loops
```

---

### 📦 Ecosystem

All packages are standalone, independently versioned, and tree-shakeable (`sideEffects: false`):

| Package | Purpose | Runtime | Support |
| :--- | :--- | :---: | :---: |
| [`@zuari/signals`](./packages/signals) | Fine-grained TC39 reactive graph (`signal`, `computed`, `effect`, `batch`) | **~1.1 KB** | Node, Bun, Vanilla, React |
| [`@zuari/dom`](./packages/dom) | Direct-to-DOM compiler (`html\`...\``) with W3C DOM Parts & View Transitions | **~1.4 KB** | Modern Browsers |
| [`@zuari/headless`](./packages/headless) | Accessible logic (`Dialog`, `CommandPalette`, `AnchorTooltip`) | **~1.8 KB** | Framework Agnostic |
| [`@zuari/glyphs`](./packages/glyphs) | Precision vector engine with GPU path morphing (`d: path(...)`) | **~0.8 KB** | SVG / HTML5 |
| [`@zuari/ui`](./packages/ui) | Pre-built kit (`Switch`, `Slider`, `Tabs`, `Popover`, `Card`, `Badge`) | **~2.0 KB** | Plug & Play |
| [`@zuari/spatial`](./packages/spatial) | Mixed Reality (visionOS / Meta Quest), 3D anchors & WebXR game HUDs | **~1.5 KB** | Apple Vision Pro, Meta Quest |
| [`@zuari/wasm`](./packages/wasm) | Zero-copy linear memory bridge for Rust/Zig & compile-time TypeSpec contracts | **~0.9 KB** | Rust, Zig, Wasm C-ABI |
| [`@zuari/tokens`](./packages/tokens) | Typed OKLCH color palettes & native browser `@property` generator | **0 KB** | CSS-in-JS Pipeline |
| [`@zuari/recipes`](./packages/recipes) | Zero-runtime `@scope` modern CSS/SCSS design recipes | **0 KB** | Native CSS Engine |
| [`@zuari/core`](./packages/core) | Unified meta-package consolidating the entire platform | **< 2.5 KB** | Complete Framework |

---

### 🚀 Quick Start

#### Package Manager
```bash
# Complete platform
pnpm add @zuari/core

# Or import specific micro-modules
pnpm add @zuari/signals @zuari/dom @zuari/ui
```

#### Direct Git Installation
```bash
pnpm add github:dr-week/fast-framework#packages/signals
```

---

### 💻 Technical Implementation

```typescript
import { signal } from '@zuari/signals';
import { html, render, createTransition } from '@zuari/dom';
import { createSwitch, createBadge } from '@zuari/ui';
import '@zuari/recipes/aether.css';

// 1. Atomic Reactive State
const active = signal(true);
const count = signal(0);

// 2. Hardware-Accelerated View Transition
const transition = createTransition();

// 3. Direct-to-DOM Template (Zero Virtual DOM)
const card = html`
  <div class="zuari-card">
    <header class="zuari-card-header">
      <h3>Telemetry Node</h3>
      <p>State: <strong>${() => (active.value ? 'ONLINE' : 'STANDBY')}</strong></p>
    </header>
    <div style="display: flex; gap: 8px; align-items: center;">
      <span class="zuari-badge" data-variant="accent">Signals: ${count}</span>
      <button @click=${() => transition.start(() => { count.value++; })}>
        Pulse
      </button>
    </div>
  </div>
`;

document.body.appendChild(render(card).fragment);
```

---

### 🌐 Cross-Platform Targets

| Platform | Runtime Architecture | Performance Target |
| :--- | :--- | :--- |
| **Mobile (iOS / Android)** | Tauri v2 Mobile Shell (Rust Host) | Cold launch **< 100ms** |
| **Desktop (Windows / macOS)** | Evergreen WebView2 with native Mica/Acrylic glass | Memory **< 20 MB** |
| **Mixed Reality (visionOS / Quest)** | `@zuari/spatial` (WebXR 3D volumetric anchors) | 90 FPS Spatial Sync |
| **Wearables (watchOS / WearOS)** | `@zuari/wearables` (Embedded QuickJS complication manifests) | Memory **< 8 MB** |

*Full specification: [NATIVE_REQUIREMENTS.md](./NATIVE_REQUIREMENTS.md)*

---

### 🥽 Mixed Reality & Spatial Computing (`@zuari/spatial`)

Native 3D volumetric HUD and spatial gaming primitives for **Apple Vision Pro** and **Meta Quest**:
- **3D Volumetric Anchors**: Extends CSS Anchor Positioning to 3D affine transforms (`matrix3d(...)`) tethered directly to XR hand joints or world objects.
- **Unified Eye-Gaze & Hand Tracking**: Normalizes visionOS gaze+pinch with Meta Quest 6DoF hand tracking into atomic reactive signals.
- **WebXR Lifecycle & Haptics**: Full controller vibration and spatial audio triggers.

```typescript
import { createSpatialAnchor, bindAnchorToElement, createPinchTracker } from '@zuari/spatial';

// 1. Create a reactive 3D spatial anchor
const hudAnchor = createSpatialAnchor({ id: 'player-radar', initialPosition: { x: 0, y: 0.2, z: -0.8 } });
bindAnchorToElement(hudAnchor, document.getElementById('radar-hud')!);

// 2. Gaze + Pinch Gesture Binding
const pinch = createPinchTracker('right');
effect(() => {
  if (pinch.isPinched.value) {
    console.log('Action triggered at:', pinch.state.value.position);
  }
});
```

---

### 🦀 Systems & Future Languages Support (`@zuari/wasm`)

Zuari integrates directly with modern systems languages without serialization overhead:
- **Rust & Zig WebAssembly ABI**: Zero-copy bidirectional synchronization between TC39 signals and WebAssembly linear memory (`DataView` / `Float64Array`).
- **TypeSpec (`.tsp`) AST Contracts**: Declarative compile-time component interfaces and micro-frontend boundary definitions.

```typescript
import { createWasmStruct, defineContract, emitTypeSpec } from '@zuari/wasm';

// Zero-copy Rust/Zig memory bridge
const struct = createWasmStruct({ memory: wasmInstance.exports.memory }, {
  fps: { offset: 0, type: 'i32', initial: 60 },
  coherence: { offset: 4, type: 'f32', initial: 0.99 }
});

struct.fps.signal.value = 120; // Auto-flushes directly to native Wasm linear memory
```

---

### 🛠️ Verification & Test Matrix

Zuari maintains an automated test matrix with 100% type-soundness verification:

```bash
# Clone & Install
git clone https://github.com/dr-week/fast-framework.git
cd fast-framework && pnpm install

# Run Test Suite (45 Unit Tests across 11 Suites)
pnpm test

# Production Build across all Monorepo Packages
pnpm build
```

---

### 🤝 Strategic Alliances & Technology Partnerships

Zuari is built as an open platform standard, collaborating closely with industry-leading runtimes, spatial hardware, and edge architectures to deliver zero-compromise developer velocity:

| Alliance Partner | Focus Domain | Architectural Integration | Target Metric |
| :--- | :--- | :--- | :---: |
| <img src="https://cdn.simpleicons.org/meta/0081FB" width="16" height="16" /> **Meta Reality Labs** | Spatial Computing & Quest | `@zuari/spatial` WebXR 3D volumetric HUD & hand-tracking engine | **120 FPS Zero-GC** |
| <img src="https://cdn.simpleicons.org/apple/FFFFFF" width="16" height="16" /> **Apple Technologies** | visionOS Ecosystem | RealityKit glass ribbon shaders & eye-gaze highlight drivers | **Sub-pixel Acuity** |
| <img src="https://cdn.simpleicons.org/tauri/24C8DB" width="16" height="16" /> **Tauri / Rust Foundation** | Native Systems Runtimes | Official `create-tauri-app` preset & `@zuari/wasm` zero-copy memory bridge | **< 15 MB Desktop App** |
| <img src="https://cdn.simpleicons.org/webassembly/654FF0" width="16" height="16" /> **Bytecode Alliance** | Wasm & Native C-ABI | TypeSpec `.tsp` AST contracts and linear buffer signal mapping | **Zero Serialization** |
| <img src="https://cdn.simpleicons.org/cloudflare/F38020" width="16" height="16" /> **Cloudflare Edge** | Distributed Edge Compute | Direct-to-DOM template streaming on Workers & Pages | **0 ms Cold Start** |

#### Multi-Party Collaboration Protocol (Onboarding Workflow)

To align technical teams, engineering roadmaps, and co-marketing launches across corporate borders, Danger.Labs follows a formalized **4-Stage Alliance Protocol**:

```
[ 1. Discovery & RFC ] ──────► [ 2. Isolated Sandbox ] ──────► [ 3. Co-Marketing Launch ] ──────► [ 4. Platform SLA ]
  Public GitHub RFC               Dedicated Package Branch        HackerNews / PR / Press           LTS Stability Guarantee
```

1. **Phase 1: Public RFC**: Partner requirements are mapped via standard `SPECIFICATION.md` templates in GitHub Discussions to ensure technical parity.
2. **Phase 2: Sandbox Prototyping**: Engineering teams build within isolated `@zuari/partner-*` packages, backed by our automated 100% type-soundness matrix.
3. **Phase 3: Joint Co-Marketing**: Synchronized press releases, dual-branded case studies, and live keynote demonstrations.
4. **Phase 4: Long-Term Enterprise Support**: Danger.Labs provides backwards-compatibility guarantees and strict semantic versioning.

*Read the complete partnership manifesto: [PARTNERSHIPS_AND_MARKETING.md](./PARTNERSHIPS_AND_MARKETING.md)*

---

### 📜 Documentation Directory

* [**User Manual & Developer Guide**](./USER_MANUAL.md)
* [**Technical Specification**](./SPECIFICATION.md)
* [**Partnerships & Alliance Blueprint**](./PARTNERSHIPS_AND_MARKETING.md)
* [**Native & Wearables Specification**](./NATIVE_REQUIREMENTS.md)
* [**Aether-Glyph Design Language**](./AETHER_GLYPH_DESIGN.md)
* [**Monorepo & Distribution Model**](./MODULAR_DISTRIBUTION.md)
* [**Contributing Guidelines**](./CONTRIBUTING.md)

---

<div align="center">

Distributed under the **MIT License**.  
Engineered by **Danger.Labs** for the future of the open web platform.

</div>
