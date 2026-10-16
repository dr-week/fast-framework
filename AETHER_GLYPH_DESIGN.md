# "Aether-Glyph" (Icon-First Minimalist Design Language)
*Specification for a future-proof, symbol-driven, ultra-clean UI design language for Nova Framework.*

---

## 1. Concept: The "Icon-First" Philosophy
Traditional UIs are crowded with redundant text labels ("Submit", "Settings", "Delete", "Add to Cart"). 
**Aether-Glyph** strips the visual noise down to its purest functional geometry:

1. **Symbolic Primary Affordance:** Actions, navigation, states, and statuses are represented by expressive, mathematically balanced vector glyphs.
2. **Text on Context / Progressive Disclosure:** Text is not eliminated—it is deferred. Text emerges gracefully through **CSS Anchor-Positioned micro-tooltips**, expanding tactile pills, or keyboard focus.
3. **Kinetic Feedback over Words:** Instead of static labels or verbose status messages, micro-state changes are communicated via **fluid icon morphing and micro-animations** running directly on the GPU.
4. **Spatial Geometry & Breathing Room:** Ultra-minimalist borders, subtle glassmorphic blur, translucent OKLCH tints, and high spatial padding around compact icon clusters.

---

## 2. Visual Architecture & Key Design Pillars

```
┌────────────────────────────────────────────────────────┐
│              Aether-Glyph Component Structure           │
│                                                        │
│   ┌────────┐                                           │
│   │  Icon  │ ──(Hover/Focus)──► [ Tactile Tooltip ]   │
│   │  Glyph │                     (Anchor Positioned)   │
│   └────────┘                                           │
│       │                                                │
│       ▼ (Click/State Change)                           │
│   Morphing Vector Motion (CSS Path Interpolation)      │
└────────────────────────────────────────────────────────┘
```

### Pillar 1: Kinetic Morphing Icons (No Text Status)
* Instead of showing a spinner and a text label like `"Saving..."`, the icon seamlessly morphs via CSS path transitions:
  * `Checkmark` ──► `Disk` ──► `Pulse` ──► `Checkmark`
* Driven by native SVG path interpolation (`d: path(...)` CSS transition) or sub-millisecond signal state.

### Pillar 2: The "Ghost Dock" & "Glyph Ribbon"
* Navigation replaces sidebars and text menus with sleek, floating icon docks (inspired by spatial computing and high-end hardware interfaces).
* Each icon resides inside an ambient squircle with a subtle backdrop filter:
```scss
@scope (.glyph-tile) {
  :scope {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: oklch(100% 0 0 / 0.04);
    backdrop-filter: blur(16px);
    border: 1px solid oklch(100% 0 0 / 0.08);
    color: oklch(90% 0.02 260);
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      background: oklch(100% 0 0 / 0.12);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px -4px oklch(0% 0 0 / 0.2);
    }

    &:active {
      transform: scale(0.94);
    }
  }
}
```

### Pillar 3: Zero-Latency Anchor-Tethered Text Tooltips
* For accessibility and clarity, text exists strictly in ambient tooltips tethered natively via **CSS Anchor Positioning**:
```scss
@scope (.glyph-tooltip) {
  :scope {
    position: fixed;
    position-anchor: --active-glyph;
    bottom: anchor(top);
    left: anchor(center);
    transform: translateX(-50%) translateY(-6px);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    background: oklch(20% 0.03 260 / 0.9);
    backdrop-filter: blur(12px);
    border: 1px solid oklch(100% 0 0 / 0.1);
    color: oklch(98% 0 0);
    pointer-events: none;
    opacity: 0;
    transition: opacity 150ms ease, transform 150ms ease;
  }
}
```

---

## 3. The Glyphs: Vector System Architecture
To make the design language modular, we provide **`@nova/glyphs`**:
* **Zero-Runtime SVG Sprites / Inline Path Components:**
  * Icons are rendered as lightweight, scalable vector paths with standard optical weights: `line` (1.5px), `duotone` (dual-alpha OKLCH), and `solid`.
* **State Badges as Ambient Glows:**
  * Notification counts or active states are indicated by minimal chromatic pings (e.g., an OKLCH cyan/amber pulse dot on the top-right vertex of the glyph) rather than intrusive text badges.

---

## 4. Accessibility (A11y) Guarantee
Even though the visual design is icon-first and text-minimal, screen readers receive full semantic clarity:
* Every icon component requires an `aria-label` or automatically generates an accessible screen-reader-only element (`.sr-only`).
* Tooltips are automatically bound via `aria-describedby` through the `@nova/headless` layer.
