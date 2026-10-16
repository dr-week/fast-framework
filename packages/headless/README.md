# @nova/headless

> *Interactive behaviors without the 40KB of JavaScript math to figure out where a tooltip belongs.*

[![Size](https://img.shields.io/badge/Size-%3C2KB_gzipped-purple.svg?style=flat-square)](#)
[![Accessibility](https://img.shields.io/badge/A11y-WCAG_2.2-green.svg?style=flat-square)](#)
[![Anchor Positioning](https://img.shields.io/badge/Positioning-Native_CSS_Anchor-cyan.svg?style=flat-square)](#)

`@nova/headless` delivers accessible, unstyled behavioral logic for modern UI components.

Instead of bundling third-party positioning libraries that hijack the browser's scroll thread with continuous bounding-box calculations, `@nova/headless` pairs directly with **native CSS Anchor Positioning** (`anchor-name` / `position-anchor`).

---

## 📦 Installation

```bash
pnpm add @nova/headless
```

---

## 🚀 Features

### 1. Zero-JS Anchor Positioning (`anchor.ts`)
Generates unique anchor tokens and sets native CSS anchor rules directly on elements:

```typescript
import { generateAnchorName, setElementAnchor, tetherToAnchor } from '@nova/headless';

const trigger = document.createElement('button');
const popup = document.createElement('div');

const anchorToken = generateAnchorName('menu-anchor');
setElementAnchor(trigger, anchorToken);     // Sets style="anchor-name: --menu-anchor-1"
tetherToAnchor(popup, anchorToken);        // Sets style="position-anchor: --menu-anchor-1"
```

The browser handles scrolling, collision detection, and layout natively on the compositor thread.

---

### 2. Accessible Anchor Tooltips (`tooltip.ts`)
Creates a fully accessible tooltip linked to an anchor element with automatic `role="tooltip"`:

```typescript
import { createTooltip } from '@nova/headless';

const { tooltipElement, anchorName, id } = createTooltip({
  content: 'View workspace settings'
});
```

---

### 3. Tactile Glyph Buttons (`button.ts`)
Ties together reactive state signals, anchor positioning, and ARIA attributes in one clean primitive:

```typescript
import { signal } from '@nova/signals';
import { createGlyphButton } from '@nova/headless';

const isActive = signal(false);

const btn = createGlyphButton({
  label: 'Toggle AI Panel',
  tooltip: 'Command + K',
  active: isActive,
  onClick: () => {
    isActive.value = !isActive.value;
  }
});

document.body.appendChild(btn.buttonElement);
if (btn.tooltipElement) {
  document.body.appendChild(btn.tooltipElement);
}
```

---

## ⚖️ License
MIT
