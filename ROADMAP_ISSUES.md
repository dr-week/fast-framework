# Nova Framework • Roadmap, Milestones & GitHub Issues Matrix
*Structured task backlog, milestone planning, and ready-to-copy GitHub Issue tickets.*

---

## 🗺️ Roadmap & Milestones

```
┌────────────────────────────────────────────────────────┐
│  Milestone 1: Reactive Kernel & Monorepo Foundation    │  [COMPLETED]
│  - TC39 Signals, Strict TS 5.9, Aether-Glyph v0.1      │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────▼────────────┐
               │  Milestone 2: DOM &     │  [CURRENT FOCUS]
               │  Template Binding Engine│
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │  Milestone 3: Headless  │
               │  Component Suite (A11y) │
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │  Milestone 4: Tooling & │
               │  Compiler Integration   │
               └─────────────────────────┘
```

---

## 📋 Task & GitHub Issues Matrix

### Milestone 2: DOM & Template Binding Engine (`@nova/dom`)

#### **Issue #1: Implement Direct-to-DOM Template Parser (`@nova/dom`)**
* **Type:** `feat` | **Priority:** `P0 (Critical)` | **Package:** `@nova/dom`
* **Description:**  
  Create a zero-VDOM template compilation module that compiles template literals (e.g., `html\`<div>${count}</div>\``) into native `HTMLTemplateElement.cloneNode(true)` operations with pre-calculated DOM node paths.
* **Acceptance Criteria:**
  - [ ] No Virtual DOM tree diffing.
  - [ ] Compiles template strings once into a cached `<template>`.
  - [ ] Replaces dynamic expressions with reactive signal effects targeting exact text nodes or element attributes.
  - [ ] Target bundle size: `< 1.2 KB` gzipped.

#### **Issue #2: Adopt W3C DOM Parts API Native / Polyfill Strategy**
* **Type:** `architecture` | **Priority:** `P1 (High)` | **Package:** `@nova/dom`
* **Description:**  
  Design template insertion around the emerging W3C DOM Parts proposal (`ChildNodePart`, `AttributePart`) so that when browsers enable DOM Parts natively, Nova executes with zero JavaScript glue code.
* **Acceptance Criteria:**
  - [ ] Provide lightweight fallback for non-supporting browsers.
  - [ ] Feature-detect `window.Part` / `document.getParts()`.

---

### Milestone 3: Headless Component Suite & Aether-Glyph UI

#### **Issue #3: Headless Dialog / Modal Primitive with Native `<dialog>`**
* **Type:** `feat` | **Priority:** `P1 (High)` | **Package:** `@nova/headless`
* **Description:**  
  Create an accessible, unstyled modal primitive utilizing the HTML `<dialog>` element, native `showModal()`, light-dismiss backdrop events, and focus trapping.
* **Acceptance Criteria:**
  - [ ] 100% keyboard accessible (`Escape` to dismiss, auto-focus return).
  - [ ] Reactive `isOpen` signal synchronization.
  - [ ] Zero third-party focus-trap libraries.

#### **Issue #4: Vector Path Morphing Engine for Kinetic Glyphs**
* **Type:** `enhancement` | **Priority:** `P2 (Medium)` | **Package:** `@nova/glyphs`
* **Description:**  
  Implement CSS SVG path interpolation (`d: path(...)`) micro-transitions between icon states (e.g., `Sparkle` ──► `Loading Ring` ──► `Checkmark`) for kinetic visual feedback without status text.
* **Acceptance Criteria:**
  - [ ] Compatible paths with equal coordinate counts for smooth browser-level GPU interpolation.
  - [ ] Zero JavaScript animation loops (pure CSS `@keyframes` and transitions).

#### **Issue #5: Headless Command Palette (`createCommandPalette`)**
* **Type:** `feat` | **Priority:** `P1 (High)` | **Package:** `@nova/headless`
* **Description:**  
  Build a high-speed, keyboard-driven fuzzy search command bar (Cmd/Ctrl + K) designed for the Aether-Glyph minimalist aesthetic.
* **Acceptance Criteria:**
  - [ ] Roving `tabindex` / Arrow key navigation.
  - [ ] Fine-grained signal-filtered list updates.
  - [ ] Sub-10ms response time on 1,000 items.

---

### Milestone 4: Tooling, Packaging & Developer Experience

#### **Issue #6: Automated Monorepo Unit Test Harness (Vitest)**
* **Type:** `chore` | **Priority:** `P0 (Critical)` | **Package:** `root`
* **Description:**  
  Configure Vitest across the pnpm workspace with happy-dom or jsdom to test signal reactivity, micro-batching, and headless ARIA bindings.
* **Acceptance Criteria:**
  - [ ] 100% test coverage for `@nova/signals` (`signal`, `computed`, `effect`, `batch`).
  - [ ] CI pipeline ready script: `pnpm test`.

#### **Issue #7: GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)**
* **Type:** `ci` | **Priority:** `P1 (High)` | **Package:** `.github`
* **Description:**  
  Automate linting, strict TypeScript type-checking across all packages, and playground production builds on every push and pull request.
* **Acceptance Criteria:**
  - [ ] Validates `pnpm -r run build` on Node 20 and Node 22.
  - [ ] Checks bundle size limit regression.

#### **Issue #8: Vite Plugin for AOT SCSS @scope Compilation (`vite-plugin-nova`)**
* **Type:** `feat` | **Priority:** `P2 (Medium)` | **Package:** `packages/vite-plugin`
* **Description:**  
  A lightweight Vite plugin that auto-injects `@scope` boundaries and compiles design tokens into CSS `@property` during dev and build.
* **Acceptance Criteria:**
  - [ ] Instant HMR for `@scope` CSS rules.
  - [ ] Zero runtime style injection in production bundles.

---

## ⚡ Recommended Immediate Next Steps

1. **Step 1:** Set up **Issue #6 (Vitest Testing Harness)** to guarantee 100% test coverage and regression protection for `@nova/signals`.
2. **Step 2:** Implement **Issue #1 (`@nova/dom`)** to provide developers with a clean `html\`...\`` direct-to-DOM template syntax.
3. **Step 3:** Add **Issue #7 (GitHub Actions CI)** to make the repository ready for open-source contributors.
