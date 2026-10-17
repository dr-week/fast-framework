<div align="center">

```
███████╗██╗   ██╗ █████╗ ██████╗ ██╗
╚══███╔╝██║   ██║██╔══██╗██╔══██╗██║
  ███╔╝ ██║   ██║███████║██████╔╝██║
 ███╔╝  ██║   ██║██╔══██║██╔══██╗██║
███████╗╚██████╔╝██║  ██║██║  ██║██║
╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝
```

### High-Velocity Web Platform Framework
**Danger.Labs** • *Core Systems Group*

<br/>

[![Engine](https://img.shields.io/badge/Danger.Labs-Core_Architecture-000000?style=for-the-badge)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Virtual DOM](https://img.shields.io/badge/Virtual_DOM-0%25_Direct_DOM-059669?style=for-the-badge)](#)
[![Runtime Size](https://img.shields.io/badge/Core_Runtime-%3C2.5KB_gzipped-7C3AED?style=for-the-badge)](#)
[![W3C Standards](https://img.shields.io/badge/W3C-DOM_Parts_%26_Anchor_CSS-0891B2?style=for-the-badge)](#)
[![Origin](https://img.shields.io/badge/Origin-Goa%2C_India-EA580C?style=for-the-badge)](#)

<br/>

[**Interactive Demo**](https://dr-week.github.io/fast-framework/) • [**Nomenclature**](#-nomenclature) • [**Architecture**](#-architecture) • [**Ecosystem**](#-ecosystem) • [**Installation**](#-quick-start)

</div>

---

### 🌊 Nomenclature

> **Origin:** Named after the **Zuari River** in **Goa, India** (historically *Aghanashini*).
> As Goa's primary tidal artery, it surges from the Western Ghats into the Arabian Sea with unhindered natural velocity. 
> 
> Zuari brings this tidal principle to software: state mutations flow directly to exact DOM nodes without intermediate in-memory Virtual DOM diffing.

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

### 🛠️ Verification & Test Matrix

Zuari maintains an automated test matrix with 100% type-soundness verification:

```bash
# Clone & Install
git clone https://github.com/dr-week/fast-framework.git
cd fast-framework && pnpm install

# Run Test Suite (36 Unit Tests across 9 Suites)
pnpm test

# Production Build across all Monorepo Packages
pnpm build
```

---

### 📜 Documentation Directory

* [**User Manual & Developer Guide**](./USER_MANUAL.md)
* [**Technical Specification**](./SPECIFICATION.md)
* [**Native & Wearables Specification**](./NATIVE_REQUIREMENTS.md)
* [**Aether-Glyph Design Language**](./AETHER_GLYPH_DESIGN.md)
* [**Monorepo & Distribution Model**](./MODULAR_DISTRIBUTION.md)
* [**Contributing Guidelines**](./CONTRIBUTING.md)

---

<div align="center">

Distributed under the **MIT License**.  
Engineered by **Danger.Labs** for the future of the open web platform.

</div>
