# Zuari Visual Studio Code & Cursor Extension

Language tooling, syntax highlighting, and intelligence for **Zuari (`@zuari/*`)**.

## Features

- **Direct-to-DOM Syntax Highlighting**: Full HTML syntax coloring inside tagged template literals:
  ```ts
  const view = html`<div class="card" @click=${handleClick}>${count}</div>`;
  ```
- **Zuari Attributes & Events**:
  - Highlights event listeners prefixed with `@` (e.g. `@click=`, `@input=`, `@keydown=`).
  - Highlights boolean attribute bindings prefixed with `?` (e.g. `?disabled=`, `?hidden=`).
- **Reactive Snippets**:
  - `zsig` ──► `const count = signal(0);`
  - `zcomp` ──► `const double = computed(() => count.value * 2);`
  - `zeff` ──► `effect(() => { ... });`
  - `zrepeat` ──► `repeat(items, item => item.id, item => html\`...\`)`
  - `zwhen` ──► `when(condition, () => html\`...\`, () => html\`...\`)`
- **Zero-VDOM Diagnostics**: Integrates with TypeScript Language Service and `ts-lit-plugin` configurations for real-time validation.

## Manual Installation

1. Copy or link this package into your VS Code / Cursor extensions directory:
   ```bash
   cp -r packages/vscode-zuari ~/.vscode/extensions/
   ```
2. Reload VS Code or Cursor (`Ctrl+Shift+P` -> `Developer: Reload Window`).
