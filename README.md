<div align="center">

# ✦ NOVA
### *The UI framework for people tired of shipping 400KB of JavaScript to render a button.*

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.9_Strict-blue.svg?style=flat-square)](#)
[![Zero Virtual DOM](https://img.shields.io/badge/Virtual_DOM-0%25_Extinct-emerald.svg?style=flat-square)](#)
[![Bundle Size](https://img.shields.io/badge/Core_Runtime-%3C2.5KB_gzipped-purple.svg?style=flat-square)](#)
[![Design Language](https://img.shields.io/badge/Style-Aether--Glyph-cyan.svg?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)

<br />

**Nova** is a hyper-modular, platform-first UI/UX framework designed for the modern web.  
It replaces Virtual DOM reconciliation, 15-megabyte hydration trees, and verbose text-heavy interfaces with **TC39 Signals**, **native CSS Anchor Positioning**, and the **Aether-Glyph** minimalist design language.

</div>

---

## 🧐 The State of Web Development (Or: Why We Built This)

Somewhere along the line, the industry decided that to toggle a dropdown menu, your user needs to download an entire compiler runtime, diff a 12-layer in-memory tree, execute a synthetic event delegation hierarchy, and calculate viewport coordinate math using JavaScript `getBoundingClientRect()` inside a requestAnimationFrame loop.

Your browser has had native layout engines written in C++ for twenty years.  
**Nova lets the browser do its job.**

* **No Virtual DOM:** Modifying a signal surgically updates the exact DOM text node. The rest of the tree doesn't even know you clicked.
* **No Runtime CSS-in-JS:** We don't inject `<style>` tags via JavaScript during user clicks. We compile to browser-native `@scope` and `@property`.
* **No Monoliths:** Every package is a standalone micro-primitive. Take the reactivity, leave the styling. Take the glyphs, leave the reactivity. We won't take it personally.
* **Aether-Glyph Minimalist Design:** Because nobody needs a button that screams `CLICK HERE TO SUBMIT FORM PLEASE` when a clean, mathematically aligned vector glyph with progressive disclosure tells the whole story.

---

## ⚡ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        @nova/core (<2.5 KB)                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
@nova/signals               @nova/headless              @nova/glyphs
Zero-VDOM Reactive Graph    A11y & Anchor Positioning   Precision Vector Icons
(~1.1 KB)                   (~1.8 KB)                   (~0.8 KB)
     │                           │                           │
     └───────────────────────────┼───────────────────────────┘
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
               @nova/tokens            @nova/recipes
               Typed OKLCH Variables   Native @scope Styles
               (0 KB JS Runtime)       (0 KB JS Runtime)
```

---

## 📦 Zero-Lockin Micro-Packages

Pull only what you need. Zero baggage.

| Package | What It Does | JS Runtime | Can Be Used Standalone? |
| :--- | :--- | :---: | :---: |
| [`@nova/signals`](./packages/signals) | Fine-grained TC39-style signal dependency graph (`signal`, `computed`, `effect`, `batch`) | **~1.1 KB** | **Yes** (Node, React, Vue, Vanilla) |
| [`@nova/headless`](./packages/headless) | Unstyled, accessible UI behaviors with CSS Anchor Positioning | **~1.8 KB** | **Yes** (Bring your own CSS) |
| [`@nova/glyphs`](./packages/glyphs) | Mathematically aligned vector glyph engine with optical weights | **~0.8 KB** | **Yes** (Any HTML/SVG app) |
| [`@nova/tokens`](./packages/tokens) | Typed OKLCH color palettes & native browser `@property` generator | **0 KB** | **Yes** (Design system token pipeline) |
| [`@nova/recipes`](./packages/recipes) | Scoped `@scope` CSS/SCSS modules for tactile glassmorphism | **0 KB** | **Yes** (Pure CSS) |

---

## 🚀 Quick Start

### Installation

Install via your favorite package manager:

```bash
# Install the whole framework
pnpm add @nova/core

# Or install only the micro-modules you actually need
pnpm add @nova/signals @nova/headless
```

*(You can also install packages directly from GitHub without touching a package registry!)*

```bash
pnpm add github:your-username/nova#packages/signals
```

---

## 💻 Minimal Code Example

Building an accessible, anchor-positioned, icon-first button with reactive state:

```typescript
import { signal } from '@nova/signals';
import { createGlyphButton } from '@nova/headless';
import { SparkleGlyph } from '@nova/glyphs';
import '@nova/recipes/aether.css';

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

> **Notice something missing?**  
> No `ReactDOM.render()`. No root providers. No `<ThemeProvider>`. No hydration warning in the console. It's just web standards doing what they were designed to do.

---

## 🎨 The Aether-Glyph Design Philosophy

Most interfaces treat users like toddlers who need instructions printed on every pixel.  
**Aether-Glyph** respects your users' cognitive bandwidth:

1. **Vector-First Affordance:** Actions are represented by crisp, balanced vector glyphs.
2. **Progressive Disclosure:** Text labels don't clutter the canvas. They exist in micro-tooltips that appear gracefully via browser-level anchor coordinates when hovered or focused.
3. **Kinetic State Feedback:** Instead of rendering text spinners that say *"Please wait while we think..."*, states morph organically with GPU-composited micro-transitions.

---

## 🛠️ Local Development & Playground

Clone the repo and run the interactive showcase in under 10 seconds:

```bash
# 1. Clone & install
git clone https://github.com/your-username/fast.git
cd fast
pnpm install

# 2. Build the workspace
pnpm build

# 3. Launch the playground
pnpm dev
```

Open `http://localhost:5173` to experience sub-millisecond reactivity in action.

---

## 📜 Documentation

* [Architecture & Technical Specification](./SPECIFICATION.md)
* [Aether-Glyph Design Language Specification](./AETHER_GLYPH_DESIGN.md)
* [Modular Distribution & Monorepo Architecture](./MODULAR_DISTRIBUTION.md)
* [Modular Design Language Blueprint](./MODULAR_DESIGN_LANGUAGE.md)

---

## ⚖️ License

MIT © Nova Contributors. Built with reverence for the web platform.
