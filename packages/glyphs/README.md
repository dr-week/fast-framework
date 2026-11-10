# `@zuari/glyphs`

Zuari's default SVG glyphs are available from the package root. For a broader
set of maintained, upstream icons, import the curated Lucide adapters from the
optional `@zuari/glyphs/lucide` subpath:

```ts
import { LucideActivityGlyph, LucideGridGlyph } from '@zuari/glyphs/lucide';

const activity = LucideActivityGlyph({ size: 24, title: 'Activity' });
const grid = LucideGridGlyph({ size: 20 });
```

The Lucide subpath is tree-shakeable and does not change the root glyph imports.
Icons are bundled locally under Lucide's ISC license; the app does not fetch
SVGs from a CDN at runtime.
