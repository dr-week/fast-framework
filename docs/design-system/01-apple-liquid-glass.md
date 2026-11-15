# 01 — Apple Liquid Glass Optical Material Specification

Zuari implements **Apple Liquid Glass** as a deterministic set of OKLCH optical tokens (`@zuari/tokens`), scoped CSS glass materials (`@zuari/recipes`), aesthetic utilities (`@zuari/presets`), and component surfaces (`@zuari/ui/card`). It delivers translucent refraction, 1px top-edge specular highlights, and floating layer separation while maintaining strict **Contrasting Boxiness** legibility.

---

## Optical Themes: `studio` & `noir`

While all 7 themes in `THEME_PRESETS` (`paper`, `blossom`, `matcha`, `twilight`, `midnight`, `studio`, `noir`) emit Liquid Glass optical tokens, two reference themes are purpose-tuned for Apple Liquid Glass interfaces:

| Theme | Mode | `surfaceFloating` (`--nova-color-surface-floating`) | `specularHighlight` (`--nova-color-specular-highlight`) | `glass` (`blur` / `saturation`) | `squircle` Radius |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `studio` | Light | `oklch(100% 0.015 45 / 0.68)` | `oklch(100% 0 0 / 0.65)` | `26px` / `165%` | `22px` |
| `noir` | Dark | `oklch(24% 0.024 270 / 0.76)` | `oklch(100% 0 0 / 0.24)` | `26px` / `165%` | `18px` |

For comparison, the 5 editorial/creative presets include tuned optical values as well (`paper`: `20px` / `140%`, `blossom`: `22px` / `150%`, `matcha`: `20px` / `145%`, `midnight`: `24px` / `155%`, `twilight`: `24px` / `160%`).

Apply a theme with `@zuari/tokens` (`applyThemePreset`) or `@zuari/presets` (`createDesignPresets` / `createPersistentDesignPresets`):

```ts
import { createPersistentDesignPresets } from '@zuari/presets';
import '@zuari/recipes/aether.css';

const design = createPersistentDesignPresets({
  theme: 'studio', // or 'noir'
  elevation: 'soft',
  animation: 'floatUp',
});
```

---

## Optical Token Reference (`@zuari/tokens`)

`packages/tokens/src/contract.ts` defines optional glass-related fields in the theme contract, and `packages/tokens/src/generator.ts` emits CSS custom properties whenever they are defined:

| Contract Field | Emitted CSS Variable | Purpose |
| :--- | :--- | :--- |
| `colors.surfaceFloating` | `--nova-color-surface-floating` | Translucent background layer for floating docks, cards, and popovers |
| `colors.specularHighlight` | `--nova-color-specular-highlight` | Bright top-edge highlight tint for simulated optical glass curvature |
| `glass.blur` | `--zuari-glass-blur` | Backdrop blur radius (`26px` in `studio`/`noir`, fallback `24px`) |
| `glass.saturation` | `--zuari-glass-saturation` | Backdrop chroma boost (`165%` in `studio`/`noir`, fallback `160%`) |
| `glass.rimShadow` | `--zuari-glass-rim-shadow` | Top-edge `inset 0 1px 0 ...` specular rim shadow |

In `packages/tokens/src/themes.ts`:
- `studio` sets `rimShadow: 'inset 0 1px 0 oklch(100% 0 0 / 0.65)'`.
- `noir` sets `rimShadow: 'inset 0 1px 0 oklch(100% 0 0 / 0.24)'`.

---

## Surface Modes: `liquid`, `frosted`, and `floating`

Zuari exposes Liquid Glass surfaces across CSS recipes, preset helpers, docks, and UI cards.

### 1. Preset Surface Helper (`@zuari/presets`)

`applySurfacePreset(el, surface)` sets both `data-zuari-surface="<surface>"` and class `.zuari-surface-<surface>`:

- When `surface` is `'liquid'` or `'frosted'`, it binds `--zuari-active-glass-blur: var(--zuari-glass-blur, 24px)`.
- When `surface` is `'liquid'`, it also sets `data-zuari-optics="liquid-glass"` on the element (and removes `data-zuari-optics` for non-liquid modes).

### 2. Card Component (`@zuari/ui/card`)

`createCard` accepts `CardProps['surface']?: 'elevated' | 'floating' | 'liquid'`:

```ts
import { createCard } from '@zuari/ui/card';
import { html } from '@zuari/dom';

const glassCard = createCard(
  {
    title: 'Telemetry Optics',
    subtitle: 'Refractive floating panel',
    surface: 'liquid',
  },
  html`<div class="telemetry-box">120 FPS lock</div>`
);
```

Exact optical behavior of `createCard`:
- **Default (`surface` omitted) and `'elevated'`**: Uses `--zuari-glass-rim-shadow` (fallback `inset 0 1px 0 oklch(100% 0 0 / 0.12)`) layered ahead of `--zuari-elevation-soft`; sets `dataset.surface = 'elevated'` when `'elevated'` is passed.
- **`surface: 'floating'`**: Sets `dataset.surface = 'floating'`, applies background `var(--nova-color-surface-floating, ...)`, and sets `backdropFilter` / `-webkit-backdrop-filter` to `blur(var(--zuari-glass-blur, 24px)) saturate(var(--zuari-glass-saturation, 160%))`.
- **`surface: 'liquid'`**: Applies the same `--nova-color-surface-floating` background and `blur(...) saturate(...)` backdrop filter as `'floating'`, AND sets `data-zuari-optics="liquid-glass"` for full optical rim styling.

### 3. Floating Dock (`createMinimalDock`)

`createMinimalDock` in `@zuari/presets` defaults to `elevation: 'float'` and `surface: 'frosted'`, applies a `1px solid var(--nova-color-border, oklch(100% 0 0 / 0.18))` structural border, layers `--zuari-glass-rim-shadow` before the elevation shadow, and sets `data-zuari-optics="liquid-glass"` whenever `surface` is `'liquid'` or `'frosted'`.

### 4. Scoped CSS Recipes (`@zuari/recipes/aether.css`)

`packages/recipes/styles/presets.css` styles `.zuari-surface-frosted` / `[data-zuari-surface="frosted"]` and `.zuari-surface-liquid` / `[data-zuari-surface="liquid"]`. Liquid surfaces also attach a `::before` pseudo-element top-edge specular streak (`inset: 1px 12% auto`) for optical depth.

---

## Spectral Tints (`data-zuari-tint`)

To tint glass panels subtly without breaking background contrast or text legibility, pair `.zuari-surface-liquid` (or `data-zuari-surface="liquid"`) with the `data-zuari-tint` attribute in `@zuari/recipes`:

| Attribute Value | Chromatic Accent Role |
| :--- | :--- |
| `data-zuari-tint="rose"` | Warm floral / coral highlight |
| `data-zuari-tint="sky"` | Cool atmospheric / azure accent |
| `data-zuari-tint="amber"` | Warm alert / telemetry highlight |
| `data-zuari-tint="mint"` | Calm organic / health accent |
| `data-zuari-tint="violet"` | Creative / AI synthesis tint |
| `data-zuari-tint="lime"` | High-visibility neon accent |

Example:

```ts
import { html } from '@zuari/dom';

const tintedPanel = html`
  <section class="zuari-surface-liquid" data-zuari-optics="liquid-glass" data-zuari-tint="sky">
    <h3>Spectral Telemetry</h3>
  </section>
`;
```

---

## Pairing Liquid Glass with Contrasting Boxiness

Translucent glass without crisp edges bleeds into underlying content and fails readability checks. Every Zuari Liquid Glass component enforces **Contrasting Boxiness**:

1. **Always maintain a crisp `1px` structural border**: Both `createCard` and `createMinimalDock` pair translucency with `1px solid var(--nova-color-border)` so boundaries remain razor-sharp over moving imagery or grids.
2. **Use `surface: 'liquid'` sparingly**: Reserve `'liquid'` and `'frosted'` for floating overlays (`Dock` plane, hero telemetry cards, popovers, drawers). Keep dense forms and long-form content on opaque `--nova-color-surface` / `--nova-color-surface-elevated` panels.
3. **Preserve top-edge specular direction**: Keep `--zuari-glass-rim-shadow` (`inset 0 1px 0 ...`) aligned to the top light source rather than glowing symmetrically on all four edges.
4. **Chunk inner controls**: Inside glass cards, wrap distinct control groups in `.card-subpanel` or `.telemetry-box` blocks rather than floating naked buttons over blurred backgrounds.

See [02 — Contrasting Boxiness & 5-Plane Placement Matrix](./02-contrasting-boxiness-and-planes.md) for layout and border rules.
