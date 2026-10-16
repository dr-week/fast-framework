# Nova Framework User Manual & Developer Guide

Welcome to the official manual for **Nova**, the ultra-lightweight, platform-first web UI/UX framework designed for high performance and the **Aether-Glyph** minimalist design language.

---

## 📖 Table of Contents
1. [Introduction & Core Philosophy](#1-introduction--core-philosophy)
2. [Installation & Setup](#2-installation--setup)
3. [The Aether-Glyph Minimalist Design Language](#3-the-aether-glyph-minimalist-design-language)
4. [User Manual: Building Your First App](#4-user-manual-building-your-first-app)
   - [Atomic State Management (`@nova/signals`)](#atomic-state-management-novasignals)
   - [Accessible Headless UI (`@nova/headless`)](#accessible-headless-ui-novaheadless)
   - [Precision Vector Glyphs (`@nova/glyphs`)](#precision-vector-glyphs-novaglyphs)
   - [Native Scoped Styling (`@nova/recipes`)](#native-scoped-styling-novarecipes)
5. [Developer & Architecture Guidelines](#5-developer--architecture-guidelines)
   - [Zero Monolith Rule](#zero-monolith-rule)
   - [Strict Type Invariance](#strict-type-invariance)
   - [Platform-First Principle](#platform-first-principle)
6. [Issue Reporting & Community](#6-issue-reporting--community)

---

## 1. Introduction & Core Philosophy

Nova is built on three unwavering principles:
* **Direct DOM Reactivity:** State updates mutate exact text nodes and attributes directly via fine-grained signals—without running a Virtual DOM diffing engine.
* **Platform-First Primitives:** Instead of bundling 40KB of JavaScript to manage overlays and styling, Nova delegates layout to native browser standards: **CSS Anchor Positioning**, **native `@scope`**, and typed **`@property`** tokens.
* **Icon-First Minimalist Aesthetics (Aether-Glyph):** Interfaces should be clean, quiet, and fast. Labels are deferred to anchor-tethered micro-tooltips, keeping visual focus sharp.

---

## 2. Installation & Setup

### Installing via Package Manager
Nova is a collection of standalone packages under the `@nova/*` namespace:

```bash
# Install the complete framework
pnpm add @nova/core

# Or install only specific micro-modules
pnpm add @nova/signals @nova/headless @nova/glyphs @nova/recipes
```

### Installing Directly from GitHub
You can also install packages directly from our repository without a third-party registry:

```bash
pnpm add github:dr-week/fast-framework#packages/signals
```

---

## 3. The Aether-Glyph Minimalist Design Language

Traditional user interfaces are cluttered with redundant text banners, repetitive button labels, and heavy sidebars. **Aether-Glyph** changes the paradigm:

1. **Symbolic Vector Affordance:** Actions and navigation are represented by balanced vector glyphs.
2. **Anchor-Tethered Progressive Disclosure:** Text is not eliminated; it is deferred until needed. When hovering or focusing on an icon, a crisp micro-tooltip emerges using **native CSS Anchor Positioning**.
3. **Kinetic Micro-Feedback:** Changes in state (saving, sync, errors) trigger smooth SVG vector transitions instead of abrupt text alerts.

---

## 4. User Manual: Building Your First App

Here is a step-by-step walkthrough of creating an interactive, accessible application using Nova:

### Step 1: Atomic State Management (`@nova/signals`)
Create fine-grained reactive state without component re-renders:

```typescript
import { signal, computed, effect } from '@nova/signals';

// Create atomic reactive signals
const counter = signal(0);
const isMaxed = computed(() => counter.value >= 10);

// Side effects automatically track dependencies
effect(() => {
  console.log(`Current count: ${counter.value}, isMaxed: ${isMaxed.value}`);
});

counter.value++; // Effect automatically fires
```

### Step 2: Accessible Headless UI (`@nova/headless`)
Create an icon-first button tethered to an anchor-positioned tooltip:

```typescript
import { createGlyphButton } from '@nova/headless';
import { SparkleGlyph } from '@nova/glyphs';
import '@nova/recipes/aether.css';

const aiButton = createGlyphButton({
  label: 'AI Intelligence Copilot', // Read by screen readers
  tooltip: 'Launch Copilot (Cmd+K)',  // Displayed via CSS Anchor
  onClick: () => {
    counter.value++;
  }
});

// Attach styling and vector glyph
aiButton.buttonElement.classList.add('nova-glyph-tile');
aiButton.buttonElement.appendChild(SparkleGlyph({ size: 20 }));

// Mount to DOM
document.body.appendChild(aiButton.buttonElement);
if (aiButton.tooltipElement) {
  aiButton.tooltipElement.classList.add('nova-glyph-tooltip');
  document.body.appendChild(aiButton.tooltipElement);
}
```

---

## 5. Developer & Architecture Guidelines

To maintain the architectural integrity of Nova, all code contributions must comply with these guidelines:

### Zero Monolith Rule
* Never write "god files" that combine state logic, DOM rendering, and styling into a single module.
* Every module must have a single, testable responsibility (e.g. `anchor.ts`, `signal.ts`, `tooltip.ts`).
* All packages must remain tree-shakeable with `"sideEffects": false`.

### Strict Type Invariance
* All packages run under TypeScript 5.9+ strict mode with:
  ```json
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
  ```
* Never cast to `any` or use non-null assertions (`!`) unless interacting with external legacy DOM nodes.

### Platform-First Principle
* If a feature can be accomplished using native browser APIs (`@scope`, `position-anchor`, `<dialog>`, `popover`, `color-mix()`), **always prefer the native solution** over a custom JavaScript runtime polyfill.

---

## 6. Issue Reporting & Community

All issue tracking, bug reports, and feature proposals are managed publicly through our GitHub repository.

* 🐛 **Found a bug?** Open an issue on our [GitHub Issues Tracker](https://github.com/dr-week/fast-framework/issues/new?template=bug_report.md).
* 💡 **Have a feature proposal?** Start a discussion on our [Feature Requests Board](https://github.com/dr-week/fast-framework/issues/new?template=feature_request.md).
* 🚀 **Want to contribute?** Review our [Contributing Guidelines](./CONTRIBUTING.md) and submit a pull request.
