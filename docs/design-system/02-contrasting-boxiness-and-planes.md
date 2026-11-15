# 02 — Contrasting Boxiness & 5-Plane Placement Matrix

Modern product interfaces fail when controls share an undifferentiated background or migrate unpredictably across corners. Zuari pairs **Contrasting Boxiness** (sharp spatial separation and nested visual chunks) with a deterministic **5-Plane Placement Matrix** and standardized `@zuari/glyphs` iconography so developers and AI coding agents produce consistent, scannable layouts without guesswork.

---

## 1. Contrasting Boxiness Specification

Interfaces must never collapse into a flat, ambiguous sheet of equal-tone panels. Follow these structural rules across all themes (`'paper'`, `'blossom'`, `'matcha'`, `'twilight'`, `'midnight'`, `'studio'`, `'noir'`):

### Distinct Background vs. Surface Lightness Stops

Maintain clear tonal stepping between background and elevated layers:

1. **`--nova-color-background`**: Primary canvas floor.
2. **`--nova-color-surface`**: Base card or section container, stepped 1–2 lightness stops away from the canvas background.
3. **`--nova-color-surface-elevated`**: Elevated panels, drawers, and active sub-containers.
4. **`--nova-color-surface-floating`**: Translucent floating glass layer (`createCard({ surface: 'floating' | 'liquid' })`, `createMinimalDock`) reserved for overlays above content.

### Crisp Structural Boxiness

Every interactive or semantic section requires an explicit physical boundary:

- **1px Border Contrast**: `border: 1px solid var(--nova-color-border)` with minimum 16–22% contrast opacity so box contours remain unmistakable even when blurred or scrolled.
- **Controlled Squircle Radii**: Use `border-radius: var(--nova-radius-squircle, 8px)` (for example, `22px` in `studio` and `18px` in `noir`) — avoid overly rounded capsule shapes on multi-control cards that obscure alignment grids.
- **Elevation Hierarchy (`@zuari/presets`)**:
  - `'flat'` — Zero drop shadow paired with a crisp `1px` border for dense utilitarian lists.
  - `'soft'` — Subtle drop shadow (`var(--zuari-elevation-soft)`) for resting content cards.
  - `'float'` — Distinct ambient shadow + border for floating docks and toolbars.
  - `'halo'` — Subdued luminous rim for modal dialogs and command palettes.

### Visual Chunking Inside Panels

Never drop raw labels, inputs, and buttons loosely onto a card or page background. Group related controls inside nested containers:

```ts
import { html } from '@zuari/dom';
import { createCard } from '@zuari/ui/card';

const panel = createCard(
  { title: 'Compute Telemetry', surface: 'elevated' },
  html`
    <div class="card-subpanel">
      <div class="telemetry-box">Active Signals: 24</div>
      <div class="telemetry-box">Frame Budget: 8.3 ms</div>
    </div>
  `
);
```

Keep animations snappy using `@zuari/presets` motion primitives (`'floatUp'`, `'popIn'`, `'slideIn'`, `'brushIn'`, `'softPulse'`, `'ripple'`) and avoid slow (>300ms) page-wide transitions.

---

## 2. The 5-Plane Placement Matrix

Assign every UI feature to exactly one plane based on usage frequency and cognitive load:

| Feature Role | Cognitive Load / Frequency | Target Plane | Exact Zuari Primitive |
| :--- | :--- | :--- | :--- |
| **Primary user task / canvas** | Continuous (100% of user time) | **Surface Plane** | `html\`<main>...</main>\`` (Clean, unadorned viewport) |
| **Section switching / quick tools** | High-frequency (every 2–3 mins) | **Dock Plane** | `createMinimalDock` (`@zuari/presets`) with `@zuari/glyphs` |
| **Property inspector / deep config** | Contextual / Intermittent | **Drawer Plane** | `createUiDrawer({ placement: 'right' })` (`@zuari/ui/drawer`) |
| **Global action / search / navigation** | On-demand power user | **Command Plane** | `createCommandPalette` (`@zuari/headless`) bound to `Cmd+K` |
| **System stats / connection status** | Continuous passive monitoring | **Ambient Plane** | Status pill bar (`.spatial-metrics`), `createSelectionBar` (`@zuari/ui/selection-bar`), or `createUiToast` (`@zuari/ui/toast`) |

### Programmatic Plane Division (`@zuari/presets`)

`@zuari/presets` exports `classifyFeaturePlane` and `createFeatureDivision` (`packages/presets/src/division.ts`) so apps can route features into the 5 planes consistently rather than hardcoding ad-hoc sidebars.

### Strict Anti-Clutter Rules

1. **Never place complex settings directly on the Surface Plane.** Tuck configuration inside a right-sliding `createUiDrawer`.
2. **Never build multi-level nested sidebars.** Use a single compact floating `createMinimalDock` with vector icon buttons and anchor tooltips.
3. **Never render raw JSON or debug dumps in production UI.** Bind signals directly into `createCard`, `createStoryCard`, or `createMetricCard`.
4. **Follow industry muscle-memory:** Keep Search at `Cmd+K`, Account Avatar at top-right, Primary Navigation in the dock or left rail, and Toasts at the bottom-right.
5. **Zero emojis in interface controls:** Always import vector glyphs from `@zuari/glyphs`.

---

## 3. Standard Industry Placements (The Resemblance Rule)

Adhere to established product conventions (X, GitHub, Linear, Figma, VS Code) instead of inventing novel layouts:

1. **User Profile / Account Avatar**:
   - Web/Desktop: Top-right corner of the persistent header or bottom-left of a collapsed primary rail.
   - Mobile: Far-right tab on the bottom bar or top-left inside a drawer avatar header.
2. **Settings & Preferences**:
   - Primary: Sliding right drawer (`createUiDrawer({ placement: 'right' })`) or dedicated Settings tab in the bottom dock.
   - Power user: Exposed in the `Cmd+K` command palette.
3. **Primary Global Search**:
   - Center or top-left of the header bar, bound to `Cmd+K` / `Ctrl+K`.
4. **Primary Creation / Positive Action** (New Post, Create File, Start Print):
   - Floating Action Button (FAB) or dedicated accented button in the top-right or dock center.
5. **System Telemetry / Status Indicators** (Online, Battery, Latency, Hotend):
   - Header right or top ambient bar, rendered as compact pill badges.
6. **Notifications / Alert Messages**:
   - Bell icon (`BellGlyph`) with unread badge in top-right header; transient popups in bottom-right via `createUiToast`.

---

## 4. Vector Icon Rules (`@zuari/glyphs`)

Raw Unicode emojis (`⚙️`, `🔔`, `🔍`, `🏠`, `➕`) render inconsistently across operating systems, disrupt vertical alignment, and are forbidden in Zuari core navigation and buttons.

Every interface icon must use `@zuari/glyphs` (or `@zuari/glyphs/lucide`), which provide inline `24x24` viewports with a uniform `1.75px` stroke weight inheriting `currentColor` and requiring zero runtime CDN fetches:

| Semantic Slot | Exported Glyph (`@zuari/glyphs`) |
| :--- | :--- |
| Account / Profile | `UserGlyph` |
| Global Search | `SearchGlyph` |
| Notifications | `BellGlyph` |
| Primary Navigation | `HomeGlyph`, `GridGlyph`, `LayersGlyph` |
| Positive Action / Add | `PlusGlyph` |
| Modal Dismiss / Close | `CloseGlyph` |
| Validation / Success | `CheckGlyph` |
| External Navigation | `ExternalLinkGlyph` |
| Hardware & Controls | `PrinterGlyph`, `FlameGlyph`, `MonitorGlyph`, `TunerGlyph`, `SparkleGlyph`, `CommandGlyph` |
| Social / Content | `HeartGlyph`, `BookmarkGlyph`, `ShareGlyph`, `MessageGlyph` |

Additional utilities in `@zuari/glyphs`:
- **Root helpers**: `createSvgElement`, `createMorphGlyph`, `MORPH_PATHS`, `ZUARI_LOGO_SVG`
- **Tree-shakeable Lucide adapters (`@zuari/glyphs/lucide`)**: `LucideActivityGlyph`, `LucideBarChartGlyph`, `LucidePrinterGlyph`, `LucideSparklesGlyph`, `LucideLayersGlyph`, `LucideMonitorGlyph`, `LucideSlidersGlyph`, `LucideGridGlyph`

Never draw interface icons out of CSS borders, pseudo-elements, or runtime icon CDNs.
