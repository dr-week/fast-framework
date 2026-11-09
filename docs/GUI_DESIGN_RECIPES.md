# GUI design recipes

Zuari's `studio` theme and liquid-glass recipes package reusable patterns from the Unfollower GUI and the visual references: warm ambient color fields, rounded translucent surfaces, bright glass edges, gradient primary actions, restrained accent glow, and short interaction transitions. They are framework primitives; app names, workflows, data, and persistence remain in the consuming product.

## Use the Studio theme

Install the design tokens, presets, and recipes packages. Load the optional CSS recipe bundle and apply the theme to the document or a scoped root:

```ts
import { createDesignPresets } from '@zuari/presets';
import '@zuari/recipes/aether.css';

const design = createDesignPresets({
  theme: 'studio',
  elevation: 'soft',
  spacing: 'balanced',
  surface: 'liquid'
});
```

`studio` sets a warm daylight canvas, coral-to-rose gradient accents, readable accent text, and glass-friendly elevation. Choose `midnight`, `paper`, `blossom`, `matcha`, or `twilight` for other palettes. Any theme can override `accent`, `accentSecondary`, `accentGlow`, and `onAccent` through the theme contract.

## Compose a canvas, surface, and action

```ts
import { createButton } from '@zuari/ui/button';

const page = document.createElement('main');
page.className = 'zuari-app-canvas';

const panel = document.createElement('section');
panel.className = 'zuari-surface-liquid';
panel.dataset.zuariTint = 'rose'; // rose, sky, amber, or mint
panel.dataset.zuariElevation = 'soft';

const save = createButton({ label: 'Save changes', variant: 'primary' });
panel.append(save.element);
page.append(panel);
document.body.append(page);
```

The button recipe styles the semantic element created by `createButton`. It includes gradient primary actions, restrained hover glow, secondary/ghost/danger variants, visible keyboard focus, disabled/loading states, and reduced-motion handling. `zuari-app-canvas`, `zuari-surface-frosted`, `zuari-surface-liquid`, `zuari-accent-glow`, and `zuari-prism-glow` are opt-in classes, so existing applications keep their current styling until they choose these recipes.

## Portable visual rules

- Use one primary gradient for the main positive action; keep secondary actions quiet or outlined.
- Use the glow as a hover or focus cue, not as a permanent shadow on every control.
- Separate the ambient page canvas from crisp, bordered glass surfaces; reserve the brightest glints for selected or active elements.
- Keep transitions short and honor `prefers-reduced-motion`.
- Keep app-specific theme persistence and feature behavior in the application layer.
