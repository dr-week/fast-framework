# Zuari Framework • Roadmap, Milestones & GitHub Issues Matrix
*Structured task backlog, milestone planning, and GitHub Issue ticket status for Danger.Labs Zuari.*

---

## 🗺️ Roadmap & Milestones

```
┌────────────────────────────────────────────────────────┐
│  Milestone 1: Reactive Kernel & Monorepo Foundation    │  [COMPLETED]
│  - TC39 Signals, Strict TS 5.9, Aether-Glyph v0.1      │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────▼────────────┐
               │  Milestone 2: DOM &     │  [COMPLETED]
               │  Template Binding Engine│
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │  Milestone 3: Headless  │  [COMPLETED]
               │  Component Suite (A11y) │
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │  Milestone 4: Tooling & │  [COMPLETED]
               │  Compiler Integration   │
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │  Milestone 5: Quantum,  │  [COMPLETED]
               │  Polyglot & Hardware    │
               └─────────────────────────┘
```

---

## 📋 Task & GitHub Issues Matrix

### Milestone 2: DOM & Template Binding Engine (`@zuari/dom`)

#### **Issue #1: Implement Direct-to-DOM Template Parser (`@zuari/dom`)**
* **Type:** `feat` | **Priority:** `P0 (Critical)` | **Package:** `@zuari/dom` | **Status:** `CLOSED / COMPLETED`
* **Description:**  
  Create a zero-VDOM template compilation module that compiles template literals (e.g., `html\`<div>${count}</div>\``) into native `HTMLTemplateElement.cloneNode(true)` operations with pre-calculated DOM node paths.
* **Acceptance Criteria:**
  - [x] No Virtual DOM tree diffing.
  - [x] Compiles template strings once into a cached `<template>`.
  - [x] Replaces dynamic expressions with reactive signal effects targeting exact text nodes or element attributes.
  - [x] Target bundle size: `< 1.4 KB` gzipped.

#### **Issue #2: Adopt W3C DOM Parts API Native / Polyfill Strategy**
* **Type:** `architecture` | **Priority:** `P1 (High)` | **Package:** `@zuari/dom` | **Status:** `CLOSED / COMPLETED`
* **Description:**  
  Design template insertion around the emerging W3C DOM Parts proposal (`ChildNodePart`, `AttributePart`) so that when browsers enable DOM Parts natively, Zuari executes with zero JavaScript glue code.
* **Acceptance Criteria:**
  - [x] Provide lightweight fallback for non-supporting browsers (`FallbackChildPart`, `FallbackAttributePart`).
  - [x] Feature-detect `window.ChildNodePart` / `document.getParts()`.

---

### Milestone 3: Headless Component Suite & Aether-Glyph UI

#### **Issue #3: Headless Dialog / Modal Primitive with Native `<dialog>`**
* **Type:** `feat` | **Priority:** `P1 (High)` | **Package:** `@zuari/headless` | **Status:** `CLOSED / COMPLETED`
* **Description:**  
  Create an accessible, unstyled modal primitive utilizing the HTML `<dialog>` element, native `showModal()`, light-dismiss backdrop events, and focus trapping.
* **Acceptance Criteria:**
  - [x] 100% keyboard accessible (`Escape` to dismiss, auto-focus return).
  - [x] Reactive `isOpen` signal synchronization.
  - [x] Zero third-party focus-trap libraries.

#### **Issue #4: Vector Path Morphing Engine for Kinetic Glyphs**
* **Type:** `enhancement` | **Priority:** `P2 (Medium)` | **Package:** `@zuari/glyphs` | **Status:** `CLOSED / COMPLETED`
* **Description:**  
  Implement CSS SVG path interpolation (`d: path(...)`) micro-transitions between icon states (e.g., `Sparkle` ──► `Loading Ring` ──► `Checkmark`) for kinetic visual feedback without status text.
* **Acceptance Criteria:**
  - [x] Compatible paths with equal coordinate counts for smooth browser-level GPU interpolation.
  - [x] Zero JavaScript animation loops (pure CSS `@keyframes` and transitions).

#### **Issue #5: Headless Command Palette (`createCommandPalette`)**
* **Type:** `feat` | **Priority:** `P1 (High)` | **Package:** `@zuari/headless` | **Status:** `CLOSED / COMPLETED`
* **Description:**  
  Build a high-speed, keyboard-driven fuzzy search command bar (Cmd/Ctrl + K) designed for the Aether-Glyph minimalist aesthetic.
* **Acceptance Criteria:**
  - [x] Roving `tabindex` / Arrow key navigation.
  - [x] Fine-grained signal-filtered list updates.
  - [x] Sub-10ms response time on 1,000 items.

---

### Milestone 4: Tooling, Packaging & Developer Experience

#### **Issue #6: Automated Monorepo Unit Test Harness (Vitest)**
* **Type:** `chore` | **Priority:** `P0 (Critical)` | **Package:** `root` | **Status:** `CLOSED / COMPLETED`
* **Description:**  
  Configure Vitest across the pnpm workspace with happy-dom to test signal reactivity, micro-batching, and headless ARIA bindings.
* **Acceptance Criteria:**
  - [x] 100% test coverage for `@zuari/signals` (`signal`, `computed`, `effect`, `batch`).
  - [x] CI pipeline ready script: `pnpm test` (91/91 unit tests passing).

#### **Issue #7: GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)**
* **Type:** `ci` | **Priority:** `P1 (High)` | **Package:** `.github` | **Status:** `CLOSED / COMPLETED`
* **Description:**  
  Automate linting, strict TypeScript type-checking across all packages, and playground production builds on every push and pull request.
* **Acceptance Criteria:**
  - [x] Validates `pnpm -r run build` on Node 20 and Node 22.
  - [x] Checks bundle size limit regression.

#### **Issue #8: Multi-Platform Strategy (iOS, Android, Windows, MR, watchOS)**
* **Type:** `proposal / epic` | **Priority:** `P1 (High)` | **Package:** `multi-platform` | **Status:** `COMPLETED (Tauri v2 + Spatial + Hardware delivered)`
* **Description:**  
  Architectural blueprint and implementation for extending Zuari to mobile, desktop, and wearables. Delivered via `create-zuari` Tauri presets, `@zuari/spatial` WebXR, and `@zuari/hardware`.
* **Acceptance Criteria:**
  - [x] Tauri v2 desktop & mobile scaffolding in `create-zuari`.
  - [x] WebXR volumetric 3D anchors in `@zuari/spatial`.
  - [x] Embedded rotary, D-pad, and display modes in `@zuari/hardware`.

#### **Issue #9: Pre-Built Component Suite (`@zuari/ui`)**
* **Type:** `feat` | **Priority:** `P1 (High)` | **Package:** `@zuari/ui` | **Status:** `CLOSED / COMPLETED`
* **Description:**  
  Provide accessible, fine-grained UI components (`Switch`, `Slider`, `Card`, `Tabs`, `Popover`, `Badge`) that bind directly to TC39 signals with zero Virtual DOM.
* **Acceptance Criteria:**
  - [x] Direct DOM part binding.
  - [x] Full accessibility with keyboard navigation.

---

### Milestone 5: Future-Proof Systems, Polyglot & Quantum Computing

#### **Issue #10: Polyglot Zero-Copy Memory Bridge & WASI 0.2 WIT Engine**
* **Type:** `feat` | **Priority:** `P0 (Critical)` | **Package:** `@zuari/wasm`, `@zuari/wit` | **Status:** `COMPLETED`
* **Description:**  
  Multi-language linear memory bridge with C-ABI code generation for Rust, Zig, C++23, Go, Python, and WGSL, plus an in-memory WebAssembly 2.0 bytecode kernel compiler.
* **Acceptance Criteria:**
  - [x] Zero-copy signal synchronization over `ArrayBuffer` and `DataView`.
  - [x] Code generators for Rust `#[repr(C)]`, Zig `extern struct`, C++23 `alignas`, WGSL, Python `ctypes`, and Go.
  - [x] In-memory WebAssembly binary VM kernel execution.

#### **Issue #11: Quantum Computing Primitives (`QuantumNodeState`, Bell Entanglement & OpenQASM 3.0)**
* **Type:** `feat` | **Priority:** `P1 (High)` | **Package:** `@zuari/quantum` | **Status:** `COMPLETED`
* **Description:**  
  Quantum statevector simulation, 3D Bloch sphere vector kinematics, single and multi-qubit unitary gates (H, X, Y, Z, S, T, Rotations, CNOT), Born-rule collapse, and OpenQASM 3.0 circuit compiler.
* **Acceptance Criteria:**
  - [x] Reactive `QuantumNodeState` with 32-byte zero-copy C-ABI memory.
  - [x] Multi-qubit `QuantumRegister` with Bell pair entanglement and concurrence metric.
  - [x] OpenQASM 3.0 emitter.
  - [x] Neuromorphic `CognitiveUnit` with LIF spiking dynamics and STDP plasticity.
