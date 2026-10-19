# Modular Design Language Architecture ("Nova Design System")
*A Type-Safe, Zero-Runtime, Token-Driven Modular Design Architecture for Future UI Frameworks*

---

## 1. Core Philosophy: Why "Modular" Matters
Traditional design systems fail in one of two ways:
1. **Monolithic UI libraries** (e.g., MUI, Ant Design): You import one component, and 80KB of unneeded JS, style injections, and theme logic get bundled.
2. **Untyped Atomic CSS** (e.g., raw utility classes): Fast, but lacks strict design contracts, type validation, and semantic boundaries.

Our **Modular Design Language** solves this through **Three-Tier Architecture**:
1. **Design Tokens & Contracts (Primitives)**: Strictly typed definitions (`oklch` colors, fluid typography, spacing scales) registered via browser-native `@property`.
2. **Headless Behavioral Primitives (Logic & A11y)**: Pure accessibility, keyboard interaction, and state graphs without any attached styles.
3. **Pluggable Visual Themes (Skins/Recipes)**: Zero-runtime SCSS modules mapped to CSS `@scope` and native parts.

---

## 2. The Three-Tier Modular Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Tier 1: Design Tokens                │
│    (oklch scales, fluid typography, typed @property)   │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────▼────────────┐
               │  Tier 2: Headless Logic │
               │ (Signals, A11y, Popover)│
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │ Tier 3: Visual Recipes  │
               │ (@scope SCSS, Part/CSS) │
               └─────────────────────────┘
```

---

## 3. Tier 1: Strictly Typed Design Tokens

Instead of loose CSS variables that accept any invalid string, the modular design system defines tokens using native browser `@property` with strict type checking.

### Example: Token Contract (`tokens.contract.ts`)
```typescript
export interface DesignTokens {
  color: {
    brand: `oklch(${number}% ${number} ${number})`;
    surface: `oklch(${number}% ${number} ${number})`;
    text: `oklch(${number}% ${number} ${number})`;
  };
  spacing: {
    xs: `${number}rem` | `${number}px`;
    sm: `${number}rem` | `${number}px`;
    md: `${number}rem` | `${number}px`;
    lg: `${number}rem` | `${number}px`;
  };
  radii: {
    none: '0px';
    sm: `${number}px`;
    full: '9999px';
  };
}
```

### Ahead-of-Time (AOT) Output to Native CSS:
```css
@property --nova-color-brand {
  syntax: "<color>";
  inherits: true;
  initial-value: oklch(62% 0.22 260);
}

@property --nova-spacing-md {
  syntax: "<length>";
  inherits: true;
  initial-value: 1rem;
}
```
*Benefit: Browser engines can interpolate, animate, and validate these values natively without JavaScript runtime intervention.*

---

## 4. Tier 2: Headless Behavioral Primitives

Every UI component is split into **Behavior** vs **Appearance**.
* No default opinionated styling is bundled with the logic.
* Fully keyboard accessible (WCAG 2.2 compliant).
* Leverages native HTML attributes (`popover`, `dialog`, `command`, `commandfor`).

### Example: Headless Accordion / Disclosure Logic
```typescript
import { signal } from './signals';

export interface DisclosureProps {
  defaultOpen?: boolean;
}

export function createDisclosure(props: DisclosureProps = {}) {
  const isOpen = signal(props.defaultOpen ?? false);

  const toggle = () => isOpen.value = !isOpen.value;
  const open = () => isOpen.value = true;
  const close = () => isOpen.value = false;

  return {
    isOpen,
    toggle,
    open,
    close,
    triggerProps: {
      'aria-expanded': isOpen,
      onClick: toggle,
    },
    panelProps: {
      hidden: () => !isOpen.value,
    }
  };
}
```

---

## 5. Tier 3: Visual Recipes & Scoped SCSS Modules

Styles are attached as modular **recipes** using native CSS `@scope`. This gives:
* **Zero Runtime Overhead:** No CSS-in-JS style injection in the browser.
* **No Class-Name Clashes:** The browser enforces encapsulation natively.
* **Variant Typing:** Component variants (e.g. `size: "sm" | "md" | "lg"`, `variant: "ghost" | "solid"`) are validated at compile time.

### Example: Component Recipe (`button.recipe.scss`)
```scss
@scope (.nova-button) to (.nova-button__slot) {
  :scope {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--nova-radii-sm);
    padding: var(--nova-spacing-sm) var(--nova-spacing-md);
    font-weight: 500;
    transition: background-color 150ms ease;

    &[data-variant="solid"] {
      background: var(--nova-color-brand);
      color: #fff;
    }

    &[data-variant="ghost"] {
      background: transparent;
      color: var(--nova-color-brand);
      &:hover {
        background: color-mix(in oklch, var(--nova-color-brand) 10%, transparent);
      }
    }

    &[data-size="sm"] {
      padding: var(--nova-spacing-xs) var(--nova-spacing-sm);
      font-size: 0.875rem;
    }
  }
}
```

---

## 6. Composition: The Developer Experience

When an engineer builds an interface, components are imported as cleanly decoupled, composable modules:

```typescript
import { createButton } from '@nova/primitives/button';
import { buttonRecipe } from '@nova/theme-default/button';

// Strongly-typed variant props validated at compile-time:
export const SubmitButton = (props) => {
  return createButton({
    recipe: buttonRecipe({ variant: 'solid', size: 'md' }),
    onClick: () => console.log('Submitted!'),
    children: 'Confirm Transaction'
  });
};
```

---

## 7. Modular Design Language Highlights

| Feature | How It Works | Advantage |
| :--- | :--- | :--- |
| **Tree-Shakeable Recipes** | Unused visual variants and components are eliminated at build-time | Zero unused CSS shipped to user. |
| **Theme Swapping via `@scope`** | Switch entire themes by applying `data-theme="dark"` on any sub-tree | No full-page re-renders; browser updates CSS variables instantly. |
| **Token Math with `calc()` & `color-mix()`** | Compute hover states, disabled states, and complementary tones dynamically | Eliminates hundreds of hardcoded hex codes. |
| **Headless + Skin Segregation** | Swap the visual skin (Material, Apple-like, Neo-Brutalist) without rewriting business logic | 100% reusable headless component library. |

---

## 8. Built-In Minimal & Artistic UI/UX Presets (`@zuari/presets`)

To make modular design effortless and intuitive with **simple, memorable English names**:

### Theme Presets (`ThemePresetName`)
* **`'paper'`**: Warm minimal art paper, charcoal ink text, and red studio stamp accent.
* **`'blossom'`**: Soft anime spring daylight, pastel pink blush, and clean sky tones.
* **`'matcha'`**: Calm botanical garden greens, soft sunlight, and natural warmth.
* **`'twilight'`**: Anime sunset dusk — deep indigo-violet sky with warm lantern amber glow.
* **`'midnight'`**: Deep spatial dark glass with luminous cyan accents.

### Lightweight Elevations (`ElevationPreset`)
* **`'flat'`**: Zero lift with a crisp `1px` subtle border.
* **`'soft'`**: Whisper-light `2px` paper lift for everyday cards and inputs.
* **`'float'`**: Smooth floating panel for popovers, menus, and active tiles.
* **`'halo'`**: Atmospheric top-layer glow for modals, dialogs, and command bars.

### Smooth Animation Presets (`AnimationPresetName`)
* **`'floatUp'`**, **`'popIn'`**, **`'slideIn'`**, **`'brushIn'`**, **`'softPulse'`**, and **`'ripple'`**, driven by native Web Animations API (`animatePreset` & `staggerPreset`).

### Ready-Made Templates
* **`createStoryCard`**, **`createBentoGrid`**, and **`createStampBadge`** for instant, cohesive layouts.

