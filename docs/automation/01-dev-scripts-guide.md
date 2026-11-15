# 01 — Developer Scripts & CLI Reference

All repository maintenance, scaffolding, package curation, rule synchronization, and documentation discovery workflows are powered by 7 zero-dependency Node scripts under `scripts/`.

---

## Quick Comparison

| npm Script | Backing File | Primary Purpose | Mutates Repo? |
| :--- | :--- | :--- | :--- |
| `pnpm run zuari:pkg` | `scripts/zuari-pkg.mjs` | List, inspect, preset-install, add, or remove `@zuari/*` packages | Only on `add` / `remove` |
| `pnpm run doctor` | `scripts/doctor.mjs` | Health check for manifests, subpath parity, AI rules, and docs | Read-only |
| `pnpm run sync:rules` | `scripts/sync-ai-rules.mjs` | Sync `CLAUDE.md` & `.cursorrules` from `AGENTS.md` | Unless `--check` is passed |
| `pnpm run new:module` | `scripts/new-module.mjs` | Scaffold a `@zuari/ui/*` or `@zuari/hardware/*` submodule or package | Unless `--dry-run` is passed |
| `pnpm audit:modules` | `scripts/dev/audit-modules.mjs` | Report oversized source files across `packages/` and `playground/src/` | Read-only |
| `pnpm docs:search` | `scripts/dev/search-docs.mjs` | Keyword search across `.md` docs | Read-only |
| `pnpm research:reuse` | `scripts/dev/research-reuse.mjs` | Read-only pattern search on external codebases | Read-only |

---

## 1. `pnpm run zuari:pkg` (`scripts/zuari-pkg.mjs`)

Manages `@zuari/*` dependencies inside monorepo apps and inspects workspace package metadata.

### Subcommands & Flags

- `list` — Lists all workspace packages under `packages/*` with their versions.
- `info <pkg>` — Displays directory, version, runtime dependencies, and declared `exports` for `@zuari/<name>` or `<name>`.
- `presets` — Lists the 5 curated profiles (`minimal-core`, `ui-liquid-glass`, `spatial-hud`, `tactical-hardware`, `ai-local-first`).
- `add <pkg...> [--target <dir>]` (also accepts `--target=<dir>`) — Adds package(s) or preset(s) with `"workspace:*"` to `<target>/package.json` (sorted alphabetically; default target is `playground`).
- `remove <pkg...> [--target <dir>]` — Removes specified package(s) from `<target>/package.json` (default target is `playground`).
- `--help`, `-h` — Prints usage help and exits with code `0`.

### Exit Codes

- `0`: Command succeeded.
- `1`: Unknown command, unknown flag, unknown package/preset, or missing `<target>/package.json`.

### Examples

```bash
pnpm run zuari:pkg list
pnpm run zuari:pkg info @zuari/ui
pnpm run zuari:pkg presets
pnpm run zuari:pkg add ui-liquid-glass --target playground
pnpm run zuari:pkg remove @zuari/hardware --target apps/demo
```

---

## 2. `pnpm run doctor` (`scripts/doctor.mjs`)

Runs comprehensive workspace integrity checks across packages, subpath exports, AI assistant rules, and required docs.

### Flags & Exit Codes

- `--help`, `-h` — Prints help and exits `0`.
- Any unknown CLI argument causes exit code `1`.
- Exit `0`: `PASS` (all checks passed; warnings alone still pass).
- Exit `1`: One or more validation errors detected.

### Checks Performed

1. **All `packages/*/package.json` manifests**: Valid JSON, valid `name`, valid entrypoint (`exports` or `main`), `"type": "module"` present (exempts `vscode-zuari` because `engines.vscode` is set). Emits warnings if `"files"` is missing or if `main` is set without `exports`.
2. **Subpath Export Parity**: Verifies bidirectional matching between `src/<subdir>/index.ts` and `package.json#exports["./<subdir>"]` for both `packages/ui` and `packages/hardware`.
3. **AI Rule Files**: Verifies presence of `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `llms.txt`, and `llms-full.txt`.
4. **Documentation Completeness**: Verifies all required `docs/**` guides exist (`README.md`, `architecture/01-modular-monorepo.md`, `architecture/02-package-management-cli.md`, `design-system/01-apple-liquid-glass.md`, `design-system/02-contrasting-boxiness-and-planes.md`, `ai-workflow/01-agent-automation-and-subagents.md`, `automation/01-dev-scripts-guide.md`).

---

## 3. `pnpm run sync:rules` (`scripts/sync-ai-rules.mjs`)

Keeps AI instruction files synchronized across coding agents using `AGENTS.md` as canonical truth.

### Flags & Exit Codes

- `--check` — Verification-only mode; checks byte-for-byte parity without writing files.
- `--help`, `-h` — Prints usage help and exits `0`.
- Checks: `AGENTS.md` exists and contains `Contrasting Boxiness`, `5-Plane Placement Matrix`, and `@zuari/glyphs`; verifies `llms.txt` and `llms-full.txt` exist.
- Synchronizes `AGENTS.md` content to `CLAUDE.md` and `.cursorrules` when `--check` is omitted.
- Exit `0`: Synced or already in sync.
- Exit `1`: Missing required files/sections, unknown flag, or drift detected in `--check` mode.

### Examples

```bash
pnpm run sync:rules
pnpm run sync:rules -- --check
```

---

## 4. `pnpm run new:module` (`scripts/new-module.mjs`)

Scaffolds new `@zuari/ui` or `@zuari/hardware` subpath modules or brand-new workspace packages under `packages/*`.

### Subcommands & Flags

- `submodule <ui|hardware> <name> [--dry-run]`
  - Creates `packages/<ui|hardware>/src/<name>/index.ts`.
  - Appends `export * from './<name>/index.js';` to `packages/<ui|hardware>/src/index.ts`.
  - Registers `"./<name>"` in `packages/<ui|hardware>/package.json#exports`.
- `package <name> [--dry-run]`
  - Creates `packages/<name>/package.json`, `tsconfig.json`, `src/index.ts`, and `src/<name>.test.ts`.
- `--dry-run` — Previews files and export changes without writing to disk.
- `--help`, `-h` — Prints usage help and exits `0`.

### Validation & Exit Codes

- `<name>` must be strict kebab-case matching `/^[a-z][a-z0-9-]*$/`.
- Exit `1` on invalid arguments, invalid `<name>`, unsupported submodule domain, or if the target file/package already exists.

### Examples

```bash
pnpm run new:module submodule ui accordion --dry-run
pnpm run new:module submodule hardware lidar
pnpm run new:module package telemetry --dry-run
```

---

## 5. `pnpm audit:modules` (`scripts/dev/audit-modules.mjs`)

Audits source file sizes across `packages/` and `playground/src/` so bloated monoliths are caught early.

### Flags & Exit Codes

- `--threshold <n>` — Line count threshold to highlight (default `250`).
- `--top <n>` — Maximum number of ranked files to display (default `30`).
- `--help`, `-h` — Prints help and exits `0`.
- Skips `.git`, `.venv`, `build`, `coverage`, `dist`, `node_modules`, `target`, and `vendor`.
- Exit `0`: Report complete (non-blocking review aid); exit `1` on invalid flags.

```bash
pnpm audit:modules -- --threshold 200 --top 20
```

---

## 6. `pnpm docs:search` (`scripts/dev/search-docs.mjs`)

Searches repository `.md` documentation using ranked token matching.

### Flags & Exit Codes

- `--query "<terms>"` — Space-separated search keywords (required unless `--help`).
- `--limit <n>` — Maximum results returned (default `12`).
- `--help`, `-h` — Prints help and exits `0`.
- Exit `0` when one or more Markdown files match; exit `1` on missing/invalid flags or zero matches.

```bash
pnpm docs:search -- --query "liquid glass blur"
```

---

## 7. `pnpm research:reuse` (`scripts/dev/research-reuse.mjs`)

Read-only code pattern scanner for inspecting external reference directories safely.

### Flags & Exit Codes

- `--root <path>` — Root directory to scan (repeatable for multiple folders).
- `--query "<terms>"` — Keywords to search across readable source files.
- `--limit <n>` — Maximum results to return (default `30`).
- `--help`, `-h` — Prints help and exits `0`.
- Skips `.git`, `.venv`, `build`, `coverage`, `dist`, `node_modules`, `target`, `vendor`, sensitive/secret paths, and files larger than 1 MB.
- Exit `0` on success; exit `1` on invalid arguments or missing root paths.

```bash
pnpm research:reuse -- --root ../reference-ui --query "popover anchor"
```
