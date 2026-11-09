# Zuari product development workflow

Use the feature-first starter to skip repeating the same architecture decisions for each product:

```powershell
npm create zuari@latest my-product -- --template modular-product
pnpm install
pnpm dev
```

## Code boundaries

- `src/app/` owns startup, page composition, navigation, and settings surfaces.
- `src/features/<feature>/` owns feature models, controllers, and views. Its `index.ts` is the small composition/export boundary.
- `src/api/` owns transport and runtime validation. Validate external data before it enters feature state.
- `src/styles.css` owns application tokens and layout; use `@zuari/tokens`, `@zuari/presets`, and `@zuari/recipes` to share a visual language.
- Keep backend services and domain calculations in their existing app/backend. Connect them through a small, typed HTTP or native boundary.

Add a feature by defining its contract and unavailable/empty/error cases, implementing the model/controller/view in separate files, composing it at the app shell, and adding focused tests. Keep a modular monolith until a responsibility has an independent contract, dependency boundary, and test.

## Reusable development commands

- `pnpm audit:modules` reports large source modules in packages and the playground. A line threshold is a review signal, not an automatic split or build failure.
- `pnpm docs:search --query "signals cleanup"` searches existing Markdown and agent skills before new research or documentation is written.
- `pnpm research:reuse -- --root "C:\CODES\money\mm" --root "C:\CODES\DISHANTcv" --query "theme workflow"` ranks local source/docs worth reviewing before reimplementing them. It is read-only and excludes data, build output, dependencies, credentials, and stock/trading-specific paths.
- `pnpm test` runs the focused package and development-tool test suites.
- `pnpm build` builds the monorepo packages.

The module audit and docs search are adapted from the general-purpose development utilities in the MM project. The reuse researcher scans only roots explicitly provided to it. MM's stock-specific AI/scoring, market data, credentials, and product workflows remain app code and are not part of Zuari.
