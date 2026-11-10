import type { GlyphDefinition } from '@zuari/glyphs';
import {
  LucideActivityGlyph,
  LucideBarChartGlyph,
  LucideGridGlyph,
  LucideLayersGlyph,
  LucideMonitorGlyph,
  LucidePrinterGlyph,
  LucideSlidersGlyph,
  LucideSparklesGlyph
} from '@zuari/glyphs/lucide';
import type { ActiveTab } from '../state.js';

export interface FeatureCardDefinition {
  id: ActiveTab;
  icon: GlyphDefinition;
  category: string;
  title: string;
  summary: string;
  mission: string;
  lesson: string;
}

export interface FeatureDeckOptions {
  getActiveTab: () => ActiveTab;
  onSelect: (tab: ActiveTab) => void;
  onOpenDemo: () => void;
  onInteraction: () => void;
}

export const FEATURE_CARDS: readonly FeatureCardDefinition[] = [
  {
    id: 'repl',
    icon: LucideActivityGlyph,
    category: 'SIGNALS + DOM',
    title: 'Signal Playground',
    summary: 'Change a signal and watch its real DOM bindings respond.',
    mission: 'Increment a value in the live editor and follow its computed signals into the page.',
    lesson: 'Fine-grained reactivity without a virtual DOM.'
  },
  {
    id: 'bench',
    icon: LucideBarChartGlyph,
    category: 'PERFORMANCE LAB',
    title: 'Scale Bench',
    summary: 'Put thousands of direct updates through their paces.',
    mission: 'Run the 5,000-node benchmark and compare the measured update times.',
    lesson: 'Measure real work on demand; no decorative performance claims.'
  },
  {
    id: 'hardware',
    icon: LucidePrinterGlyph,
    category: 'HARDWARE DECK',
    title: 'Device Control',
    summary: 'Try the controls built for specialized screens and inputs.',
    mission: 'Switch a device profile and operate its controls, from D-pad to telemetry.',
    lesson: 'The same signal model can drive hardware-focused interfaces.'
  },
  {
    id: 'core',
    icon: LucideSparklesGlyph,
    category: 'VECTOR MOTION',
    title: 'Motion Forge',
    summary: 'Morph a vector glyph through four lively states.',
    mission: 'Click or press Enter on the glyph to cycle through its animated shapes.',
    lesson: 'SVG motion stays crisp and keyboard accessible.'
  },
  {
    id: 'spatial',
    icon: LucideLayersGlyph,
    category: 'SPATIAL UI',
    title: 'Spatial Field',
    summary: 'Explore a radar-inspired view of spatial anchors.',
    mission: 'Follow the moving sweep and locate the anchors across the scene.',
    lesson: 'A familiar DOM can present spatial interface concepts.'
  },
  {
    id: 'wasm',
    icon: LucideMonitorGlyph,
    category: 'SYSTEMS WORKBENCH',
    title: 'Memory Bridge',
    summary: 'Explore native memory, Wasm, and polyglot tooling.',
    mission: 'Edit a value and inspect the typed memory and systems-language output.',
    lesson: 'Connect interface state to low-level data without copying buffers.'
  },
  {
    id: 'tokens',
    icon: LucideSlidersGlyph,
    category: 'COLOR LAB',
    title: 'Token Tuner',
    summary: 'Drag the chroma control and remix the live accent.',
    mission: 'Tune the OKLCH slider and watch the active accent shift with it.',
    lesson: 'Typed design tokens make themes interactive and reusable.'
  },
  {
    id: 'alliances',
    icon: LucideGridGlyph,
    category: 'FRAMEWORK MAP',
    title: 'Ecosystem Map',
    summary: 'See how the framework connects across platforms.',
    mission: 'Explore the integrations and choose another station to try hands-on.',
    lesson: 'A modular toolkit can scale from browser UI to connected platforms.'
  }
];
