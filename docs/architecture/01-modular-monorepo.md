# 01 — Modular Monorepo Architecture

Zuari (`@zuari/*`) is engineered as a **zero-monolith monorepo** spanning 27 focused packages under `packages/`. Rather than shipping a monolithic runtime that applications must pull in whole, Zuari isolates reactivity, DOM part binding, design tokens, accessible behavior, CSS `@scope` recipes, vector glyphs, UI widgets, hardware bridges, and platform primitives into small, independently tree-shakeable units.

---

## Architectural Principles

1. **Zero Virtual DOM**: Reactive values (`signal`, `computed`) bind directly to DOM text and attribute sites via `html\`...\`` and `render()` without diffing trees.
2. **Strict Tree-Shaking (`"sideEffects": false`)**: All runtime packages declare `"sideEffects": false` in `package.json`, except `@zuari/recipes`, which scopes its side effects explicitly to CSS/SCSS files (`["./styles/**/*.css", "./styles/**/*.scss"]`). Developer/IDE packages (`create-zuari`, `@zuari/devtools`, `vscode-zuari`) omit `sideEffects`.
3. **ESM-First Workspace**: 26 of 27 packages use `"type": "module"` with native ESM `.js` exports and `.d.ts` declarations. Only `vscode-zuari` omits `"type": "module"` because VS Code extensions target CommonJS (`"main": "./dist/extension.js"`).
4. **Granular Subpath Exports**: Packages with multiple domains or controls (`@zuari/ui`, `@zuari/hardware`, `@zuari/spatial`, `@zuari/wasm`, `@zuari/glyphs`, `@zuari/recipes`, `@zuari/core`) expose individual subpath exports so bundlers exclude unused controls, drivers, or ABIs.

---

## Dependency Layering

Dependencies flow strictly downward from platform-specific layers toward `@zuari/signals` (which has zero runtime dependencies):

```text
Layer 0 (Leaf Reactivity)   : @zuari/signals, @zuari/recipes, @zuari/glyphs, @zuari/mcp
Layer 1 (DOM & Tokens)      : @zuari/dom, @zuari/tokens, @zuari/headless, @zuari/router,
                              @zuari/sync, @zuari/webgpu, @zuari/quantum, @zuari/spatial,
                              @zuari/hardware, @zuari/wasm, @zuari/kotlin, @zuari/lua
Layer 2 (Composition & UI)  : @zuari/presets (@zuari/signals + @zuari/tokens)
                              @zuari/ui (@zuari/signals + @zuari/dom + @zuari/headless + @zuari/glyphs + @zuari/recipes)
                              @zuari/ai (@zuari/signals + @zuari/dom + @zuari/glyphs)
                              @zuari/ssr, @zuari/system-one, @zuari/devtools, @zuari/wit
Layer 3 (Unified Barrel)    : @zuari/core (re-exports 20 runtime packages via `.` and `./<pkg>`)
```

Notice what is intentionally **excluded** from `@zuari/core`:
- Build/CLI/IDE tooling (`create-zuari`, `@zuari/vite-plugin`, `vscode-zuari`)
- Server-only rendering (`@zuari/ssr`)
- Standalone MCP server / AI advisor (`@zuari/mcp`)

---

## Granular Subpath Exports

### `@zuari/ui/*` (12 Entrypoints)

Each control lives in its own module directory (`packages/ui/src/<control>/index.ts`) and is exposed independently alongside the barrel root `.`:

| Import Path | Primary Export(s) |
| :--- | :--- |
| `@zuari/ui` | Barrel re-export of all UI components |
| `@zuari/ui/switch` | `createSwitch` |
| `@zuari/ui/badge` | `createBadge` |
| `@zuari/ui/card` | `createCard` (`CardProps`) |
| `@zuari/ui/slider` | `createSlider` |
| `@zuari/ui/tabs` | `createTabs` |
| `@zuari/ui/popover` | `createPopover` |
| `@zuari/ui/drawer` | `createUiDrawer` |
| `@zuari/ui/button` | `createButton` |
| `@zuari/ui/input` | `createTextInput` |
| `@zuari/ui/toast` | `createUiToast` |
| `@zuari/ui/selection-bar` | `createSelectionBar` |

### `@zuari/hardware/*` (9 Entrypoints)

Hardware adapters depend only on `@zuari/signals` and never pull browser UI widgets into embedded or telemetry runtimes:

| Import Path | Primary Export(s) |
| :--- | :--- |
| `@zuari/hardware` | Barrel re-export of all hardware domains |
| `@zuari/hardware/tactical` | `createBallisticReticle`, `createIMUStream` |
| `@zuari/hardware/drone` | `createDroneTelemetry`, `encodeDroneBinaryFrame` |
| `@zuari/hardware/gaming` | `createRotaryController`, `createGamepadSignal` |
| `@zuari/hardware/dpad` | `createDpadNav` |
| `@zuari/hardware/appliance` | `createApplianceBridge` |
| `@zuari/hardware/display` | `createDisplayMode` |
| `@zuari/hardware/printer` | `createPrinterTelemetry` |
| `@zuari/hardware/network` | `createWifiRssiSignal`, `createStreamTelemetry` |

### Other Multi-Subpath Packages

- `@zuari/spatial`: `.`, `./anchor`, `./gesture`, `./haptics`, `./session`
- `@zuari/wasm`: `.`, `./abi`, `./polyglot`, `./spec`
- `@zuari/glyphs`: `.`, `./lucide`
- `@zuari/recipes`: `./aether.css`, `./aether.scss` (plus `main`: `./styles/index.css`)
- `@zuari/core`: `.` plus `./ai`, `./devtools`, `./dom`, `./glyphs`, `./hardware`, `./headless`, `./kotlin`, `./lua`, `./presets`, `./quantum`, `./router`, `./signals`, `./spatial`, `./sync`, `./system-one`, `./tokens`, `./ui`, `./wasm`, `./webgpu`, `./wit`

---

## Complete 27-Package Catalog

All workspace packages share version `0.1.0`.

| Package | Directory | Runtime Dependencies | Subpath Exports | Role |
| :--- | :--- | :--- | :--- | :--- |
| `@zuari/signals` | `packages/signals` | None | `.` | Fine-grained reactive `signal`, `computed`, `effect`, `batch`, `effectScope`, `untracked` |
| `@zuari/dom` | `packages/dom` | `@zuari/signals` | `.` | `html`, `render`, `repeat`, `keyed`, `when`, `match`, W3C DOM Parts wrappers |
| `@zuari/core` | `packages/core` | 20 `@zuari/*` packages | `.`, `./*` (20 subpaths) | Convenience umbrella barrel |
| `@zuari/tokens` | `packages/tokens` | `@zuari/signals` | `.` | OKLCH theme tokens, `THEME_PRESETS`, Liquid Glass CSS variables, theme engine |
| `@zuari/recipes` | `packages/recipes` | None | `./aether.css`, `./aether.scss` | Scoped CSS (`@scope`) component, surface, and Liquid Glass stylesheets |
| `@zuari/glyphs` | `packages/glyphs` | `lucide` | `.`, `./lucide` | Crisp `24x24` stroke SVG glyphs, morph paths, and Lucide adapters |
| `@zuari/headless` | `packages/headless` | `@zuari/signals` | `.` | CSS Anchor positioning, Popover/Invoker commands, dialog, drawer, command palette, form, virtual list |
| `@zuari/presets` | `packages/presets` | `@zuari/signals`, `@zuari/tokens` | `.` | Aesthetic presets, animations, persistence, 5-plane classification, `createMinimalDock`, `createBentoGrid`, data cards |
| `@zuari/ui` | `packages/ui` | `@zuari/signals`, `@zuari/dom`, `@zuari/headless`, `@zuari/glyphs`, `@zuari/recipes` | `.`, `./switch`, `./badge`, `./card`, `./slider`, `./tabs`, `./popover`, `./drawer`, `./button`, `./input`, `./toast`, `./selection-bar` | Ready-made reactive UI components |
| `@zuari/spatial` | `packages/spatial` | `@zuari/signals` | `.`, `./anchor`, `./gesture`, `./haptics`, `./session` | WebXR 120 FPS spatial anchors, pinch tracking, haptics, and volume controller |
| `@zuari/hardware` | `packages/hardware` | `@zuari/signals` | `.`, `./tactical`, `./drone`, `./gaming`, `./dpad`, `./appliance`, `./display`, `./printer`, `./network` | Telemetry and device input drivers across optics, drones, gaming, KaiOS, appliances, displays, printers, and Wi-Fi |
| `@zuari/router` | `packages/router` | `@zuari/signals` | `.` | Navigation API router, pattern matching, View Transitions v2, Speculation Rules |
| `@zuari/ssr` | `packages/ssr` | `@zuari/dom`, `@zuari/signals` | `main` entrypoint | `renderToString`, `streamTemplate`, `renderToStream`, `hydrateHoles` |
| `@zuari/sync` | `packages/sync` | `@zuari/signals` | `.` | Local-first `syncedSignal`, CRDT deltas, storage adapters, WebSocket sync transport |
| `@zuari/ai` | `packages/ai` | `@zuari/dom`, `@zuari/glyphs`, `@zuari/signals` | `.` | `createPromptStream`, `createWebNNGraph`, `createAIWorkflowEngine` (`createAetherBadge`) |
| `@zuari/webgpu` | `packages/webgpu` | `@zuari/signals` | `.` | `createGPUBufferSignal`, `createComputeShader`, `createSimulatedGPUDevice` |
| `@zuari/system-one` | `packages/system-one` | `@zuari/dom`, `@zuari/signals` | `main` entrypoint | `createSystemOne`, `createAutomationScheduler`, `FastLogRingBuffer` |
| `@zuari/quantum` | `packages/quantum` | `@zuari/signals` | `.` | `createQuantumNodeState`, `entangleQuantumNodes`, `createQuantumRegister`, `createCognitiveUnit` |
| `@zuari/mcp` | `packages/mcp` | None | `.` | MCP server tools and AI architecture advisor (`recommendZuariArchitecture`, `getZuariGuidance`) |
| `@zuari/devtools` | `packages/devtools` | `@zuari/dom`, `@zuari/signals` | `main` entrypoint | `zuariDevTools` signal, FPS, and Wasm buffer overlay |
| `create-zuari` | `packages/create-zuari` | None | `main` + `bin` CLI | Project scaffolder (`vanilla-ts`, `tauri-desktop`, `spatial-webxr`, `kotlin-android`, `modular-product`) |
| `@zuari/vite-plugin` | `packages/vite-plugin` | `@zuari/signals` | `main` entrypoint | `zuari` Vite plugin and `transformTemplateCode` compile-time template optimizer |
| `vscode-zuari` | `packages/vscode-zuari` | None | VS Code CJS extension | `inline.zuari-html` syntax grammar and TypeScript/JavaScript snippets |
| `@zuari/wasm` | `packages/wasm` | `@zuari/signals` | `.`, `./abi`, `./polyglot`, `./spec` | Zero-copy linear memory signals/structs, polyglot kernel layout, TypeSpec/WIT helpers |
| `@zuari/wit` | `packages/wit` | `@zuari/signals`, `@zuari/wasm` | `.` | WASI 0.2 WIT parser and reactive struct signal binding generators |
| `@zuari/kotlin` | `packages/kotlin` | `@zuari/signals` | `main` entrypoint | `createKotlinBridge` and Material Light/Dark token defaults for Kotlin Multiplatform / Android |
| `@zuari/lua` | `packages/lua` | `@zuari/signals` | `main` entrypoint | `createLuaEnvironment` scripting/HUD runtime bridge |

---

## Parity & Integrity Checks

Two automated checks enforce monorepo modularity invariants:

- `pnpm run doctor` validates that every package declares valid ESM metadata, valid entrypoints, and bidirectional parity between `src/<subdir>/index.ts` and `package.json#exports["./<subdir>"]` in `@zuari/ui` and `@zuari/hardware`.
- `pnpm run new:module` scaffolds new submodules in `@zuari/ui` or `@zuari/hardware` (updating `src/index.ts` and `package.json#exports` in lockstep) or standalone workspace packages.

See [02 — Package Management CLI](./02-package-management-cli.md) and [01 — Developer Scripts & CLI Reference](../automation/01-dev-scripts-guide.md) for usage.
