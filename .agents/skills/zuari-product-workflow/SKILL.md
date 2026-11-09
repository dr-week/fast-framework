---
name: zuari-product-workflow
description: "Use when scaffolding, extending, or modularizing a product app with Zuari; guides feature-first code boundaries, API contracts, focused tests, documentation search, and module audits."
---

# Zuari product workflow

Use Zuari's modular product template as the default starting point for a new web product:

```sh
npm create zuari@latest <app-name> -- --template modular-product
```

## Add a feature

1. Search current docs first: `pnpm docs:search --query "<topic>"`.
2. Search your existing app repositories before reimplementing: `pnpm research:reuse -- --root "<app-root>" --query "<topic>"`. The tool is read-only; review source ownership, dependencies, and domain assumptions before adapting a result.
3. Define the feature contract and explicit loading, empty, unavailable, and error states.
4. Keep transport and runtime validation in `src/api/`.
5. Put independent responsibilities under `src/features/<feature>/`: `model.ts`, `controller.ts`, `view.ts`, and a small `index.ts` composition boundary.
6. Connect features through `src/app/`; keep domain calculations out of the shell and DOM renderer.
7. Add focused tests for the contract and behavior, then run `pnpm test` and the smallest relevant build.
8. Run `pnpm audit:modules` as a review aid; do not split a file based on line count alone.

Keep the app a modular monolith until a feature has a distinct contract, dependency boundary, and test. Preserve existing behavior with a small compatibility facade when moving public code.

## Reuse boundaries

Reuse general-purpose UI, design, data-validation, lifecycle, and development-tool patterns. Keep product-specific backend logic, market/financial rules, credentials, and user data inside the application that owns them. Connect an existing backend through an explicit API contract rather than copying its internals into the framework runtime.
