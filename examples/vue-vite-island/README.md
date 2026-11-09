# Vue 3 + Vite 8 island

This small app demonstrates incremental adoption: Vue owns the page and mounts a Zuari component into one element. The Zuari mount returns a disposer, called from Vue's `onBeforeUnmount`; the DOM renderer removes only the nodes it owns.

## Run in the Zuari workspace

```powershell
corepack pnpm install
corepack pnpm --filter @zuari/vue-vite-island build
corepack pnpm --filter @zuari/vue-vite-island dev
```

The pilot uses `@zuari/signals`, `@zuari/dom`, and `@zuari/ui`. It does not need `@zuari/vite-plugin`: Vue SFCs are compiled by `@vitejs/plugin-vue`; the Zuari plugin does not compile `.vue` files and is not included in this Vite 8 test.

## Install local Zuari packages in another app

From the workspace root, pack the minimal UI dependency closure:

```powershell
$pack = Join-Path $env:TEMP 'zuari-vue-island-pack'
New-Item -ItemType Directory -Force $pack | Out-Null
foreach ($name in @('signals', 'dom', 'headless', 'glyphs', 'recipes', 'ui')) {
  corepack pnpm --dir (Join-Path 'packages' $name) pack --pack-destination $pack --silent
}
```

In a separate consumer app, install the generated tarballs with npm and add Vue/Vite dependencies as usual:

```powershell
$tarballs = @(Get-ChildItem -LiteralPath $pack -Filter '*.tgz' | ForEach-Object FullName)
npm install @tarballs
npm install vue
npm install --save-dev vite@^8 @vitejs/plugin-vue typescript vue-tsc
```

The workspace example itself uses `workspace:*` so it can develop against local packages. Do not copy those workspace specifiers into another repository. `pnpm pack` rewrites internal references to ordinary package versions; the resulting six tarballs were installed together into a temporary non-workspace consumer and their `@zuari/signals`, `@zuari/dom`, and `@zuari/ui/button` imports resolved successfully. `@zuari/router` is optional and is not needed for this UI island.

## Compatibility status

| Target | Status |
| --- | --- |
| Vite 8.3.5 development and production build | Verified with `@vitejs/plugin-vue`; no Zuari Vite plugin |
| Chromium island interaction and Vue unmount cleanup | Verified; a retained detached button no longer emitted events after unmount |
| Android WebView | Not tested in this environment; Android SDK/ADB and an emulator/device were unavailable |
| Windows WebView2 | Verified with runtime 156.0.4314.58; input, unmount, and detached-button cleanup passed |

`@zuari/vite-plugin` is not required for this integration. Its current peer range is Vite 5/6, it is not part of this test, and it does not compile Vue `.vue` files. Vue SFC support here comes only from `@vitejs/plugin-vue`; no Zuari `.vue` support is claimed.

## Accessibility and styling limits

- Use native buttons and labels; expose state with `aria-live`, and keep keyboard focus visible.
- Vue scoped CSS selectors do not automatically match DOM nodes created by Zuari. Put island rules in global CSS or use documented CSS custom properties.
- Vue props/events do not cross the boundary automatically. Pass plain values into the mount function and emit explicit callbacks back to Vue.
- This is a client-rendered island; it does not demonstrate SSR or hydration.
