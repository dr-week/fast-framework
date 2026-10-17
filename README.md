<div align="center">

# ZUARI
### *The High-Velocity Web Platform Framework.*
##### Developed by **Danger.Labs**

[![Architecture](https://img.shields.io/badge/Architecture-Danger.Labs-000000.svg?style=flat-square)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9_Strict-3178C6.svg?style=flat-square)](#)
[![Virtual DOM](https://img.shields.io/badge/Virtual_DOM-0%25_Direct_DOM-059669.svg?style=flat-square)](#)
[![Runtime](https://img.shields.io/badge/Runtime-%3C2.5KB_gzipped-7C3AED.svg?style=flat-square)](#)
[![Standards Track](https://img.shields.io/badge/W3C-DOM_Parts_%26_Anchor_CSS-0891B2.svg?style=flat-square)](#)
[![Origin](https://img.shields.io/badge/Origin-Goa%2C_India-EA580C.svg?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-18181B.svg?style=flat-square)](LICENSE)

<br />

**Zuari** is an ultra-lightweight, zero-reconciliation reactive web platform developed by **Danger.Labs**.  
Engineered as a post-virtual-DOM standard, it converges **TC39 Signals**, **W3C DOM Parts**, **native CSS Anchor Positioning**, and hardware-composited vector transitions into an integrated, zero-monolith architecture.

[Explore Platform](https://dr-week.github.io/fast-framework/) • [Origin & Nomenclature](#origin--nomenclature) • [Architecture](#architecture) • [Package Ecosystem](#ecosystem) • [Documentation](#documentation-index)

</div>

---

## Origin & Nomenclature

> *Named after the Zuari River in Goa, India—an ancient tidal waterway whose natural gravitational flow inspires our direct-to-DOM, zero-reconciliation reactive engine.*

Historically known as the *Aghanashini*, the Zuari River is Goa’s largest tidal river, originating in the Western Ghats and flowing directly into the Arabian Sea without resistance. In software architecture, traditional frameworks act like stagnant reservoirs—forcing applications to diff massive in-memory Virtual DOM trees simply to update a UI element. Zuari mirrors its namesake: state changes surge directly to exact DOM node pointers with zero friction, zero intermediate diffing, and zero synthetic overhead.

---

## Architecture & Executive Principles

Modern client-side engineering carries significant technical debt from the early 2010s: heavy in-memory reconciliation passes, complex synthetic event hierarchies, and megabytes of runtime styling engines that duplicate calculations native browser engines compute in C++.

Zuari establishes a platform-first discipline:

* **Direct DOM Reactivity:** Powered by an atomic signal graph with micro-batching. State updates target exact DOM text nodes and element attribute pointers without tree reconciliation.
* **W3C DOM Parts Architecture:** Pre-compiled template literal cloning (`html\`...\``) featuring automatic feature-detection for native browser `ChildNodePart` and `AttributePart` runtimes.
* **Native CSS Layout Offloading:** Overlays, menus, tooltips, and flyouts tether natively via **CSS Anchor Positioning** and top-layer browser stacking with zero JavaScript bounding-box computation.
* **Compositor-Level Kinetic Feedback:** Path-balanced vector glyphs morph their contour geometry (`d: path(...)`) directly on the GPU without JavaScript animation frame loops.
* **Strict Type Invariance:** Compiled under total type soundness (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`).

---

## Platform Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      @zuari/core (< 2.5 KB)                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
@zuari/signals              @zuari/dom                  @zuari/headless
TC39 Reactive Graph         W3C DOM Parts Engine        Anchor & Focus Primitives
(~1.1 KB)                   (~1.4 KB)                   (~1.8 KB)
     │                           │                           │
     └───────────────────────────┼───────────────────────────┘
                                 │
     ┌───────────────────────────┴───────────────────────────┐
     ▼                                                       ▼
@zuari/glyphs                                           @zuari/ui
Kinetic Vector Engine                                   Pre-Built Element Suite
(~0.8 KB)                                               (~2.0 KB)
     │                                                       │
     └───────────────────────────┬───────────────────────────┘
                                 ▼
                     @zuari/tokens & @zuari/recipes
                     Typed OKLCH & Native @scope Styles
                     (0 KB JavaScript Runtime)
```

---

## Ecosystem

Every package within the Zuari monorepo is independently versioned, tree-shakeable (`sideEffects: false`), and usable as a standalone zero-dependency module across any runtime:

| Package | Purpose | Runtime | Standalone? |
| :--- | :--- | :---: | :---: |
| [`@zuari/signals`](./packages/signals) | Fine-grained TC39 reactive dependency graph (`signal`, `computed`, `effect`, `batch`) | **~1.1 KB** | **Yes** (Node, Bun, React, Vue, Vanilla) |
| [`@zuari/dom`](./packages/dom) | Direct-to-DOM template compiler (`html\`...\``) with W3C DOM Parts & View Transitions | **~1.4 KB** | **Yes** (Lightweight reactive web apps) |
| [`@zuari/headless`](./packages/headless) | Unstyled, accessible behavioral logic (Dialog, Command Palette, Anchor Tooltip) | **~1.8 KB** | **Yes** (Bring your own styling) |
| [`@zuari/glyphs`](./packages/glyphs) | Precision vector glyph engine with GPU-composited path morphing | **~0.8 KB** | **Yes** (Any SVG/HTML application) |
| [`@zuari/ui`](./packages/ui) | Pre-built element suite (Switch, Range Slider, Segmented Tabs, Floating Popover, Card) | **~2.0 KB** | **Yes** (Plug-and-play UI kit) |
| [`@zuari/tokens`](./packages/tokens) | Typed OKLCH color token definitions + CSS `@property` generator | **0 KB** | **Yes** (Design system pipelines) |
| [`@zuari/recipes`](./packages/recipes) | Zero-runtime scoped (`@scope`) modern CSS/SCSS design recipes | **0 KB** | **Yes** (Native CSS only) |
| [`@zuari/core`](./packages/core) | Unified meta-package consolidating the entire platform | **< 2.5 KB** | Complete full framework |

---

## Quick Start

### Installation

```bash
# Complete platform
pnpm add @zuari/core

# Or import individual primitives into any existing stack
pnpm add @zuari/signals @zuari/dom @zuari/ui
```

*(Direct Git installation supported across all package managers without third-party registries:)*
```bash
pnpm add github:dr-week/fast-framework#packages/signals
```

---

## Technical Usage

```typescript
import { signal } from '@zuari/signals';
import { html, render, createTransition } from '@zuari/dom';
import { createSwitch, createBadge, createCard } from '@zuari/ui';
import '@zuari/recipes/aether.css';

// 1. Declare fine-grained reactive state
const isStreaming = signal(true);
const throughput = signal(1420);

// 2. Hardware View Transition Coordinator
const transition = createTransition();

// 3. Declarative Direct-to-DOM Template (Zero Virtual DOM)
const telemetryCard = html`
  <div class="zuari-card">
    <header class="zuari-card-header">
      <h3>Engine Telemetry</h3>
      <p>Throughput: <strong>${throughput} req/s</strong></p>
    </header>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span class="zuari-badge" data-variant="accent">Active Node</span>
      <button @click=${() => transition.start(() => { throughput.value += 100; })}>
        Pulse Signal
      </button>
    </div>
  </div>
`;

document.body.appendChild(render(telemetryCard).fragment);
```

---

## Spatial & Multi-Platform Strategy

Zuari's core reactivity is decoupled from the DOM. Cross-platform support is realized via dedicated drivers:

* **iOS & Android:** High-performance shell via **Tauri v2 Mobile (Rust host)** launching in **< 100ms**.
* **Windows & Desktop:** Native Windows WebView2 shell with native Mica/Acrylic glassmorphic blur and global hotkey bindings.
* **Spatial & Mixed Reality (visionOS / Meta Horizon):** WebXR 3D volumetric anchors and eye-tracking hover states.
* **Wearables (watchOS / WearOS):** Headless complication manifests generated directly from signal nodes.

Detailed specifications: [NATIVE_REQUIREMENTS.md](./NATIVE_REQUIREMENTS.md).

---

## Verification & Continuous Integration

Zuari maintains an automated test matrix with 100% type-soundness verification:

```bash
# Clone and install
git clone https://github.com/dr-week/fast-framework.git
cd fast-framework
pnpm install

# Run automated Vitest test suite (36 unit tests)
pnpm test

# Build all monorepo packages under strict TypeScript 5.9+
pnpm build
```

---

## Documentation Index

* [User Manual & Developer Guidelines](./USER_MANUAL.md)
* [Architecture & Technical Specification](./SPECIFICATION.md)
* [Native & Cross-Platform Blueprint](./NATIVE_REQUIREMENTS.md)
* [Aether-Glyph Minimalist Design Language](./AETHER_GLYPH_DESIGN.md)
* [Modular Distribution & Packaging Model](./MODULAR_DISTRIBUTION.md)
* [Contributing Guidelines](./CONTRIBUTING.md)

---

## Legal & Governance

Developed by **Danger.Labs**.  
Distributed under the **MIT License**. Engineered for the future of the open web platform.
