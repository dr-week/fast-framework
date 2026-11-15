# 02 — Package Management CLI (`zuari:pkg`)

To keep applications lean inside and outside the monorepo, Zuari provides a built-in package selector and preset installer at `scripts/zuari-pkg.mjs`, exposed via `pnpm run zuari:pkg`.

---

## Managing Workspace Dependencies with `pnpm run zuari:pkg`

When passing flags or subcommands through `pnpm`, verify how `pnpm` forwards arguments or invoke the script via `pnpm run zuari:pkg`:

```bash
# List all 27 workspace packages and their current versions
pnpm run zuari:pkg list

# Inspect a package's version, dependencies, and subpath exports
pnpm run zuari:pkg info @zuari/ui

# List curated installation presets
pnpm run zuari:pkg presets

# Add one or more packages (or a preset) to playground/package.json (default target)
pnpm run zuari:pkg add @zuari/ui @zuari/presets

# Add packages to a custom workspace app directory
pnpm run zuari:pkg add @zuari/hardware @zuari/tokens --target apps/drone-osd

# Remove packages from a target package.json
pnpm run zuari:pkg remove @zuari/hardware --target apps/drone-osd
```

### Supported Subcommands & Flags

| Subcommand | Arguments | Behavior |
| :--- | :--- | :--- |
| `list` | — | Scans `packages/*/package.json` and prints sorted package names and versions. |
| `info` | `<pkg>` | Accepts `@zuari/<name>` or `<name>`; prints directory, version, runtime dependencies, and declared `exports` keys. |
| `presets` | — | Prints the 5 curated profiles and their package lists. |
| `add` | `<pkg...> [--target <dir>]` | Resolves `@zuari/<name>`, `<name>`, or a preset name; writes `"workspace:*"` into `dependencies` (sorted alphabetically) in `<target>/package.json`. Default `--target` is `playground`. |
| `remove` | `<pkg...> [--target <dir>]` | Removes specified packages from `dependencies` in `<target>/package.json`. Default `--target` is `playground`. |
| `--help`, `-h` | — | Prints CLI help and exits with code `0`. |

Missing targets, unknown packages, or unknown flags exit with status code `1`.

---

## Curated Installation Profiles

Instead of guessing which packages belong together, select one of the 5 built-in presets in `scripts/zuari-pkg.mjs`:

| Preset Name | Included Packages | Target Use Case |
| :--- | :--- | :--- |
| `minimal-core` | `@zuari/signals`, `@zuari/dom` | Ultra-light reactive widgets, embeds, and custom DOM islands |
| `ui-liquid-glass` | `@zuari/signals`, `@zuari/dom`, `@zuari/tokens`, `@zuari/headless`, `@zuari/recipes`, `@zuari/glyphs`, `@zuari/presets`, `@zuari/ui` | Full Apple Liquid Glass web apps, dashboards, and creative tools |
| `spatial-hud` | `@zuari/signals`, `@zuari/dom`, `@zuari/spatial`, `@zuari/wasm`, `@zuari/webgpu` | 120 FPS WebXR spatial UIs and GPU/Wasm compute HUDs |
| `tactical-hardware` | `@zuari/signals`, `@zuari/dom`, `@zuari/hardware`, `@zuari/tokens` | Drone OSDs, smart scopes, rotary handhelds, printers, KaiOS, and appliance screens |
| `ai-local-first` | `@zuari/signals`, `@zuari/dom`, `@zuari/ai`, `@zuari/sync`, `@zuari/router` | Streaming WebNN/LLM apps with CRDT sync and Navigation API transitions |

You can pass a preset name directly to `add` (or combine preset names with individual packages):

```bash
pnpm run zuari:pkg add ui-liquid-glass --target apps/my-studio
```

---

## External App Setup & Scaffolding

Outside the monorepo, scaffold a standalone application with `create-zuari`:

```bash
npm create zuari@latest my-product -- --template modular-product
```

Supported templates in `packages/create-zuari`:
- `vanilla-ts` (alias: `minimal`) — Bare `@zuari/signals` + `@zuari/dom` app
- `modular-product` — Feature-first product template following [DEVELOPMENT_WORKFLOW.md](../DEVELOPMENT_WORKFLOW.md)
- `tauri-desktop` (alias: `tauri`) — Desktop shell starter
- `spatial-webxr` (alias: `spatial`) — WebXR spatial interface starter
- `kotlin-android` — Android / `@zuari/kotlin` starter

Then install only the packages required for your workload:

```bash
pnpm add @zuari/signals @zuari/dom
```

Or install the full Liquid Glass UI stack:

```bash
pnpm add @zuari/signals @zuari/dom @zuari/tokens @zuari/headless @zuari/recipes @zuari/glyphs @zuari/presets @zuari/ui
```

---

## Bundle Budget & Subpath Import Discipline

Zuari is designed around a **<2.5 KB** zero-VDOM reactive core (`@zuari/signals` + `@zuari/dom`) and keeps higher layers tree-shakeable via two rules:

1. **Import only needed subpaths on constrained targets**:
   - Prefer `import { createDroneTelemetry } from '@zuari/hardware/drone'` instead of importing the root `@zuari/hardware` barrel.
   - Prefer `import { createCard } from '@zuari/ui/card'` and `import { createButton } from '@zuari/ui/button'` instead of pulling all 11 UI widgets when only two are needed.
   - Prefer `import { LucideActivityGlyph } from '@zuari/glyphs/lucide'` or specific icons from `@zuari/glyphs` (`UserGlyph`, `SearchGlyph`, `BellGlyph`).
2. **Preserve `"sideEffects": false`**:
   - Avoid module-top-level DOM mutations in application modules imported alongside library utilities.
   - Import CSS stylesheets explicitly at the application entrypoint (`import '@zuari/recipes/aether.css'`).

To inspect exact package dependencies and subpath exports before adding a module to a tight bundle budget, run:

```bash
pnpm run zuari:pkg info @zuari/ui
pnpm run zuari:pkg info @zuari/hardware
```
