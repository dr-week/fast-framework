# Contributing to Nova

First off, thank you for considering contributing to Nova! We love web platform purists, performance obsessives, and developers who get uncomfortable when an `npm install` downloads 300 megabytes of dependencies.

---

## 🧭 The Nova Prime Directives

Before opening a pull request, ask yourself these four questions:

1. **Can the browser do this natively?**  
   If an existing CSS API (like `@scope`, CSS Anchor Positioning, `@property`, or `:has()`) or HTML standard can solve the problem, do NOT write a 500-line JavaScript polyfill for it.
2. **Does this break tree-shaking?**  
   Zero monoliths. Every utility and component must live in its own micro-module.
3. **Is it strictly typed?**  
   We run with `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true`. If your PR uses `any` or loose index access without checks, the compiler will gently reject it.
4. **Is it lightweight?**  
   If your PR adds 10KB to the runtime bundle, it better also cure cancer.

---

## 🛠️ Development Setup

We use `pnpm` workspaces:

```bash
# 1. Install dependencies
pnpm install

# 2. Build all modular packages
pnpm build

# 3. Launch the playground to test your changes live
pnpm dev
```

---

## 📂 Repository Structure

* `packages/signals/` — Fine-grained TC39 reactive dependency graph.
* `packages/tokens/` — Typed OKLCH color definitions & CSS `@property` generator.
* `packages/glyphs/` — Precision vector glyphs.
* `packages/headless/` — Unstyled behavioral accessibility & native anchor positioning.
* `packages/recipes/` — Zero-runtime `@scope` CSS modules.
* `packages/core/` — Clean unified export barrel.
* `playground/` — Interactive showcase for manual verification and benchmarks.

---

## 📜 Pull Request Process

1. Fork the repo and create your branch from `main`.
2. Ensure `pnpm build` succeeds with zero TypeScript errors or lints.
3. Keep PRs focused: one feature or bugfix per PR.
4. Open the PR with a clear description of what changed and *why* it belongs in the core platform.
