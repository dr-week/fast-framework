# Modular Repository & Distribution Architecture ("Nova Framework")
*How developers install the framework as a whole or cherry-pick individual standalone modules directly from GitHub or NPM.*

---

## 1. Distribution Model: The "Pick What You Need" Monorepo

To allow anyone to import the framework into any project (React, Svelte, Vanilla TS, or full Nova apps), the repository is structured as a **Monorepo of Zero-Dependency Micro-Packages**.

You can either:
1. **Pull the complete framework** for building entire apps from scratch.
2. **Pull a single standalone module** (e.g., just the Signal Engine, or just the Headless Popover logic, or just the Typed SCSS Tokens) into an existing project.

---

## 2. Package Architecture (`@nova/*`)

```
nova/
├── packages/
│   ├── signals/            # @nova/signals (~1 KB)
│   │   └── Zero-VDOM fine-grained reactive graph (usable in ANY JS/TS app)
│   │
│   ├── tokens/             # @nova/tokens (0 KB JS runtime)
│   │   └── Strictly-typed OKLCH tokens + CSS @property generators
│   │
│   ├── headless/           # @nova/headless (~2 KB)
│   │   └── Accessible component logic (Popover, Dialog, Tabs, Anchors)
│   │
│   ├── recipes/            # @nova/recipes (CSS/SCSS only)
│   │   └── Modern @scope SCSS styles, customizable variants
│   │
│   ├── dom/                # @nova/dom (~1.5 KB)
│   │   └── Reactive direct-to-DOM template compiler & binding engine
│   │
│   └── core/               # @nova/core
│       └── Meta-package: re-exports everything as a unified full-stack framework
```

---

## 3. How Users Pull It Into Any Project

### Scenario A: Pull Directly from GitHub (Without publishing to NPM yet)
Any developer can install specific packages directly from your GitHub repo into their `package.json`:

```bash
# Install just the reactive signals engine directly from your GitHub:
npm install github:your-username/nova#packages/signals

# Or install the whole framework:
npm install github:your-username/nova#packages/core
```

### Scenario B: Import Individual Modules via Clean Subpath Exports
When published or installed as `@nova/core`:

```typescript
// 1. Only need reactivity in an existing React/Node/Vanilla app?
import { signal, computed, effect } from '@nova/signals';

// 2. Only need accessible popover & anchor logic?
import { createPopover } from '@nova/headless/popover';

// 3. Only need the modern typed design tokens?
import { createTheme, tokens } from '@nova/tokens';
```

---

## 4. Modern Package `package.json` Standard (ESM + Dual Node/Browser)

Every module uses modern standard **ESM Subpath Exports** with strictly typed `.d.ts` definitions and tree-shaking guarantees (`sideEffects: false`):

```json
{
  "name": "@nova/signals",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

---

## 5. Summary of Benefits
* **Zero Lock-in:** Developers can adopt `@nova/signals` inside an existing React/Vue app without rewriting their UI.
* **Granular Tree-Shaking:** Pulling `@nova/headless` doesn't drag any styling or DOM-compiling dependencies.
* **Direct GitHub Cloning:** Anyone can fork/clone the repo and run an app instantly, or install submodules via git references.
