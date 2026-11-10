# Zuari Playground: memorable feature tour

## Product goal

Turn the public playground into a guided, hands-on tour of Zuari. A visitor should quickly understand what the framework does, try several real features without installing anything, see the code-level idea behind each demo, and find the GitHub repository and starter command.

The experience should feel expressive and tactile: editorial dark glass, spectral accent colors, confident type, clear data hierarchy, pointer-aware light, and short transitions. It should stay useful as a technical product page, work with touch and keyboard, and never make performance claims that the demos do not measure.

## Visitor journey

1. **Arrive:** a concise hero says what Zuari is and offers “Try the playground” and “Explore the source”.
2. **Choose a mission:** a responsive, color-tinted flash-card deck introduces each feature with a small visual preview.
3. **Play and learn:** visitors flip a card to reveal a short mission and learning goal, then launch the matching hands-on demo. A small progress meter tracks stations explored.
4. **Continue:** visitors can copy a starter command, open the repository, and read the framework/AI reference material.

## Demonstration concepts

| Station | Framework capability | Interaction idea | What the visitor learns |
| --- | --- | --- | --- |
| **Signal Circuit** | `@zuari/signals`, `batch()`, `@zuari/dom` | Route a pulse through a small node grid; switch several linked signals in one batch and watch the DOM update directly. | Fine-grained updates, batching, and zero-VDOM rendering. |
| **Motion Forge** | `@zuari/glyphs`, `@zuari/presets` | Click through glyph morph states; hover the scene to move a light field and reveal depth. | Vector animation and tactile UI feedback. |
| **Scale Bench** | signals + keyed DOM updates | Increase a real node set, run a benchmark only on demand, and show measured time and count. | Update cost and honest, reproducible measurements. |
| **Hardware Deck** | `@zuari/hardware/*` | Change the active profile among drone, tactical, D-Pad, and display; operate the relevant control. | The shared framework can target specialized inputs and displays. |
| **Spatial Field** | `@zuari/spatial` | Place and move a small set of anchor points in a radar/HUD scene. | Spatial transforms and head-locked presentation concepts. |
| **Memory Bridge** | `@zuari/wasm` | Edit bytes and observe the typed memory view update. | Zero-copy `ArrayBuffer` / `DataView` integration. |
| **Color Lab** | `@zuari/tokens`, `@zuari/presets` | Adjust an OKLCH accent, theme, and surface; preview contrast and component states. | Theme tokens are live inputs to a reusable UI system. |

Start with a compact first release: the hero, responsive feature navigation, Signal Circuit, Motion Forge, and the existing REPL/benchmark/hardware/Wasm/token demos. Keep each station short, self-explanatory, and independently selectable. Add the remaining examples once the core architecture is stable.

## Interaction and motion direction

- Use pointer coordinates for a soft light spot and a small perspective response only in `hover: hover` / `pointer: fine` environments. Touch and keyboard users get the same content and controls without hover dependencies.
- Keep the feature deck playful but useful: cards expose a concrete interaction and package concept; flipping is a discovery cue, not a gate to the demo.
- Provide an explicit light/mood control. Randomness is user-triggered and constrained to a small curated palette, so the page can feel fresh without changing on its own or harming readability.
- Use short entrance and state-change transitions to guide attention. Use persistent movement only for an active simulation, not as decoration across the whole page.
- Run continuous animation with `requestAnimationFrame` only while a demo is active; stop or pause it when the page is hidden or the station is inactive. Do not run an animation loop that competes with benchmark results.
- Keep reduced-motion behavior aligned with the platform preference and provide a still visual state. Motion is supplemental; feature data and state remain understandable without it.
- Keep the motion palette, buttons, cards, and charts opt-in/reusable through Zuari presets rather than page-specific framework replacements.

This direction follows the W3C guidance to let people suppress non-essential interaction motion through `prefers-reduced-motion` and MDN guidance to reduce unnecessary animations and provide a user control when motion is continuous. See [WAI technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html), [MDN accessibility media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility), and [MDN animation performance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS).

## Code organization

Use the framework in the product tour rather than recreating its primitives:

- Keep `playground/src/main.ts` as a small composition entry point; place page sections under `playground/src/features/`.
- Group hero, navigation, telemetry, and each showcase station in feature folders. Keep REPL, benchmark, hardware, community, and polyglot implementations in their own folders.
- Use `playground/src/style.scss` as the SCSS entry point and `playground/src/styles/` for shared tokens plus page, showcase, and responsive partials.
- Keep original artwork as optimized local assets under `playground/public/images/arcade/`; map images to the feature they support and use subdued blend modes, tinted glows, and feathered masks so controls and code remain legible.
- For features with distinct responsibilities, keep data in `model.ts`, DOM construction in `view.ts`, interaction wiring in `controller.ts`, and compose them through a small feature `index.ts`. Group multi-part feature styles into named partials by concern, such as layout, cards, responsive rules, and motion.
- Keep each interactive station's state and event handlers in its own TypeScript module. The showcase coordinator only selects and mounts those station views.
- Use `@zuari/signals` and `@zuari/dom` for app state and direct DOM composition; `@zuari/glyphs` for navigation/action iconography; `@zuari/recipes` for reusable framework styling.
- No React, JSX, or third-party icon CDN in the showcase shell. Keep product-specific demo calculations in their owning feature module.

## GitHub publishing path

The repository builds `playground` to `playground/dist` and has a GitHub Pages workflow triggered by pushes to `main`. Publish feature work to a branch on a remote where the contributor has write access, then review and merge it through a pull request. The public Pages URL updates after the changes reach `main` and the Pages workflow succeeds; pushing only a feature branch does not update the live site. A repository's local Git identity affects new commits only; it does not rewrite existing commit history.

## Completion criteria

- The page communicates its value and leads naturally into working demos.
- A keyboard-accessible flash-card deck makes all feature stations easy to scan, reveal, launch, and revisit.
- Each featured interaction calls a real Zuari API and includes a short explanation.
- SCSS and TypeScript are divided by feature folders; `main.ts` composes features instead of containing their full implementations.
- The site adapts to narrow/touch layouts; all actions are usable with keyboard and have visible focus.
- Reduced-motion users get a calm, complete experience. Background animation does not distort benchmark results.
- Numeric performance claims are linked to the benchmark that measured them or removed from decorative artwork.
- The GitHub Pages build succeeds. Merge to `main` triggers publication at the existing site URL.
