<div align="center">

# 🌊 ZUARI
### *The Goan tidal-fast UI framework. Zero Virtual DOM. Under 2.5KB.*

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.9_Strict-blue.svg?style=flat-square)](#)
[![Zero Virtual DOM](https://img.shields.io/badge/Virtual_DOM-0%25_Extinct-emerald.svg?style=flat-square)](#)
[![Bundle Size](https://img.shields.io/badge/Core_Runtime-%3C2.5KB_gzipped-purple.svg?style=flat-square)](#)
[![Design Language](https://img.shields.io/badge/Style-Aether--Glyph-cyan.svg?style=flat-square)](#)
[![Origin](https://img.shields.io/badge/Origin-Goa%2C_India-orange.svg?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)

<br />

**Zuari** is an ultra-lightweight, platform-first web UI/UX framework named after the legendary tidal river of Goa.  
It replaces Virtual DOM reconciliation, heavy JavaScript hydration trees, and verbose text-heavy interfaces with **TC39 Signals**, **native CSS Anchor Positioning**, and the **Aether-Glyph** minimalist design language.

</div>

---

## 🌊 The Story of Zuari

The **Zuari River** is the largest, most vital tidal lifeline of Goa. Originating in the lush Western Ghats, it surges down with raw gravitational velocity, cutting through ancient stone and meeting the vast Arabian Sea in a wide, effortless tide. For centuries, it connected Goan trade, culture, and navigation without resistance.

Web development today is the opposite of the Zuari river: it is stagnant, cluttered, and weighed down by 400KB of JavaScript libraries just to render a simple button.

**Zuari brings the tidal flow back to the web:**
* **Direct Tidal Flow (Zero Virtual DOM):** When state changes, it flows directly to the exact DOM text node or attribute. No Virtual DOM diffing waterfalls.
* **Anchor Tethering:** Dropdowns, tooltips, and popovers dock into place natively using browser-level **CSS Anchor Positioning**—zero JavaScript bounding box math.
* **Aether-Glyph Minimalist Aesthetics:** Clean, quiet interfaces where actions are crisp vector glyphs, and text reveals gracefully on demand.
* **Modular Monorepo:** Zero monoliths. Every package is a standalone micro-module under `@zuari/*`.

---

## ⚡ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        @zuari/core (<2.5 KB)                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
@zuari/signals              @zuari/headless             @zuari/glyphs
Zero-VDOM Reactive Graph    A11y & Anchor Positioning   Precision Vector Icons
(~1.1 KB)                   (~1.8 KB)                   (~0.8 KB)
     │                           │                           │
     └───────────────────────────┼───────────────────────────┘
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
               @zuari/tokens           @zuari/recipes
               Typed OKLCH Variables   Native @scope Styles
               (0 KB JS Runtime)       (0 KB JS Runtime)
```

---

## 📦 Zero-Lockin Micro-Packages

| Package | What It Does | Runtime Size | Can Be Used Standalone? |
| :--- | :--- | :---: | :---: |
| [`@zuari/signals`](./packages/signals) | Fine-grained TC39-style signal dependency graph (`signal`, `computed`, `effect`, `batch`) | **~1.1 KB** | **Yes** (Node, React, Vue, Vanilla) |
| [`@zuari/headless`](./packages/headless) | Unstyled, accessible UI behaviors with CSS Anchor Positioning | **~1.8 KB** | **Yes** (Bring your own CSS) |
| [`@zuari/glyphs`](./packages/glyphs) | Precision vector glyph engine for minimalist interfaces | **~0.8 KB** | **Yes** (Any HTML/SVG app) |
| [`@zuari/tokens`](./packages/tokens) | Typed OKLCH color palettes & native browser `@property` generator | **0 KB** | **Yes** (Design system token pipeline) |
| [`@zuari/recipes`](./packages/recipes) | Scoped `@scope` CSS/SCSS modules for tactile glassmorphism | **0 KB** | **Yes** (Pure CSS) |

---

## 🚀 Quick Start

### Installation

```bash
# Install the complete framework
pnpm add @zuari/core

# Or install only specific micro-modules
pnpm add @zuari/signals @zuari/headless
```

*(You can also install packages directly from GitHub without touching a package registry!)*

```bash
pnpm add github:dr-week/fast-framework#packages/signals
```

---

## 💻 Minimal Code Example

```typescript
import { signal } from '@zuari/signals';
import { createGlyphButton } from '@zuari/headless';
import { SparkleGlyph } from '@zuari/glyphs';
import '@zuari/recipes/aether.css';

// 1. Declare atomic reactive state
const isActive = signal(false);

// 2. Instantiate headless behavior with native CSS Anchor Positioning
const button = createGlyphButton({
  label: 'AI Copilot',
  tooltip: 'Launch Intelligence Engine', // Tethered natively via CSS Anchor
  active: isActive,
  onClick: () => {
    isActive.value = !isActive.value;
  }
});

// 3. Attach our modular @scope aesthetic
button.buttonElement.classList.add('nova-glyph-tile');
button.buttonElement.appendChild(SparkleGlyph({ size: 20 }));

document.body.appendChild(button.buttonElement);
if (button.tooltipElement) {
  button.tooltipElement.classList.add('nova-glyph-tooltip');
  document.body.appendChild(button.tooltipElement);
}
```

---

## 🛠️ Local Development & Playground

```bash
# 1. Clone & install
git clone https://github.com/dr-week/fast-framework.git
cd fast-framework
pnpm install

# 2. Build the workspace
pnpm build

# 3. Launch the playground
pnpm dev
```

Open `http://localhost:5173` to experience Zuari's tidal reactivity in action.

---

## 📜 Documentation

* [User Manual & Developer Guidelines](./USER_MANUAL.md)
* [Architecture & Technical Specification](./SPECIFICATION.md)
* [Aether-Glyph Design Language Specification](./AETHER_GLYPH_DESIGN.md)
* [Modular Monorepo Architecture](./MODULAR_DISTRIBUTION.md)

---

## ⚖️ License

MIT © Zuari Contributors. Born on the Goan tide.
